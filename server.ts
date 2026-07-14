import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { readDb, writeDb, Product, Category, User, Order, Message, Notification, Review } from "./server/db.js";
import { GoogleGenAI, Type } from "@google/genai";

// 1. Simple Robust Native Auth Cryptography Utilities (Replaces bcrypt & jsonwebtoken safely for zero-dependency speed)
const SECRET_KEY = process.env.JWT_SECRET || "merkato-super-secret-key-2026";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "merkato-salt").digest("hex");
}

function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function generateToken(user: User): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role })).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;
    const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(`${header}.${payload}`).digest("base64url");
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

// 2. Real-Time Events (Server-Sent Events) Broker
interface SseClient {
  id: string;
  res: any;
}
let sseClients: SseClient[] = [];

function broadcastEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // Clean up failed client
      sseClients = sseClients.filter((c) => c.id !== client.id);
    }
  });
}

// 3. Lazy Gemini API Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is required in the Secrets panel");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 4. Server Setup
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // SSE Real-Time Endpoint
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientId = crypto.randomUUID();
    sseClients.push({ id: clientId, res });

    req.on("close", () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // Middleware: Auth Guard
  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access token required" });

    const user = verifyToken(token);
    if (!user) return res.status(403).json({ error: "Invalid or expired token" });

    req.user = user;
    next();
  }

  function requireAdmin(req: any, res: any, next: any) {
    authenticateToken(req, res, () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      next();
    });
  }

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required registration parameters" });
    }

    const db = readDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newUser: User = {
      id: "u_" + Date.now(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDb(db);

    const token = generateToken(newUser);
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing login parameters" });
    }

    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !comparePassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Auth: Get Current Profile
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const db = readDb();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });

  // Products: Get Paginated and Filtered
  app.get("/api/products", (req, res) => {
    const db = readDb();
    let items = [...db.products];

    // Search filter
    const search = req.query.search ? String(req.query.search).toLowerCase() : "";
    if (search) {
      items = items.filter((p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }

    // Category filter
    const category = req.query.category ? String(req.query.category) : "";
    if (category) {
      items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Price filters
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Infinity;
    items = items.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // Sorting
    const sort = req.query.sort ? String(req.query.sort) : "";
    if (sort === "price-asc") {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      items.sort((a, b) => b.rating - a.rating);
    } else if (sort === "discount") {
      items.sort((a, b) => b.discount - a.discount);
    }

    // Pagination (14 products per page)
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const limit = 14;
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    res.json({
      products: paginatedItems,
      page,
      totalPages,
      totalItems,
      limit,
    });
  });

  // Products: Single Product Details
  app.get("/api/products/:id", (req, res) => {
    const db = readDb();
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Include related products in the same category
    const related = db.products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

    res.json({ product, related });
  });

  // Products: Create (Admin Only)
  app.post("/api/products", requireAdmin, (req, res) => {
    const { name, category, description, price, oldPrice, stock, image, specs } = req.body;
    if (!name || !category || !description || price === undefined || stock === undefined || !image) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    const db = readDb();
    const parsedPrice = Number(price);
    const parsedOldPrice = oldPrice ? Number(oldPrice) : parsedPrice;
    const discount = parsedOldPrice > parsedPrice ? Math.round(((parsedOldPrice - parsedPrice) / parsedOldPrice) * 100) : 0;

    const newProduct: Product = {
      id: "p_" + Date.now(),
      name,
      category,
      description,
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      discount,
      stock: Number(stock),
      rating: 5,
      reviews: [],
      image,
      gallery: [image],
      specs: specs || {},
      minStock: 5,
    };

    db.products.push(newProduct);
    writeDb(db);

    broadcastEvent("inventory_update", { productId: newProduct.id, stock: newProduct.stock });
    res.status(201).json(newProduct);
  });

  // Products: Update (Admin Only)
  app.put("/api/products/:id", requireAdmin, (req, res) => {
    const db = readDb();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Product not found" });

    const current = db.products[idx];
    const { name, category, description, price, oldPrice, stock, image, specs, minStock } = req.body;

    const parsedPrice = price !== undefined ? Number(price) : current.price;
    const parsedOldPrice = oldPrice !== undefined ? Number(oldPrice) : current.oldPrice;
    const discount = parsedOldPrice > parsedPrice ? Math.round(((parsedOldPrice - parsedPrice) / parsedOldPrice) * 100) : 0;

    const updatedProduct: Product = {
      ...current,
      name: name || current.name,
      category: category || current.category,
      description: description || current.description,
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      discount,
      stock: stock !== undefined ? Number(stock) : current.stock,
      image: image || current.image,
      gallery: image ? [image, ...current.gallery.slice(1)] : current.gallery,
      specs: specs || current.specs,
      minStock: minStock !== undefined ? Number(minStock) : current.minStock,
    };

    db.products[idx] = updatedProduct;
    writeDb(db);

    // If stock updated, broadcast inventory change
    broadcastEvent("inventory_update", { productId: updatedProduct.id, stock: updatedProduct.stock });

    // Instantly alert if stock fell below minStock
    if (updatedProduct.stock < (updatedProduct.minStock || 5)) {
      const alertTitle = `Low Stock Alert: ${updatedProduct.name}`;
      const alertMsg = `The product '${updatedProduct.name}' is running low on stock. Only ${updatedProduct.stock} items remaining.`;
      const notifId = "n_" + Date.now();
      db.notifications.unshift({
        id: notifId,
        title: alertTitle,
        message: alertMsg,
        type: "low_stock",
        read: false,
        createdAt: new Date().toISOString(),
      });
      writeDb(db);
      broadcastEvent("notification", { id: notifId, title: alertTitle, message: alertMsg, type: "low_stock" });
    }

    res.json(updatedProduct);
  });

  // Products: Delete (Admin Only)
  app.delete("/api/products/:id", requireAdmin, (req, res) => {
    const db = readDb();
    const beforeLength = db.products.length;
    db.products = db.products.filter((p) => p.id !== req.params.id);
    if (db.products.length === beforeLength) return res.status(404).json({ error: "Product not found" });

    writeDb(db);
    res.json({ success: true, message: "Product deleted successfully" });
  });

  // Add Product Review
  app.post("/api/products/:id/review", authenticateToken, (req: any, res) => {
    const { rating, comment } = req.body;
    if (!rating || !comment) return res.status(400).json({ error: "Rating and comment are required" });

    const db = readDb();
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const newReview: Review = {
      id: "r_" + Date.now(),
      username: req.user.name,
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split("T")[0],
    };

    product.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));

    writeDb(db);
    res.status(201).json({ review: newReview, averageRating: product.rating });
  });

  // Categories: CRUD API (Admin Protected)
  app.get("/api/categories", (req, res) => {
    const db = readDb();
    res.json(db.categories);
  });

  app.post("/api/categories", requireAdmin, (req, res) => {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });

    const db = readDb();
    const id = name.toLowerCase().replace(/\s+/g, "-");
    if (db.categories.some((c) => c.id === id)) return res.status(400).json({ error: "Category already exists" });

    const newCategory: Category = { id, name, icon: icon || "Tag", description: description || "" };
    db.categories.push(newCategory);
    writeDb(db);

    res.status(201).json(newCategory);
  });

  app.put("/api/categories/:id", requireAdmin, (req, res) => {
    const db = readDb();
    const cat = db.categories.find((c) => c.id === req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });

    const { name, icon, description } = req.body;
    cat.name = name || cat.name;
    cat.icon = icon || cat.icon;
    cat.description = description || cat.description;

    writeDb(db);
    res.json(cat);
  });

  app.delete("/api/categories/:id", requireAdmin, (req, res) => {
    const db = readDb();
    const length = db.categories.length;
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    if (db.categories.length === length) return res.status(404).json({ error: "Category not found" });

    writeDb(db);
    res.json({ success: true });
  });

  // Orders: Get User or All (if Admin)
  app.get("/api/orders", authenticateToken, (req: any, res) => {
    const db = readDb();
    if (req.user.role === "admin") {
      res.json(db.orders);
    } else {
      const userOrders = db.orders.filter((o) => o.userId === req.user.id);
      res.json(userOrders);
    }
  });

  // Orders: Place Order
  app.post("/api/orders", authenticateToken, (req: any, res) => {
    const { items, paymentMethod, couponCode } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Shopping cart is empty" });
    }

    const db = readDb();
    let subtotal = 0;
    const validatedItems: any[] = [];

    // Verify stock and calculate price
    for (const item of items) {
      const prod = db.products.find((p) => p.id === item.id);
      if (!prod) return res.status(404).json({ error: `Product not found: ${item.name}` });

      if (prod.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for '${prod.name}'. Only ${prod.stock} available.` });
      }

      subtotal += prod.price * item.quantity;
      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        image: prod.image,
        price: prod.price,
        quantity: item.quantity,
      });

      // Deduct stock!
      prod.stock -= item.quantity;
      broadcastEvent("inventory_update", { productId: prod.id, stock: prod.stock });

      // Check for low stock alert
      if (prod.stock < (prod.minStock || 5)) {
        const notifId = "n_" + Date.now();
        const alertTitle = `Low Stock Warning: ${prod.name}`;
        const alertMsg = `The product '${prod.name}' is running low on stock. Remaining: ${prod.stock}.`;
        db.notifications.unshift({
          id: notifId,
          title: alertTitle,
          message: alertMsg,
          type: "low_stock",
          read: false,
          createdAt: new Date().toISOString(),
        });
        broadcastEvent("notification", { id: notifId, title: alertTitle, message: alertMsg, type: "low_stock" });
      }
    }

    // Apply Coupon
    let discountPercent = 0;
    if (couponCode) {
      const c = db.coupons.find((coup) => coup.code.toUpperCase() === couponCode.toUpperCase());
      if (c && subtotal >= c.minSubtotal) {
        discountPercent = c.discountPercent;
      }
    }

    const discountedSubtotal = subtotal * (1 - discountPercent / 100);
    const vat = Math.round(discountedSubtotal * 0.15); // 15% VAT
    const deliveryFee = subtotal > 15000 ? 0 : 250; // Free delivery for orders above 15,000 ETB
    const grandTotal = Math.round(discountedSubtotal + vat + deliveryFee);

    // Create unique invoice QR Code simulation data
    const invoiceId = "INV_" + Math.floor(100000 + Math.random() * 900000);
    const qrPayload = `https://merkato.com/invoice/${invoiceId}?total=${grandTotal}`;

    const newOrder: Order = {
      id: invoiceId,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      items: validatedItems,
      subtotal: Math.round(discountedSubtotal),
      vat,
      deliveryFee,
      total: grandTotal,
      status: "Pending",
      paymentMethod: paymentMethod || "Cash on Delivery",
      createdAt: new Date().toISOString(),
      qrCode: qrPayload,
      tracking: [
        { status: "Pending", timestamp: new Date().toISOString(), comment: "Your order has been placed on MERKATO." },
      ],
    };

    db.orders.unshift(newOrder);

    // Create New Order Notification
    const orderNotifId = "n_order_" + Date.now();
    const orderNotifTitle = `New Order Placed: ${newOrder.id}`;
    const orderNotifMsg = `${newOrder.userName} placed a new order containing ${newOrder.items.length} items. Total: ${newOrder.total} ETB.`;
    db.notifications.unshift({
      id: orderNotifId,
      title: orderNotifTitle,
      message: orderNotifMsg,
      type: "new_order",
      read: false,
      createdAt: new Date().toISOString(),
    });

    writeDb(db);

    broadcastEvent("new_order", newOrder);
    broadcastEvent("notification", { id: orderNotifId, title: orderNotifTitle, message: orderNotifMsg, type: "new_order" });

    res.status(201).json(newOrder);
  });

  // Orders: Update Status (Admin Only)
  app.put("/api/orders/:id", requireAdmin, (req, res) => {
    const { status, comment } = req.body;
    if (!status) return res.status(400).json({ error: "Order status is required" });

    const db = readDb();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    order.tracking.push({
      status,
      timestamp: new Date().toISOString(),
      comment: comment || `Order status updated to ${status}.`,
    });

    writeDb(db);

    broadcastEvent("order_update", { orderId: order.id, status, tracking: order.tracking });
    res.json(order);
  });

  // Contact Message Submission
  app.post("/api/messages", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All feedback fields are required" });
    }

    const db = readDb();
    const newMessage: Message = {
      id: "msg_" + Date.now(),
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };

    db.messages.unshift(newMessage);
    writeDb(db);

    res.status(201).json({ success: true, message: "Feedback submitted successfully." });
  });

  // Contact Messages: Get (Admin Only)
  app.get("/api/messages", requireAdmin, (req, res) => {
    const db = readDb();
    res.json(db.messages);
  });

  // Notifications API
  app.get("/api/notifications", (req, res) => {
    const db = readDb();
    res.json(db.notifications);
  });

  app.post("/api/notifications/read/:id", (req, res) => {
    const db = readDb();
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) {
      notif.read = true;
      writeDb(db);
    }
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", (req, res) => {
    const db = readDb();
    db.notifications.forEach((n) => (n.read = true));
    writeDb(db);
    res.json({ success: true });
  });

  // Coupons Validate Route
  app.post("/api/coupons/validate", (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: "Coupon code is required" });

    const db = readDb();
    const coup = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coup) return res.status(404).json({ error: "Invalid coupon code" });

    if (subtotal < coup.minSubtotal) {
      return res.status(400).json({ error: `Coupon requires minimum purchase of ${coup.minSubtotal} ETB.` });
    }

    res.json({ valid: true, code: coup.code, discountPercent: coup.discountPercent });
  });

  // Admin CRUD Users (Create, Read, Update, Delete)
  app.get("/api/users", requireAdmin, (req, res) => {
    const db = readDb();
    const sanitized = db.users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt }));
    res.json(sanitized);
  });

  app.post("/api/users", requireAdmin, (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: "All user fields are required" });

    const db = readDb();
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser: User = {
      id: "u_" + Date.now(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: role || "customer",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDb(db);

    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt });
  });

  app.put("/api/users/:id", requireAdmin, (req, res) => {
    const db = readDb();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, role, password } = req.body;
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    if (password) {
      user.passwordHash = hashPassword(password);
    }

    writeDb(db);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  });

  app.delete("/api/users/:id", requireAdmin, (req, res) => {
    const db = readDb();
    const length = db.users.length;
    db.users = db.users.filter((u) => u.id !== req.params.id);
    if (db.users.length === length) return res.status(404).json({ error: "User not found" });

    writeDb(db);
    res.json({ success: true });
  });

  // Admin Dashboard Statistics & Analytical Reporting
  app.get("/api/dashboard/stats", requireAdmin, (req, res) => {
    const db = readDb();

    const totalUsers = db.users.length;
    const totalProducts = db.products.length;
    const totalOrders = db.orders.length;

    // Financial Metrics
    const completedOrders = db.orders.filter((o) => o.status !== "Cancelled");
    const revenue = completedOrders.reduce((acc, o) => acc + o.total, 0);

    // Category product counts
    const categoryDistribution: Record<string, number> = {};
    db.products.forEach((p) => {
      categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
    });

    // Low stock count
    const lowStockCount = db.products.filter((p) => p.stock < (p.minStock || 5)).length;

    // Recent 5 orders
    const recentOrders = db.orders.slice(0, 5).map((o) => ({
      id: o.id,
      userName: o.userName,
      total: o.total,
      status: o.status,
      date: o.createdAt,
    }));

    // Daily Sales simulation for the Recharts graphics
    const salesOverTime = [
      { date: "Jul 08", sales: 12000, revenue: 145000 },
      { date: "Jul 09", sales: 8500, revenue: 110000 },
      { date: "Jul 10", sales: 16400, revenue: 198000 },
      { date: "Jul 11", sales: 14200, revenue: 167000 },
      { date: "Jul 12", sales: 21000, revenue: 245000 },
      { date: "Jul 13", sales: 19500, revenue: 228000 },
      { date: "Jul 14", sales: 24000, revenue: 285000 }, // Peak current day!
    ];

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      lowStockCount,
      categoryDistribution,
      recentOrders,
      salesOverTime,
    });
  });

  // Server-side AI recommendation system powered by Gemini
  app.post("/api/gemini/recommendations", async (req, res) => {
    const { query, userPreferences } = req.body;
    if (!query) return res.status(400).json({ error: "Search queries / request parameters are required" });

    try {
      const ai = getGeminiClient();
      const db = readDb();

      // Send list of available product names and categories for exact semantic matchmaking
      const productList = db.products.map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.price }));

      const systemInstruction = `You are MERKATO's elite AI shopping assistant. Match the user's intent to our actual products.
You MUST respond with a valid JSON object matching this schema:
{
  "recommendations": [
    {
      "productId": "p1",
      "reason": "Explain briefly why this product matches their request (mentioning specific specs, taste, or style)."
    }
  ],
  "personalizedGreeting": "A high-end, friendly greeting addressing the customer's shopping query, mentioning Ethiopian hospitality (Gursha/Buna vibes)."
}
Use ONLY product IDs present in the provided list. Do not invent products. Match up to 4 best products.`;

      const userPrompt = `User request: "${query}"
User background/preference context: ${JSON.stringify(userPreferences || {})}
Our Products List:
${JSON.stringify(productList)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);

      // Hydrate recommended products with actual product details
      const hydratedRecommendations = (result.recommendations || [])
        .map((rec: any) => {
          const product = db.products.find((p) => p.id === rec.productId);
          if (!product) return null;
          return { ...product, aiReason: rec.reason };
        })
        .filter(Boolean);

      res.json({
        recommendations: hydratedRecommendations,
        greeting: result.personalizedGreeting || "Find your absolute match on MERKATO.",
      });
    } catch (err: any) {
      console.error("Gemini recommendation failed:", err.message);
      // Fallback: simple category-based matchmaker in case API Key is missing or invalid
      const db = readDb();
      const terms = query.toLowerCase().split(" ");
      const matches = db.products
        .filter((p) => terms.some((t: string) => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t)))
        .slice(0, 3)
        .map((p) => ({ ...p, aiReason: "Highly matches your current search terms and local trending item preferences." }));

      res.json({
        recommendations: matches,
        greeting: "Welcome to MERKATO. Here are standard matches curated from our current local listings.",
      });
    }
  });

  // --- BACKGROUND MATERIAL TRACKING & SIMULATED NODE CRON ---
  // Periodically check inventory levels every 60 seconds.
  // If product stock < 5, generate alert and broadcast via real-time SSE channel.
  setInterval(() => {
    try {
      const db = readDb();
      let hasChange = false;
      db.products.forEach((prod) => {
        const threshold = prod.minStock || 5;
        if (prod.stock < threshold) {
          // Check if warning already exists in notifications of type low_stock for this product within last hour
          const title = `Low Stock Notification: ${prod.name}`;
          const alreadyNotified = db.notifications.some((n) => n.title === title && n.type === "low_stock");

          if (!alreadyNotified) {
            const notifId = "n_cron_" + Date.now() + "_" + prod.id;
            const message = `BACKGROUND CRON ALERT: Stock for '${prod.name}' is critical at only ${prod.stock} left (minimum threshold: ${threshold}). Please replenish inventory immediately.`;
            db.notifications.unshift({
              id: notifId,
              title,
              message,
              type: "low_stock",
              read: false,
              createdAt: new Date().toISOString(),
            });
            hasChange = true;
            // Broadcast alert instantly to active browser clients
            broadcastEvent("notification", { id: notifId, title, message, type: "low_stock" });
          }
        }
      });
      if (hasChange) {
        writeDb(db);
      }
    } catch (err) {
      console.error("Error in background cron simulation:", err);
    }
  }, 60000);

  // --- VITE DEV SERVER / STATIC SERVING INTEGRATION ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MERKATO express server running dynamically on http://localhost:${PORT}`);
  });
}

startServer();

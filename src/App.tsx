import React, { useState, useEffect } from "react";
import { 
  Heart, ShoppingCart, Search, Tv, Smartphone, Laptop, Shirt, 
  Sparkles, Coffee, Dumbbell, Tag, Grid, Star, MessageSquareCode,
  ShieldCheck, HelpCircle, Phone, Mail, ArrowRight, RefreshCw, Layers, CheckCircle2
} from "lucide-react";
import { Product, Category, Notification, User } from "./types";
import { api } from "./api";

// Sub components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import RecommendationSection from "./components/RecommendationSection";
import ProductDetails from "./components/ProductDetails";
import CartView from "./components/CartView";
import WishlistView from "./components/WishlistView";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import LoginRegister from "./components/LoginRegister";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  // Core state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Search & Catalog Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 250000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // App initialization
  useEffect(() => {
    // 1. Theme check
    const savedTheme = (localStorage.getItem("merkato_theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 2. Fetch User & Data
    const initApp = async () => {
      try {
        const loggedUser = await api.auth.me();
        if (loggedUser) setUser(loggedUser);

        const [cats, prodsRes] = await Promise.all([
          api.categories.list(),
          api.products.list({ page: 1 }),
        ]);
        setCategories(cats);
        setProducts(prodsRes.products || []);
        setTotalPages(prodsRes.totalPages || 1);

        const notifs = await api.notifications.list();
        setNotifications(notifs);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };
    initApp();

    // 3. SSE Real-Time Event Stream subscription
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "initial_notifs") {
          setNotifications(data.notifications);
        } else if (data.type === "low_stock_broadcast" || data.type === "new_order_broadcast") {
          // Add notification to top of list
          setNotifications((prev) => [data.notification, ...prev]);
          // Refresh products to ensure active stocks are synchronized
          refreshCatalog();
        }
      } catch (err) {
        console.error("Failed to parse event message:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const refreshCatalog = async () => {
    try {
      const prodsRes = await api.products.list({
        page: currentPage,
        search: searchQuery,
        category: selectedCategory === "all" ? "" : selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sort: sortOption,
      });
      setProducts(prodsRes.products || []);
      setTotalPages(prodsRes.totalPages || 1);
    } catch (err) {
      console.error("Failed to refresh catalog:", err);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, [currentPage, selectedCategory, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refreshCatalog();
    setCurrentView("products");
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const newQuantity = Math.min(product.stock, prev[existingIdx].quantity + quantity);
        const updated = [...prev];
        updated[existingIdx] = { ...prev[existingIdx], quantity: newQuantity };
        return updated;
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });

    // Create system notification
    const newNotif: Notification = {
      id: Math.random().toString(),
      title: "Basket Updated",
      message: `${quantity}x '${product.name}' added to shopping cart!`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleMoveToCart = (product: Product) => {
    setWishlist((prev) => prev.filter((item) => item.id !== product.id));
    handleAddToCart(product, 1);
  };

  // Theme Toggler
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("merkato_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Notifications clear
  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Logout trigger
  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setCurrentView("home");
  };

  // Contact Message form submission
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.messages.create(contactForm);
      setContactSuccess(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      alert("Failed to submit inquiry.");
    }
  };

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    if (id) {
      setSelectedProductId(id);
    }
  };

  // Map category icons helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Tv": return <Tv size={20} />;
      case "Smartphone": return <Smartphone size={20} />;
      case "Laptop": return <Laptop size={20} />;
      case "Shirt": return <Shirt size={20} />;
      case "Coffee": return <Coffee size={20} />;
      case "Tag": return <Tag size={20} />;
      default: return <Layers size={20} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 transition-colors dark:bg-dark-900 dark:text-gray-100">
      
      {/* 1. Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        user={user}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 2. Main Content Stage */}
      <main className="flex-1 pb-16">

        {currentView === "home" && (
          /* HOME VIEW */
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-12">
            
            {/* Promotional Slide Hero */}
            <Hero onNavigate={handleNavigate} />

            {/* Core Search Bar Panel */}
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 dark:bg-dark-800 dark:border-gray-800 text-center flex flex-col gap-4 items-center">
              <h2 className="font-display text-lg font-bold">Search Piazza Specialty Highlands Sourcing & Flagship Tech</h2>
              <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full max-w-xl">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search over 42 organic specialties & gadgets..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-dark-900 dark:text-white"
                  />
                  <Search size={14} className="absolute right-3.5 top-3.5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 text-xs font-semibold text-white shadow hover:from-amber-600 hover:to-yellow-600"
                >
                  Find Sourcing
                </button>
              </form>
            </div>

            {/* Sourcing Categories Carousel */}
            <div>
              <h3 className="font-display text-base font-bold mb-4">Direct Ethiopian Sourcing Categories</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentView("products");
                  }}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all text-left ${
                    selectedCategory === "all"
                      ? "border-amber-500 bg-amber-50/25 dark:bg-amber-950/10"
                      : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-dark-800"
                  }`}
                >
                  <Grid size={20} className="text-amber-500" />
                  <div>
                    <p className="text-xs font-bold">All Products</p>
                    <p className="text-[10px] text-gray-400">View entire list</p>
                  </div>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentView("products");
                    }}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all text-left ${
                      selectedCategory === cat.name
                        ? "border-amber-500 bg-amber-50/25 dark:bg-amber-950/10"
                        : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-dark-800"
                    }`}
                  >
                    <span className="text-amber-500">{getCategoryIcon(cat.icon)}</span>
                    <div>
                      <p className="text-xs font-bold capitalize">{cat.name}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[80px]">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Sourcing showcase */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold">Specialty Best Sellers</h3>
                  <p className="text-xs text-gray-400 font-light">Directly verified single-origin highlands coffee and handcrafted luxury.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCurrentView("products");
                  }}
                  className="text-xs font-semibold text-amber-500 hover:underline"
                >
                  View All Marketplace
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                {products.slice(0, 4).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isWishlisted={wishlist.some((w) => w.id === prod.id)}
                    onNavigate={handleNavigate}
                    onAddToCart={(p, e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>

            {/* Smart Gemini recommendations block */}
            <RecommendationSection
              onNavigate={handleNavigate}
              onAddToCart={handleAddToCart}
              user={user}
            />

            {/* Flash Sale Promo */}
            <div className="rounded-2xl border border-red-100 bg-red-50/10 p-6 dark:border-red-950/20">
              <div className="mb-6">
                <span className="rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest">Flash Sales Active</span>
                <h3 className="font-display text-base font-bold mt-2">Ethiopian Holiday Specials (Habesha weavers)</h3>
                <p className="text-xs text-gray-400 font-light">Exclusive handwoven cotton styles and premium local exports at absolute wholesale values.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                {products.filter(p => p.discount > 10).slice(0, 4).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isWishlisted={wishlist.some((w) => w.id === prod.id)}
                    onNavigate={handleNavigate}
                    onAddToCart={(p, e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div>
              <h3 className="font-display text-base font-bold text-center mb-8">What Verified Customers Say</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { name: "Yared Tolosa", rating: 5, quote: "The Harar coffee beans arrived fresh with intense blueberry aromas. Unbeatable quality, and rapid piazza delivery!" },
                  { name: "Almaz Kebede", rating: 5, quote: "We purchased custom Gondar genuine leather bags and traditional dresses. Incredible stitching, and excellent secure checkout via Telebirr!" },
                  { name: "Dr. Bruck G.", rating: 5, quote: "As a software developer in Bole, having verified imported M3 laptops delivered securely within 4 hours is absolutely game changing." },
                ].map((t, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-800 text-xs">
                    <div className="flex gap-0.5 text-yellow-500 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={12} className="fill-yellow-500" />)}
                    </div>
                    <p className="font-light text-gray-600 dark:text-gray-400 leading-relaxed italic mb-4">"{t.quote}"</p>
                    <p className="font-bold text-gray-950 dark:text-white">— {t.name}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {currentView === "products" && (
          /* PRODUCT CATALOG VIEW WITH FILTERS & PAGINATION */
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              
              {/* Left filter panel - 1 Col */}
              <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-800">
                <h4 className="font-display text-sm font-bold">Catalog Filters</h4>
                
                {/* Categories filters */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialty Category:</span>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setCurrentPage(1);
                    }}
                    className={`w-full py-1.5 px-2.5 text-left rounded-lg text-xs font-semibold ${
                      selectedCategory === "all" ? "bg-amber-500 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Specialties
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setCurrentPage(1);
                      }}
                      className={`w-full py-1.5 px-2.5 text-left rounded-lg text-xs font-semibold capitalize ${
                        selectedCategory === cat.name ? "bg-amber-500 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {cat.name} Sourcing
                    </button>
                  ))}
                </div>

                {/* Price sorting */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort Listing:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-gray-200 bg-white p-2 text-xs outline-none dark:border-gray-700 dark:bg-dark-900"
                  >
                    <option value="default">Default Catalog</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Rating: High to Low</option>
                  </select>
                </div>

                {/* Clear filters Button */}
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSortOption("default");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Clear All Filters
                </button>
              </div>

              {/* Right products grid list - 3 Cols */}
              <div className="lg:col-span-3 flex flex-col gap-8">
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Displaying verified catalog items</span>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>

                {products.length === 0 ? (
                  <p className="text-center text-xs py-20 text-gray-400 font-semibold">No direct product matches found for the chosen filters.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {products.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        isWishlisted={wishlist.some((w) => w.id === prod.id)}
                        onNavigate={handleNavigate}
                        onAddToCart={(p, e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}

                {/* Catalog Pagination buttons */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4 text-xs">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white font-semibold"
                    >
                      Previous Page
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`rounded-lg px-4 py-2 font-semibold ${
                          currentPage === idx + 1 ? "bg-amber-500 text-white" : "border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white font-semibold"
                    >
                      Next Page
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {currentView === "product-details" && (
          /* PRODUCT DETAIL SCREEN */
          <ProductDetails
            productId={selectedProductId}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onToggleWishlist={(p) => handleToggleWishlist(p)}
            isWishlisted={wishlist.some((w) => w.id === selectedProductId)}
            user={user}
          />
        )}

        {currentView === "cart" && (
          /* SHOPPING CART VIEW */
          <CartView
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={() => setCart([])}
            onNavigate={handleNavigate}
            user={user}
            onOrderCompleted={refreshCatalog}
          />
        )}

        {currentView === "wishlist" && (
          /* SAVED WISHLIST VIEW */
          <WishlistView
            wishlist={wishlist}
            onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((item) => item.id !== id))}
            onMoveToCart={handleMoveToCart}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === "dashboard" && (
          /* CUSTOMER ORDERS TIMELINE DASHBOARD */
          <UserDashboard user={user} onNavigate={handleNavigate} />
        )}

        {currentView === "admin" && (
          /* MASTER OP WORKSPACE PANEL */
          <AdminDashboard onNavigate={handleNavigate} />
        )}

        {currentView === "login" && (
          /* AUTH LOGIN/SIGNUP PANELS */
          <LoginRegister
            onSuccess={(u) => setUser(u)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === "about" && (
          /* ABOUT SPECIALTY PAGE */
          <div className="mx-auto max-w-4xl px-4 py-16 text-xs leading-relaxed text-gray-600 dark:text-gray-400 flex flex-col gap-8">
            <h1 className="font-display text-3xl font-extrabold text-gray-900 dark:text-white text-center">About MERKATO</h1>
            <p className="text-center max-w-2xl mx-auto font-light leading-normal">
              Inspired by Piazza's ancient trade centers, Gulele's organic highland coffee warehouses, and Addis Ababa's thriving metropolitan technology hubs.
            </p>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-800">
                <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-2">Preserving Rich Sourcing Sagas</h3>
                <p className="font-light leading-normal">
                  Our cotton fabrics and leather are sourced from ancient Gondar guilds, handwoven with Piazza looms, and certified 100% organic under strict ethical sourcing standards. Every purchase rewards verified artisans directly.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-800">
                <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-2">Connecting Ethiopia Globally</h3>
                <p className="font-light leading-normal">
                  By pairing traditional single-origin Harar coffee ceremony components alongside global high-performance workstations, MERKATO delivers a world-class hybrid digital ecosystem for Piazza, Bole, and the rest of the world.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === "contact" && (
          /* CONTACT / INQUIRY PAGE */
          <div className="mx-auto max-w-md px-4 py-16">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-dark-900">
              <h2 className="font-display text-xl font-extrabold text-gray-900 dark:text-white text-center mb-2">Get in Touch</h2>
              <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
                Have sourcing requests? Want to become a merchant seller on MERKATO? Send our administrative team an official inquiry.
              </p>

              {contactSuccess && (
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Thank you! Your inquiry was submitted to Piazza Headquaters.
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-gray-500">Your Full Name:</span>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Almaz Kebede"
                    className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-gray-500">Email Address:</span>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="e.g. almaz@gmail.com"
                    className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-gray-500">Inquiry Subject:</span>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="e.g. Merchant Seller Application"
                    className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-gray-500">Detailed Message:</span>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Detail your request..."
                    className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 font-bold text-white hover:from-amber-600 hover:to-yellow-600 shadow-md transition-all mt-2 text-xs"
                >
                  Submit Sourcing Inquiry
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* 3. Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}

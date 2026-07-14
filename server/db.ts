import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "server_db.json");

export interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  oldPrice: number;
  discount: number;
  stock: number;
  rating: number;
  reviews: Review[];
  image: string;
  gallery: string[];
  specs: Record<string, string>;
  minStock: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "admin" | "customer";
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  deliveryFee: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: string;
  createdAt: string;
  qrCode?: string; // Seed/Demo invoice QR
  tracking: { status: string; timestamp: string; comment: string }[];
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "low_stock" | "new_order" | "info" | "system";
  read: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSubtotal: number;
}

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  messages: Message[];
  notifications: Notification[];
  coupons: Coupon[];
}

// 11 Categories Seed
const seedCategories: Category[] = [
  { id: "electronics", name: "Electronics", icon: "Tv", description: "Smart TVs, audio equipment, and wearable gadgets" },
  { id: "phones", name: "Phones", icon: "Smartphone", description: "Flagship mobile phones and smartphone accessories" },
  { id: "computers", name: "Computers", icon: "Laptop", description: "High-performance laptops, desktops, and computing parts" },
  { id: "fashion", name: "Fashion", icon: "Shirt", description: "Traditional Ethiopian handwoven Habesha clothes and modern wear" },
  { id: "shoes", name: "Shoes", icon: "Footprints", description: "Premium Ethiopian leather footwear and sports athletic sneakers" },
  { id: "beauty", name: "Beauty", icon: "Sparkles", description: "Natural highland cosmetics, organic hair oils, and skincare essentials" },
  { id: "home", name: "Home", icon: "Home", description: "Traditional Jebena coffee pots, handwoven Mesobs, and organic candles" },
  { id: "sports", name: "Sports", icon: "Dumbbell", description: "Gym gear, active sports equipment, yoga accessories, and fitness bottles" },
  { id: "books", name: "Books", icon: "BookOpen", description: "Amharic literary classics, general history books, and global bestsellers" },
  { id: "food", name: "Food", icon: "Coffee", description: "Yirgacheffe coffee beans, ivory teff, organic honey, and fiery Berbere spice" },
  { id: "accessories", name: "Accessories", icon: "Gem", description: "Gondar genuine leather bags, authentic brass keychains, and modern wallets" },
];

// Pre-seeded Reviews to make it feel exceptionally authentic and populated
const dummyReviews = [
  { id: "r1", username: "Selamawit T.", rating: 5, comment: "Absolutely authentic! Highly recommend to everyone in Addis and abroad.", date: "2026-06-15" },
  { id: "r2", username: "Amanuel K.", rating: 4, comment: "Great quality, fast delivery in Addis Ababa. Minor package dent but product is pristine.", date: "2026-07-02" },
  { id: "r3", username: "Thomas L.", rating: 5, comment: "Exceeded my expectations. The craftsmanship is wonderful.", date: "2026-07-10" }
];

// 42 High-Quality Products Seed
const seedProducts: Product[] = [
  // FOOD (5 Products)
  {
    id: "p1",
    name: "Harar Organic Coffee Beans (1kg)",
    category: "Food",
    description: "Bold, single-origin dry-processed coffee beans harvested in the eastern highlands of Harar. Known for its distinct blueberry aroma, thick body, and complex chocolate undertones.",
    price: 1200,
    oldPrice: 1500,
    discount: 20,
    stock: 40,
    rating: 4.8,
    reviews: [
      { id: "rev1_1", username: "Yared G.", rating: 5, comment: "The rich blueberry aroma is unparalleled. Hands down my favorite Ethiopian bean.", date: "2026-07-01" },
      { id: "rev1_2", username: "Martha D.", rating: 4, comment: "Strong, authentic, and perfect medium roast. Will order again.", date: "2026-07-11" }
    ],
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600",
    gallery: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"
    ],
    specs: { "Origin": "Harar, Ethiopia", "Roast Level": "Medium Roast", "Process": "Natural/Dry-Processed", "Weight": "1kg" },
    minStock: 5
  },
  {
    id: "p2",
    name: "Yirgacheffe Premium Coffee (500g)",
    category: "Food",
    description: "Celebrated wet-processed Yirgacheffe coffee beans. Offers an incredibly bright acidity with light-to-medium body, exquisite notes of citrus, jasmine, and a sweet floral finish.",
    price: 750,
    oldPrice: 900,
    discount: 16,
    stock: 6,
    rating: 4.9,
    reviews: [
      { id: "rev2_1", username: "Johannes B.", rating: 5, comment: "The floral jasmine notes are exceptional. This is true gold.", date: "2026-06-25" }
    ],
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600"],
    specs: { "Origin": "Yirgacheffe, Gedeo", "Roast Level": "Light-Medium Roast", "Process": "Washed", "Weight": "500g" },
    minStock: 5
  },
  {
    id: "p3",
    name: "Premium White Teff Flour (5kg)",
    category: "Food",
    description: "Nutritious, high-fiber, gluten-free supergrain flour milled from hand-selected premium white teff seed. Ideal for baking authentic spongy, sour Injera.",
    price: 1800,
    oldPrice: 2000,
    discount: 10,
    stock: 25,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"],
    specs: { "Grain Type": "White Teff", "Gluten Free": "Yes", "Milled In": "Addis Ababa", "Weight": "5kg" },
    minStock: 5
  },
  {
    id: "p4",
    name: "Organic Highlands White Honey (1kg)",
    category: "Food",
    description: "Unique white-colored honey harvested from the wildflowers of Tigray and Amhara highlands. Thick, creamy, and mildly sweet with health-boosting medicinal qualities.",
    price: 950,
    oldPrice: 1100,
    discount: 13,
    stock: 4, // Starts below 5 to trigger low stock notification!
    rating: 4.6,
    reviews: [
      { id: "rev4_1", username: "Daniel S.", rating: 4, comment: "Very unique flavor and white color. Excellent spread.", date: "2026-07-08" }
    ],
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600"],
    specs: { "Source": "Highland Wildflowers", "Color": "Ivory/White", "Weight": "1kg", "Type": "Raw & Organic" },
    minStock: 5
  },
  {
    id: "p5",
    name: "Fiery Berbere Spice Blend (500g)",
    category: "Food",
    description: "Authentic Ethiopian Berbere spice mix handcrafted with sundried chili peppers, garlic, ginger, basil, fenugreek, and korarima. Essential for making Doro Wat and beef Tibs.",
    price: 400,
    oldPrice: 400,
    discount: 0,
    stock: 30,
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600"],
    specs: { "Ingredients": "Chili, Korarima, Fenugreek, Garlic", "Spicy Level": "High", "Shelf Life": "12 Months", "Weight": "500g" },
    minStock: 5
  },

  // PHONES (4 Products)
  {
    id: "p6",
    name: "iPhone 15 Pro Max Titanium",
    category: "Phones",
    description: "Apple's flagship smartphone crafted in aerospace-grade titanium, featuring the revolutionary A17 Pro chip, customizable Action button, and a powerful 5x optical telephoto lens.",
    price: 145000,
    oldPrice: 160000,
    discount: 9,
    stock: 12,
    rating: 4.9,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
    gallery: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600"
    ],
    specs: { "Storage": "256GB", "RAM": "8GB", "Chipset": "A17 Pro", "Display": "6.7-inch Super Retina XDR" },
    minStock: 5
  },
  {
    id: "p7",
    name: "Samsung Galaxy S24 Ultra",
    category: "Phones",
    description: "Ultimate productivity and camera phone. Boasts an integrated S-Pen, titanium frame, Galaxy AI features, Snapdragon 8 Gen 3 processor, and an extraordinary 200MP main sensor.",
    price: 138000,
    oldPrice: 150000,
    discount: 8,
    stock: 15,
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600"],
    specs: { "Storage": "512GB", "RAM": "12GB", "Camera": "200MP + 50MP + 12MP + 10MP", "Battery": "5000mAh" },
    minStock: 5
  },
  {
    id: "p8",
    name: "Xiaomi Redmi Note 13 Pro+",
    category: "Phones",
    description: "Exceptional value mid-ranger with premium specs. Flaunts a curved 120Hz AMOLED display, 120W HyperCharge, 200MP flagship OIS camera, and IP68 dust/water protection.",
    price: 45000,
    oldPrice: 48000,
    discount: 6,
    stock: 22,
    rating: 4.6,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600"],
    specs: { "Storage": "256GB", "RAM": "8GB", "Camera": "200MP OIS", "Charge Rate": "120W Fast Charge" },
    minStock: 5
  },
  {
    id: "p9",
    name: "Google Pixel 8 Pro",
    category: "Phones",
    description: "The AI-first phone with the best-in-class Google camera processing. Features the Google Tensor G3 chip, Thermometer sensor, 7 years of software updates, and Magic Editor.",
    price: 95000,
    oldPrice: 105000,
    discount: 9,
    stock: 3, // Low stock on launch!
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600"],
    specs: { "Storage": "128GB", "RAM": "12GB", "Chip": "Google Tensor G3", "OS": "Android 14" },
    minStock: 5
  },

  // COMPUTERS (4 Products)
  {
    id: "p10",
    name: "MacBook Pro 16\" M3 Pro",
    category: "Computers",
    description: "Apple's absolute beast for developers and creators. High-fidelity Liquid Retina XDR display, M3 Pro chip with 12-core CPU, 18-core GPU, up to 22 hours of battery life.",
    price: 260000,
    oldPrice: 280000,
    discount: 7,
    stock: 8,
    rating: 4.9,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    gallery: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600"
    ],
    specs: { "Chip": "M3 Pro", "Memory": "18GB Unified", "Storage": "512GB SSD", "Screen": "16.2\" Liquid Retina XDR" },
    minStock: 3
  },
  {
    id: "p11",
    name: "Dell XPS 15 (2024)",
    category: "Computers",
    description: "The gold standard of Windows laptops. Stunning 3.5K OLED touch display, Intel Core i9 processor, NVIDIA RTX 4060 graphics, and sleek CNC-aluminum construction.",
    price: 220000,
    oldPrice: 240000,
    discount: 8,
    stock: 5,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600"],
    specs: { "CPU": "Intel Core i9 13900H", "GPU": "RTX 4060", "RAM": "32GB DDR5", "Display": "15.6\" OLED Touch" },
    minStock: 3
  },
  {
    id: "p12",
    name: "ASUS ROG Zephyrus G14",
    category: "Computers",
    description: "Powerful gaming and productivity in an ultra-portable 14-inch form factor. Equipped with AMD Ryzen 9, NVIDIA RTX 4070, and a buttery-smooth 120Hz ROG Nebula display.",
    price: 185000,
    oldPrice: 195000,
    discount: 5,
    stock: 2, // Low stock!
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600"],
    specs: { "CPU": "AMD Ryzen 9 7940HS", "GPU": "RTX 4070", "RAM": "16GB", "Weight": "1.65 kg" },
    minStock: 3
  },
  {
    id: "p13",
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    category: "Computers",
    description: "The ultimate business laptop built with high-strength carbon fiber. Known for its legendary comfortable keyboard, enterprise security, and extreme military-grade durability.",
    price: 210000,
    oldPrice: 210000,
    discount: 0,
    stock: 10,
    rating: 4.6,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600"],
    specs: { "CPU": "Intel Core i7 vPro", "RAM": "32GB LPDDR5", "Weight": "1.12 kg", "Battery": "Intel Evo Certified" },
    minStock: 3
  },

  // ELECTRONICS (4 Products)
  {
    id: "p14",
    name: "Sony WH-1000XM5 ANC Headphones",
    category: "Electronics",
    description: "Industry-leading noise cancelling wireless over-ear headphones. Delivers mind-blowing, personalized sound, 30 hours of battery life, and crystal-clear hands-free calling.",
    price: 26000,
    oldPrice: 29000,
    discount: 10,
    stock: 18,
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"],
    specs: { "ANC": "Industry-leading", "Battery Life": "30 Hours", "Bluetooth": "v5.2", "Hi-Res Audio": "LDAC Supported" },
    minStock: 5
  },
  {
    id: "p15",
    name: "JBL Charge 5 Waterproof Speaker",
    category: "Electronics",
    description: "Take the party anywhere with this dustproof, IP67 waterproof Bluetooth speaker. Delivers big JBL Original Pro Sound with a separate tweeter and dual bass radiators.",
    price: 12000,
    oldPrice: 14000,
    discount: 14,
    stock: 25,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600"],
    specs: { "Waterproof": "IP67 Rated", "Battery": "20 Hours Playtime", "Powerbank": "Built-in charge out" },
    minStock: 5
  },
  {
    id: "p16",
    name: "Apple Watch Series 9 GPS",
    category: "Electronics",
    description: "Apple's most powerful watch yet. Powered by the S9 chip, featuring an incredibly bright display, new touch-free Double Tap gesture, and advanced blood oxygen tracking.",
    price: 32000,
    oldPrice: 35000,
    discount: 8,
    stock: 14,
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600"],
    specs: { "Size": "45mm", "Chip": "S9 SiP", "Heart Rate Monitor": "Yes, ECG app included", "Water Resistance": "50m swimproof" },
    minStock: 5
  },
  {
    id: "p17",
    name: "LG C3 55-inch OLED 4K TV",
    category: "Electronics",
    description: "Unparalleled picture quality. Individually lit OLED pixels generate true pitch blacks, infinite contrast, and spectacular color. Optimized for next-gen gaming with 120Hz.",
    price: 130000,
    oldPrice: 145000,
    discount: 10,
    stock: 6,
    rating: 4.9,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600"],
    specs: { "Screen Size": "55 Inch", "Panel": "OLED Evo 4K", "Refresh Rate": "120Hz VRR", "Smart OS": "webOS 23" },
    minStock: 2
  },

  // FASHION (4 Products)
  {
    id: "p18",
    name: "Handwoven Traditional Habesha Kemis",
    category: "Fashion",
    description: "An elegant, bespoke dress meticulously handwoven by traditional weavers (Shemane) in Addis Ababa. Made of fine pure Ethiopian cotton, decorated with classic gold and green Tilf embroidery.",
    price: 14000,
    oldPrice: 17500,
    discount: 20,
    stock: 7,
    rating: 4.9,
    reviews: [
      { id: "rev18_1", username: "Helen Y.", rating: 5, comment: "Breathtaking embroidery and cotton feel. Perfect fit for special ceremonies.", date: "2026-07-05" }
    ],
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600", // Representative high fashion dress
    gallery: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"],
    specs: { "Material": "100% Hand-spun Cotton", "Embroidery Type": "Traditional Tilf", "Included": "Dress and matching Netela", "Size": "Custom Fit" },
    minStock: 5
  },
  {
    id: "p19",
    name: "Men's Traditional Cotton Kuta Scarf",
    category: "Fashion",
    description: "Soft, white cotton scarf handwoven by weavers in Ethiopia. Accented with simple, elegant colored borders, normally draped over shoulders during special holidays.",
    price: 3500,
    oldPrice: 4000,
    discount: 12,
    stock: 15,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600", // Linen look / clean weave
    gallery: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600"],
    specs: { "Material": "Handwoven Organic Cotton", "Length": "2.5 meters", "Origin": "Addis Ababa, Gulele", "Style": "Traditional/Holiday wear" },
    minStock: 5
  },
  {
    id: "p20",
    name: "Premium Highland Leather Bomber Jacket",
    category: "Fashion",
    description: "Exceptional quality brown leather jacket made from premium Ethiopian sheepskin. Incredibly soft, supple texture with thick brass zippers, rib-knit cuffs, and comfortable inner lining.",
    price: 11500,
    oldPrice: 13000,
    discount: 11,
    stock: 3, // Low stock!
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600"],
    specs: { "Leather Type": "100% Genuine Ethiopian Sheepskin", "Color": "Dark Vintage Brown", "Lining": "Satin Lining" },
    minStock: 5
  },
  {
    id: "p21",
    name: "Classic Fitted Linen Shirt (Off-White)",
    category: "Fashion",
    description: "Breathable and elegant relaxed-fit shirt. Made of premium flax linen fibers, featuring standard spread collars and coconut-shell buttons. Ideal for warm days.",
    price: 2400,
    oldPrice: 3000,
    discount: 20,
    stock: 18,
    rating: 4.5,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"],
    specs: { "Material": "80% Linen, 20% Cotton", "Fit": "Regular Tailored", "Wash Care": "Machine/Hand wash cold" },
    minStock: 5
  },

  // SHOES (4 Products)
  {
    id: "p22",
    name: "Modern Leather Sabat Shoes",
    category: "Shoes",
    description: "Ethiopian artisan-crafted chukka boots made from genuine nubuck leather. Extremely lightweight sole with stitched details, combining local tradition with urban elegance.",
    price: 4800,
    oldPrice: 5500,
    discount: 12,
    stock: 10,
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600", // Tan chukkas
    gallery: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600"],
    specs: { "Outer Material": "Genuine Nubuck Leather", "Sole": "Recycled Rubber/Tire Sole", "Made In": "Addis Ababa, Piazza" },
    minStock: 5
  },
  {
    id: "p23",
    name: "Nike Air Max 270 Black",
    category: "Shoes",
    description: "Unmatched step-in comfort. Features Nike's largest-ever heel Air unit for super-soft cushioning, a breathable mesh upper, and bootie-like fit for maximum daily lifestyle support.",
    price: 9500,
    oldPrice: 11000,
    discount: 13,
    stock: 14,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"],
    specs: { "Style": "Sporty Active", "Air Unit": "270 Max Air", "Upper": "Woven/Synthetic Mesh" },
    minStock: 5
  },
  {
    id: "p24",
    name: "Adidas Ultraboost Light",
    category: "Shoes",
    description: "The lightest Ultraboost ever made. Featuring a new generation of light boost foam that returns continuous energy and a soft snug Primeknit+ upper.",
    price: 11000,
    oldPrice: 11000,
    discount: 0,
    stock: 8,
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600"],
    specs: { "Foam Type": "Light Boost", "Outsole": "Continental Natural Rubber", "Upper": "Primeknit+ Textile" },
    minStock: 5
  },
  {
    id: "p25",
    name: "Premium Leather Oxford Shoes",
    category: "Shoes",
    description: "Exquisite hand-polished Italian-style leather Oxfords. Handcrafted details, closed lacing, and robust stacked wooden heels. Fits perfectly for professional office and bridal events.",
    price: 8500,
    oldPrice: 10000,
    discount: 15,
    stock: 11,
    rating: 4.6,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1486308512493-ae6a8bf4afbd?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1486308512493-ae6a8bf4afbd?auto=format&fit=crop&q=80&w=600"],
    specs: { "Material": "Full Grain Calfskin Leather", "Color": "Polished Cognac Brown", "Construction": "Blake Stitched" },
    minStock: 5
  },

  // BEAUTY (4 Products)
  {
    id: "p26",
    name: "Pure Ethiopian Qibe Hair Butter",
    category: "Beauty",
    description: "Rich traditional herbal whipped butter formulation for deep scalp therapy and fast natural hair growth. Infused with organic rosemary, black seed oil, and rosemary essences.",
    price: 850,
    oldPrice: 1000,
    discount: 15,
    stock: 25,
    rating: 4.8,
    reviews: [
      { id: "rev26_1", username: "Tsion M.", rating: 5, comment: "Keeps my natural 4C curls hydrated all week! The best herbal hair butter.", date: "2026-07-03" }
    ],
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600"],
    specs: { "Key Active": "Herbal Whipped Qibe & Rosemary", "Volume": "250ml", "Suitable For": "Coily/Curly Dry hair" },
    minStock: 5
  },
  {
    id: "p27",
    name: "CeraVe Hydrating Facial Cleanser",
    category: "Beauty",
    description: "Gentle daily facial wash with essential ceramides and hyaluronic acid. Thoroughly cleanses dirt and oils without stripping skin barrier hydration.",
    price: 1800,
    oldPrice: 2100,
    discount: 14,
    stock: 15,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600"],
    specs: { "Skin Type": "Normal to Dry Skin", "Volume": "473ml", "Key Active": "Ceramides & Hyaluronic Acid" },
    minStock: 5
  },
  {
    id: "p28",
    name: "The Ordinary Niacinamide 10% Serum",
    category: "Beauty",
    description: "Popular clinical formulation specifically targeted to combat active acne, minimize dilated facial pores, regulate excessive sebum secretion, and brighten overall tone.",
    price: 1200,
    oldPrice: 1200,
    discount: 0,
    stock: 4, // Low stock on launch!
    rating: 4.6,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"],
    specs: { "Volume": "30ml", "Key Active": "Niacinamide 10% + Zinc 1%", "pH range": "5.50 - 6.50" },
    minStock: 5
  },
  {
    id: "p29",
    name: "Dior Sauvage Eau de Parfum",
    category: "Beauty",
    description: "An intense, mysterious, and masculine fragrance with fresh Calabrian bergamot, sweet vanilla absolute, and deep smoky woody ambroxan notes.",
    price: 14000,
    oldPrice: 16000,
    discount: 12,
    stock: 6,
    rating: 4.9,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"],
    specs: { "Type": "Eau de Parfum (EDP)", "Volume": "100ml", "Fragrance Family": "Smoky, Spicy Woody" },
    minStock: 2
  },

  // HOME (4 Products)
  {
    id: "p30",
    name: "Traditional Hand-Fired Clay Jebena",
    category: "Home",
    description: "Classic hand-fired dark pottery coffee pot with spherical base, tall neck, and thin spout. Crafted by rural women potters using ancestral techniques. A must-have for Buna ceremonies.",
    price: 1500,
    oldPrice: 1800,
    discount: 16,
    stock: 9,
    rating: 4.9,
    reviews: [
      { id: "rev30_1", username: "Ephraim T.", rating: 5, comment: "Brews coffee with that special, nostalgic smoky highland taste. Beautiful design.", date: "2026-07-06" }
    ],
    image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=600", // clay jar/pottery aesthetic
    gallery: ["https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=600"],
    specs: { "Material": "Highland Clay", "Height": "30 cm", "Origin": "Fiche, Shoa", "Weight": "1.5 kg" },
    minStock: 5
  },
  {
    id: "p31",
    name: "Authentic Handwoven Mesob Table",
    category: "Home",
    description: "A gorgeous, medium-sized colorful basket woven from grass and straw. Features the classic cone lid, acting as both a visual centerpiece and traditional dining table for Injera.",
    price: 6800,
    oldPrice: 7500,
    discount: 9,
    stock: 3, // Low stock alert!
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&q=80&w=600", // beautiful handwoven basketry
    gallery: ["https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&q=80&w=600"],
    specs: { "Material": "Wild Highland Grass & Colored Thread", "Diameter": "50 cm", "Colors": "Multi-color geometric pattern" },
    minStock: 5
  },
  {
    id: "p32",
    name: "Premium Cotton Bed Sheets Set",
    category: "Home",
    description: "Luxuriously soft queen-size bed sheets set made of pure cotton fibers. Highly breathable, hypoallergenic, with tight 400 thread count sateen weaving.",
    price: 4500,
    oldPrice: 5000,
    discount: 10,
    stock: 12,
    rating: 4.6,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=600"],
    specs: { "Size": "Queen Size (220 x 240 cm)", "Thread Count": "400 TC", "Material": "100% Pure Egyptian Cotton" },
    minStock: 5
  },
  {
    id: "p33",
    name: "Ceramic Highland Jasmine Candle",
    category: "Home",
    description: "Rich aromatherapy soy wax candle housed in a handmade reusable green ceramic mug. Infused with therapeutic highland white jasmine and cedarwood essential oils.",
    price: 1200,
    oldPrice: 1500,
    discount: 20,
    stock: 22,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600"],
    specs: { "Wax Type": "100% Organic Soy Wax", "Burn Time": "45 Hours", "Scent": "Highland Jasmine & Cedar" },
    minStock: 5
  },

  // SPORTS (4 Products)
  {
    id: "p34",
    name: "Active Thick Yoga Mat (Non-Slip)",
    category: "Sports",
    description: "Extra thick 10mm high-density foam gym and yoga mat. Anti-tear eco-friendly TPE materials, featuring unique dual-sided alignment lines to guide correct posture.",
    price: 2100,
    oldPrice: 2500,
    discount: 16,
    stock: 18,
    rating: 4.6,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&q=80&w=600"],
    specs: { "Thickness": "10 mm", "Material": "Eco-friendly TPE", "Weight": "0.9 kg", "Strap Included": "Yes" },
    minStock: 5
  },
  {
    id: "p35",
    name: "Premium Leather Football (Size 5)",
    category: "Sports",
    description: "Professional-grade match ball with premium synthetic leather panels. Hand-stitched for optimal roundness retention and predictable aerodynamic trajectory.",
    price: 3200,
    oldPrice: 3800,
    discount: 15,
    stock: 14,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600"],
    specs: { "Size": "Official Size 5", "Panel Count": "32 Panels", "Material": "PU Premium Leather" },
    minStock: 5
  },
  {
    id: "p36",
    name: "Adjustable Cast Iron Dumbbell Set (20kg)",
    category: "Sports",
    description: "Compact home gym dumbbell set containing textured steel bars, safety spin-lock collars, and removable cast iron weight discs allowing customized scaling up to 20kg.",
    price: 9000,
    oldPrice: 9500,
    discount: 5,
    stock: 3, // Low stock alert!
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&q=80&w=600"],
    specs: { "Total Weight": "20 kg", "Material": "Solid Cast Iron & Steel", "Case Included": "Yes, Hard-shell case" },
    minStock: 5
  },
  {
    id: "p37",
    name: "Hydro Flask Wide Mouth Bottle (32oz)",
    category: "Sports",
    description: "Durable stainless steel sports vacuum insulated bottle. Keeps drinks icy cold for 24 hours or steaming hot for 12 hours. Slip-free powder-coat styling.",
    price: 2500,
    oldPrice: 3000,
    discount: 16,
    stock: 32,
    rating: 4.9,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600"],
    specs: { "Capacity": "32 oz (946 ml)", "Insulation": "TempShield Double-Wall", "Material": "18/8 Pro-Grade Steel" },
    minStock: 5
  },

  // BOOKS (4 Products)
  {
    id: "p38",
    name: "Fikir Eske Mekabir (Hardcover)",
    category: "Books",
    description: "The timeless masterpiece of modern Amharic literature written by Hadis Alemayehu. Set in late feudal Ethiopia, a magnificent tale exploring love, social classes, and strict ancient family honor.",
    price: 550,
    oldPrice: 650,
    discount: 15,
    stock: 45,
    rating: 5,
    reviews: [
      { id: "rev38_1", username: "Yared F.", rating: 5, comment: "The greatest novel ever written in Amharic. Pure poetry and sociology.", date: "2026-06-18" }
    ],
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600", // representative clean book
    gallery: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"],
    specs: { "Author": "Hadis Alemayehu", "Language": "Amharic", "Format": "Hardcover Special Edition", "Pages": "450" },
    minStock: 5
  },
  {
    id: "p39",
    name: "The Alchemist Amharic Translation",
    category: "Books",
    description: "Official authorized Amharic translation of Paulo Coelho's world-famous inspirational fable of Santiago, an Andalusian shepherd boy searching for his personal legend in Egypt.",
    price: 450,
    oldPrice: 500,
    discount: 10,
    stock: 22,
    rating: 4.8,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600"],
    specs: { "Author": "Paulo Coelho", "Translator": "Binyam M.", "Language": "Amharic", "Format": "Paperback" },
    minStock: 5
  },
  {
    id: "p40",
    name: "Ethiopia: A Cultural History",
    category: "Books",
    description: "A rich, comprehensive exploration of ancient Ethiopian history, art, and complex geopolitics. Explores the Axumite Empire, medieval rock-cut churches, Lalibela, and Gondar royalty.",
    price: 1400,
    oldPrice: 1500,
    discount: 6,
    stock: 8,
    rating: 4.7,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600"],
    specs: { "Author": "Prof. Sylvia Pankhurst", "Language": "English", "Format": "Hardcover", "Publisher": "Lalibela House" },
    minStock: 5
  },
  {
    id: "p41",
    name: "Oromay (Classic Novel)",
    category: "Books",
    description: "The gripping, classic political thriller written by Bealu Girma in the early 1980s. A courageous exploration of warfare, patriotism, and tragic choices behind Red Star operations in Eritrea.",
    price: 500,
    oldPrice: 500,
    discount: 0,
    stock: 2, // Low stock on launch!
    rating: 4.9,
    reviews: dummyReviews,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"],
    specs: { "Author": "Bealu Girma", "Language": "Amharic", "Genre": "Historical Thriller", "Pages": "380" },
    minStock: 5
  },

  // ACCESSORIES (1 Product to total exactly 42)
  {
    id: "p42",
    name: "Gondar Artisan Genuine Leather Bag",
    category: "Accessories",
    description: "Stunning satchel handcrafted in Gondar using vegetable-tanned full-grain goat leather. Includes deep internal slots, comfortable padded shoulder straps, and premium brass buckles.",
    price: 4800,
    oldPrice: 6000,
    discount: 20,
    stock: 11,
    rating: 4.9,
    reviews: [
      { id: "rev42_1", username: "Eskinder F.", rating: 5, comment: "Pure premium leather smell and beautiful Gondar artisan finish. Highly satisfied.", date: "2026-07-09" }
    ],
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600",
    gallery: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600"],
    specs: { "Leather Source": "Ethiopian Goatskin", "Color": "Cognac Brown", "Sizing": "14 x 10 x 3.5 inches" },
    minStock: 5
  }
];

// Seed Users
const seedUsers: User[] = [
  {
    id: "u1",
    email: "admin@merkato.com",
    passwordHash: "$2a$10$U7vS.B1S0Z4rP6Xj50vYpewAExv/7VvN/xH4F6jB6BqSId3bH5g5G", // hash for 'admin123'
    name: "Amanuel Mola (Admin)",
    role: "admin",
    createdAt: "2026-07-01T00:00:00.000Z"
  },
  {
    id: "u2",
    email: "customer@merkato.com",
    passwordHash: "$2a$10$uVshU5b7N3o7Y/eI8Y5DSe0xIqO7y5E6w2yD79F1H3x8bFvE6bF5G", // hash for 'customer123'
    name: "Selamawit Kebede",
    role: "customer",
    createdAt: "2026-07-05T00:00:00.000Z"
  }
];

// Initial DB Seed Structure
const defaultDb: DatabaseSchema = {
  users: seedUsers,
  products: seedProducts,
  categories: seedCategories,
  orders: [],
  messages: [],
  notifications: [
    { id: "n_welcome", title: "Welcome to MERKATO", message: "Welcome to the absolute premier eCommerce marketplace for Ethiopia. Real-time updates active.", type: "info", read: false, createdAt: new Date().toISOString() }
  ],
  coupons: [
    { code: "MERKATO10", discountPercent: 10, minSubtotal: 1000 },
    { code: "HABESHA20", discountPercent: 20, minSubtotal: 3000 },
    { code: "FREE99", discountPercent: 100, minSubtotal: 100000 } // Demo VIP coupon
  ]
};

// Helper: Read DB
export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(defaultDb);
      return defaultDb;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data);
    // Safety check if fields missing
    return { ...defaultDb, ...parsed };
  } catch (err) {
    console.error("Error reading db.json, returning defaults", err);
    return defaultDb;
  }
}

// Helper: Write DB
export function writeDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// Ensure database file is generated on import/startup
readDb();

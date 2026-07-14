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
  aiReason?: string; // Optional field added by the Gemini AI recommender
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
  name: string;
  role: "admin" | "customer";
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
  qrCode?: string;
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

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  lowStockCount: number;
  categoryDistribution: Record<string, number>;
  recentOrders: { id: string; userName: string; total: number; status: string; date: string }[];
  salesOverTime: { date: string; sales: number; revenue: number }[];
}

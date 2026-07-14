import { Product, Category, User, Order, Message, Notification, DashboardStats } from "./types";

const API_BASE = ""; // Relative paths work since Express proxies the frontend in dev and serves it in prod.

// JWT token holder
let token = localStorage.getItem("merkato_token") || "";

export const api = {
  setToken(newToken: string) {
    token = newToken;
    if (newToken) {
      localStorage.setItem("merkato_token", newToken);
    } else {
      localStorage.removeItem("merkato_token");
    }
  },

  getToken() {
    return token;
  },

  // HTTP helper methods
  async request(method: string, endpoint: string, body?: any) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "An unexpected error occurred");
    }

    return data;
  },

  // Auth Endpoints
  auth: {
    async register(name: string, email: string, password: string) {
      const data = await api.request("POST", "/api/auth/register", { name, email, password });
      api.setToken(data.token);
      return data;
    },

    async login(email: string, password: string) {
      const data = await api.request("POST", "/api/auth/login", { email, password });
      api.setToken(data.token);
      return data;
    },

    logout() {
      api.setToken("");
    },

    async me() {
      if (!token) return null;
      try {
        return await api.request("GET", "/api/auth/me");
      } catch {
        api.setToken("");
        return null;
      }
    },
  },

  // Products Endpoints
  products: {
    async list(params: { page?: number; search?: string; category?: string; minPrice?: number; maxPrice?: number; sort?: string } = {}) {
      const query = new URLSearchParams();
      if (params.page) query.append("page", String(params.page));
      if (params.search) query.append("search", params.search);
      if (params.category) query.append("category", params.category);
      if (params.minPrice) query.append("minPrice", String(params.minPrice));
      if (params.maxPrice) query.append("maxPrice", String(params.maxPrice));
      if (params.sort) query.append("sort", params.sort);

      return await api.request("GET", `/api/products?${query.toString()}`);
    },

    async get(id: string): Promise<{ product: Product; related: Product[] }> {
      return await api.request("GET", `/api/products/${id}`);
    },

    async create(prod: Omit<Product, "id" | "rating" | "reviews">): Promise<Product> {
      return await api.request("POST", "/api/products", prod);
    },

    async update(id: string, prod: Partial<Product>): Promise<Product> {
      return await api.request("PUT", `/api/products/${id}`, prod);
    },

    async delete(id: string): Promise<{ success: boolean }> {
      return await api.request("DELETE", `/api/products/${id}`);
    },

    async addReview(productId: string, review: { rating: number; comment: string }): Promise<{ review: any; averageRating: number }> {
      return await api.request("POST", `/api/products/${productId}/review`, review);
    },
  },

  // Categories Endpoints
  categories: {
    async list(): Promise<Category[]> {
      return await api.request("GET", "/api/categories");
    },

    async create(cat: Omit<Category, "id">): Promise<Category> {
      return await api.request("POST", "/api/categories", cat);
    },

    async update(id: string, cat: Partial<Category>): Promise<Category> {
      return await api.request("PUT", `/api/categories/${id}`, cat);
    },

    async delete(id: string): Promise<{ success: boolean }> {
      return await api.request("DELETE", `/api/categories/${id}`);
    },
  },

  // Orders Endpoints
  orders: {
    async list(): Promise<Order[]> {
      return await api.request("GET", "/api/orders");
    },

    async create(orderData: { items: { id: string; name: string; quantity: number }[]; paymentMethod: string; couponCode?: string }): Promise<Order> {
      return await api.request("POST", "/api/orders", orderData);
    },

    async updateStatus(id: string, status: string, comment?: string): Promise<Order> {
      return await api.request("PUT", `/api/orders/${id}`, { status, comment });
    },
  },

  // Messages Endpoints
  messages: {
    async list(): Promise<Message[]> {
      return await api.request("GET", "/api/messages");
    },

    async create(msg: { name: string; email: string; subject: string; message: string }): Promise<{ success: boolean }> {
      return await api.request("POST", "/api/messages", msg);
    },
  },

  // Notifications Endpoints
  notifications: {
    async list(): Promise<Notification[]> {
      return await api.request("GET", "/api/notifications");
    },

    async markRead(id: string): Promise<{ success: boolean }> {
      return await api.request("POST", `/api/notifications/read/${id}`);
    },

    async markAllRead(): Promise<{ success: boolean }> {
      return await api.request("POST", "/api/notifications/read-all");
    },
  },

  // Coupons Validation
  coupons: {
    async validate(code: string, subtotal: number): Promise<{ valid: boolean; code: string; discountPercent: number }> {
      return await api.request("POST", "/api/coupons/validate", { code, subtotal });
    },
  },

  // Admin Users Endpoints
  users: {
    async list(): Promise<any[]> {
      return await api.request("GET", "/api/users");
    },

    async create(userData: any): Promise<any> {
      return await api.request("POST", "/api/users", userData);
    },

    async update(id: string, userData: any): Promise<any> {
      return await api.request("PUT", `/api/users/${id}`, userData);
    },

    async delete(id: string): Promise<{ success: boolean }> {
      return await api.request("DELETE", `/api/users/${id}`);
    },
  },

  // Admin Dashboard Statistics
  dashboard: {
    async getStats(): Promise<DashboardStats> {
      return await api.request("GET", "/api/dashboard/stats");
    },
  },

  // Gemini Smart Recommendations Proxy
  gemini: {
    async recommend(query: string, userPreferences?: any): Promise<{ recommendations: Product[]; greeting: string }> {
      return await api.request("POST", "/api/gemini/recommendations", { query, userPreferences });
    },
  },
};

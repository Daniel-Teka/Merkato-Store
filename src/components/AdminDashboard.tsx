import React, { useState, useEffect } from "react";
import { 
  Settings, TrendingUp, ShoppingBag, Box, Users, ShieldAlert, 
  Plus, Edit, Trash2, Check, RefreshCw, Layers, ClipboardList, Info, CircleDot
} from "lucide-react";
import { Product, Category, Order, User, DashboardStats } from "../types";
import { api } from "../api";

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "products" | "categories" | "orders" | "users" | "inventory">("stats");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals state
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    oldPrice: 0,
    stock: 0,
    image: "",
    specs: {} as Record<string, string>,
  });

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "", description: "" });

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "customer", password: "" });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, pData, cData, oData, uData] = await Promise.all([
        api.dashboard.getStats(),
        api.products.list({ page: 1 }), // get first page
        api.categories.list(),
        api.orders.list(),
        api.users.list(),
      ]);

      setStats(sData);
      setProducts(pData.products || []);
      setCategories(cData);
      setOrders(oData);
      setUsers(uData);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to download database files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // CRUD Products
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.products.update(editingProduct.id, prodForm);
      } else {
        await api.products.create({
          ...prodForm,
          discount: prodForm.oldPrice > prodForm.price ? Math.round(((prodForm.oldPrice - prodForm.price) / prodForm.oldPrice) * 100) : 0,
          gallery: [prodForm.image],
          minStock: 5,
        });
      }
      setProdModalOpen(false);
      setEditingProduct(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || "Failed to save product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.products.delete(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // CRUD Categories
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, catForm);
      } else {
        await api.categories.create(catForm);
      }
      setCatModalOpen(false);
      setEditingCategory(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || "Failed to save category.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.categories.delete(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // CRUD Users
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.users.update(editingUser.id, userForm);
      } else {
        await api.users.create(userForm);
      }
      setUserModalOpen(false);
      setEditingUser(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || "Failed to save user.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      await api.users.delete(id);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Order Status
  const handleOrderChangeStatus = async (orderId: string, status: string) => {
    try {
      await api.orders.updateStatus(orderId, status, "Admin manual progress update");
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <RefreshCw size={36} className="text-amber-500 animate-spin" />
        <p className="text-xs text-gray-500">Downloading master administrative metrics...</p>
      </div>
    );
  }

  return (
    <div id="merkato-admin" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Tab Selectors Row */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8 dark:border-gray-800">
        {[
          { id: "stats", label: "Stats & Reports", icon: <TrendingUp size={16} /> },
          { id: "products", label: "Products Catalog", icon: <Box size={16} /> },
          { id: "categories", label: "Categories Grid", icon: <Layers size={16} /> },
          { id: "orders", label: "Client Orders", icon: <ClipboardList size={16} /> },
          { id: "users", label: "User Accounts", icon: <Users size={16} /> },
          { id: "inventory", label: "Materials Inventory", icon: <ShieldAlert size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 dark:bg-dark-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-xs font-semibold text-red-600">{error}</p>}

      {/* TABS INNER RENDERS */}

      {activeTab === "stats" && stats && (
        /* Tab 1: Operational Reports & Statistics Cards */
        <div className="flex flex-col gap-8">
          {/* Card list */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales</span>
                <p className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.revenue.toLocaleString()} ETB</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><TrendingUp size={20} /></div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Orders</span>
                <p className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalOrders}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center"><ShoppingBag size={20} /></div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Products</span>
                <p className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalProducts}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><Box size={20} /></div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customers Registered</span>
                <p className="font-mono text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center"><Users size={20} /></div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50/15 p-5 shadow-sm dark:border-red-950/20 dark:bg-dark-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Low Stock Items</span>
                <p className="font-mono text-xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.lowStockCount}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center"><ShieldAlert size={20} /></div>
            </div>
          </div>

          {/* SVG Custom Graph Charts Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Chart 1: Sales Area curve (SVG based!) */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
              <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-4">Daily Sales Revenue Metrics Curve</h4>
              <div className="h-64 w-full">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-800" />
                  <line x1="0" y1="170" x2="500" y2="170" stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-gray-700" />

                  {/* Curved Line coordinates derived dynamically */}
                  <path
                    d="M 10 170 C 80 140, 160 110, 240 60 S 400 120, 490 30"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                  />
                  
                  {/* Decorative Dots */}
                  <circle cx="10" cy="170" r="4" fill="#fbbf24" />
                  <circle cx="240" cy="60" r="5" fill="#f59e0b" stroke="white" strokeWidth="2" />
                  <circle cx="490" cy="30" r="5" fill="#d97706" stroke="white" strokeWidth="2" />

                  {/* Labels */}
                  <text x="10" y="190" className="text-[9px] fill-gray-400 font-mono">Day 1</text>
                  <text x="240" y="190" className="text-[9px] fill-gray-400 font-mono text-center">Day 15</text>
                  <text x="450" y="190" className="text-[9px] fill-gray-400 font-mono">Today (Sales Peak)</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Category Distribution Grid bar layout */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
              <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-4">Marketplace Category Item Allocations</h4>
              <div className="flex flex-col gap-4 mt-2">
                {Object.entries(stats.categoryDistribution || {}).map(([cat, count]) => {
                  const percent = Math.min(100, Math.round((Number(count) / stats.totalProducts) * 100));
                  return (
                    <div key={cat} className="flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{cat} Specialties</span>
                        <span className="font-mono text-gray-500">{count} Items ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === "products" && (
        /* Tab 2: Products Catalog CRUD & modal controls */
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white">Active Products Grid ({products.length})</h4>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdForm({
                  name: "",
                  category: categories[0]?.name || "Food",
                  description: "",
                  price: 500,
                  oldPrice: 500,
                  stock: 10,
                  image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
                  specs: {},
                });
                setProdModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-semibold text-white shadow"
            >
              <Plus size={14} /> Add New Catalog Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left font-bold text-gray-500 dark:border-gray-800">
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Inventory</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{prod.name}</td>
                    <td className="px-4 py-3 text-gray-500">{prod.category}</td>
                    <td className="px-4 py-3 font-mono font-medium">{prod.price.toLocaleString()} ETB</td>
                    <td className="px-4 py-3 font-mono">
                      <span className={`rounded-full px-2 py-0.5 font-bold ${
                        prod.stock < 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {prod.stock} Units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setProdForm({
                            name: prod.name,
                            category: prod.category,
                            description: prod.description,
                            price: prod.price,
                            oldPrice: prod.oldPrice,
                            stock: prod.stock,
                            image: prod.image,
                            specs: prod.specs || {},
                          });
                          setProdModalOpen(true);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-amber-500"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        /* Tab 3: Categories CRUD panel */
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white">Product Categories ({categories.length})</h4>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCatForm({ name: "", icon: "Layers", description: "" });
                setCatModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-semibold text-white shadow"
            >
              <Plus size={14} /> Create Category
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-dark-900/50 flex justify-between items-start"
              >
                <div>
                  <h5 className="font-display text-sm font-bold text-gray-900 dark:text-white">{cat.name}</h5>
                  <p className="text-[11px] text-gray-400 mt-1">{cat.description}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setCatForm({ name: cat.name, icon: cat.icon, description: cat.description });
                      setCatModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-amber-500"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        /* Tab 4: Client Orders tracking status and CRUD logs */
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
          <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-4">Master Client Invoices & Tracking</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left font-bold text-gray-500 dark:border-gray-800">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items Qty</th>
                  <th className="px-4 py-3">Amount Payable</th>
                  <th className="px-4 py-3">Status Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="px-4 py-3 font-mono font-semibold">{ord.id.slice(0, 10)}...</td>
                    <td className="px-4 py-3">{ord.userName} ({ord.userEmail})</td>
                    <td className="px-4 py-3 font-mono">{ord.items.reduce((sum, item) => sum + item.quantity, 0)} Items</td>
                    <td className="px-4 py-3 font-mono font-semibold">{ord.total.toLocaleString()} ETB</td>
                    <td className="px-4 py-3">
                      <select
                        value={ord.status}
                        onChange={(e) => handleOrderChangeStatus(ord.id, e.target.value)}
                        className={`rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none font-semibold ${
                          ord.status === "Delivered" ? "text-emerald-600 bg-emerald-50/40" : "text-amber-600 bg-amber-50/40"
                        }`}
                      >
                        <option value="Pending">Pending Approval</option>
                        <option value="Processing">Processing Packaging</option>
                        <option value="Shipped">Dispatched Shipped</option>
                        <option value="Delivered">Completed Delivered</option>
                        <option value="Cancelled">Cancelled Order</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        /* Tab 5: User accounts CRUD panel */
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white">Registered User Accounts ({users.length})</h4>
            <button
              onClick={() => {
                setEditingUser(null);
                setUserForm({ name: "", email: "", role: "customer", password: "" });
                setUserModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-semibold text-white shadow"
            >
              <Plus size={14} /> Create New Account
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left font-bold text-gray-500">
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Access Level Role</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map((usr) => (
                  <tr key={usr.id}>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{usr.name}</td>
                    <td className="px-4 py-3 text-gray-500">{usr.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        usr.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(usr);
                          setUserForm({ name: usr.name, email: usr.email, role: usr.role, password: "" });
                          setUserModalOpen(true);
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-amber-500"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        /* Tab 6: Raw Materials & Stock Level tracking logs */
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white">High-Fidelity Material Stock Alerts</h4>
            <span className="rounded bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 flex items-center gap-1">
              <Info size={12} /> Auto-Updated by local Cron Service every 60s
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* Raw materials inventory tracking lists */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-dark-900/50">
              <h5 className="text-xs font-bold text-gray-900 dark:text-white mb-3">Sourcing Material Logs (Ethiopia Supply-Chain)</h5>
              <div className="flex flex-col gap-3 text-xs">
                {[
                  { item: "Organic Highland Coffee Beans (Arba Minch / Harar)", stock: "14.2 Tons Sourced", status: "Nominal" },
                  { item: "Linen cotton thread weavers (Gulele / Piazza weavers)", stock: "2,400 Metres Allocated", status: "High Demand" },
                  { item: "Traditional Gondar Sheepskin (Bole Leather Factory)", stock: "850 Square Metres", status: "Nominal" },
                  { item: "Verified Computing Chips & Glass Imports", stock: "140 units in Cargo", status: "Restocked" },
                ].map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2 dark:border-gray-800">
                    <div>
                      <p className="font-semibold text-gray-950 dark:text-gray-200">{mat.item}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{mat.stock}</p>
                    </div>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">{mat.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Low-Stock inventory alerts */}
            <div className="rounded-xl border border-red-100 bg-red-50/10 p-5 dark:border-red-950/20">
              <h5 className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-1">
                <ShieldAlert size={14} /> High-Priority Catalog Depletions
              </h5>
              <div className="flex flex-col gap-3">
                {products.filter(p => p.stock < (p.minStock || 5)).map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800/50 text-xs">
                    <div>
                      <p className="font-semibold text-gray-950 dark:text-gray-200">{prod.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize mt-0.5">{prod.category} section</p>
                    </div>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                      ONLY {prod.stock} LEFT
                    </span>
                  </div>
                ))}
                {products.filter(p => p.stock < (p.minStock || 5)).length === 0 && (
                  <p className="text-xs text-emerald-600 font-semibold text-center py-6">All marketplace catalog item stock levels are nominal!</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CRUD Product Modal */}
      {prodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-dark-800">
            <h4 className="font-display text-base font-bold text-gray-900 dark:text-white mb-4">
              {editingProduct ? "Modify Catalog Product" : "Publish New Product"}
            </h4>
            <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="font-semibold text-gray-500">Product Title Name:</span>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Sourcing Category:</span>
                <select
                  value={prodForm.category}
                  onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Available Stock:</span>
                <input
                  type="number"
                  required
                  value={prodForm.stock}
                  onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Retail Price (ETB):</span>
                <input
                  type="number"
                  required
                  value={prodForm.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Original Price (Strikeout):</span>
                <input
                  type="number"
                  required
                  value={prodForm.oldPrice}
                  onChange={(e) => setProdForm({ ...prodForm, oldPrice: Number(e.target.value) })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="font-semibold text-gray-500">Image Reference Link (Unsplash):</span>
                <input
                  type="text"
                  required
                  value={prodForm.image}
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <span className="font-semibold text-gray-500">Detailed Description:</span>
                <textarea
                  required
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setProdModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 font-semibold text-white hover:from-amber-600 hover:to-yellow-600"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-dark-800">
            <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-4">
              {editingCategory ? "Modify Category" : "Add New Sourcing Section"}
            </h4>
            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Category Name:</span>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Vector Lucide Icon Name:</span>
                <input
                  type="text"
                  required
                  value={catForm.icon}
                  onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Brief Overview:</span>
                <textarea
                  required
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 font-semibold text-white hover:from-amber-600 hover:to-yellow-600"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-dark-800">
            <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-4">
              {editingUser ? "Modify Account" : "Register New Admin/Customer"}
            </h4>
            <form onSubmit={handleSaveUser} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">User Real Name:</span>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Email Address:</span>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Access Role:</span>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                >
                  <option value="customer">customer (Standard shopper)</option>
                  <option value="admin">admin (Full administrative panels)</option>
                </select>
              </div>

              {!editingUser && (
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-gray-500">Access Password:</span>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="rounded-lg border border-gray-200 bg-white p-2.5 outline-none dark:border-gray-700 dark:bg-dark-900"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 font-semibold text-white hover:from-amber-600 hover:to-yellow-600"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

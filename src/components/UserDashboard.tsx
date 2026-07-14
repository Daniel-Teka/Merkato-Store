import React, { useState, useEffect } from "react";
import { User, ClipboardList, CreditCard, Tag, RefreshCw, ChevronRight, Check, QrCode, FileText, ShoppingBag, Clock } from "lucide-react";
import { Order } from "../types";
import { api } from "../api";

interface UserDashboardProps {
  user: any;
  onNavigate: (view: string) => void;
}

export default function UserDashboard({ user, onNavigate }: UserDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  // Invoice modal
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allOrders = await api.orders.list();
      setOrders(allOrders);
    } catch (err: any) {
      setError(err.message || "Failed to download orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 3000);
  };

  const getStatusSteps = (status: string) => {
    const steps = ["Pending", "Processing", "Shipped", "Delivered"];
    const activeIdx = steps.indexOf(status);
    return steps.map((step, idx) => ({
      name: step,
      done: idx <= activeIdx,
      active: idx === activeIdx,
    }));
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm text-gray-500">Please sign in to view your personalized customer dashboard.</p>
        <button
          onClick={() => onNavigate("login")}
          className="mt-4 rounded-lg bg-amber-500 px-6 py-2 text-xs font-semibold text-white"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div id="merkato-user-dashboard" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Upper Grid: Welcome Card & Reward Coupons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        
        {/* Welcome Profile Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900 md:col-span-2 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
              Selaam, {user.name}!
            </h2>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="rounded bg-amber-100/60 px-2 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 uppercase tracking-widest">
                Account: {user.role}
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                Verified Customer
              </span>
            </div>
          </div>
        </div>

        {/* Copyable Rewards Box */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/25 p-5 shadow-sm dark:border-amber-950/20 dark:bg-dark-900 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1">
              <Tag size={10} /> Exclusive Member Rewards
            </span>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-light">
              Use code below to claim 10% discount on entire cart during upcoming holidays.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed border-amber-300 bg-white p-2 dark:border-amber-500/20 dark:bg-dark-800">
            <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">MERKATO10</span>
            <button
              onClick={() => copyCoupon("MERKATO10")}
              className="rounded bg-amber-500 px-3 py-1 text-[10px] font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              {copied === "MERKATO10" ? "Copied!" : "Copy Code"}
            </button>
          </div>
        </div>

      </div>

      {/* Orders Logs Section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-dark-900">
        <div className="mb-6 flex items-center justify-between border-b border-gray-50 pb-4 dark:border-gray-800">
          <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={18} className="text-amber-500" /> Recent Purchase Orders History ({orders.length})
          </h3>
          <button
            onClick={fetchOrders}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Refresh Orders"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <RefreshCw size={24} className="text-amber-500 animate-spin" />
            <p className="text-xs text-gray-400">Loading purchase histories...</p>
          </div>
        ) : error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <ShoppingBag size={24} className="text-gray-300" />
            <p className="text-xs text-gray-500 font-light">You haven't placed any orders yet on MERKATO.</p>
            <button
              onClick={() => onNavigate("products")}
              className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white dark:bg-amber-500 dark:text-dark-900"
            >
              Go to Store
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-dark-900/50 flex flex-col gap-5"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3 dark:border-gray-800 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{order.id}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400">Order Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400">Grand Total:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {order.total.toLocaleString()} ETB
                    </span>
                  </div>
                  <button
                    onClick={() => setInvoiceOrder(order)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-dark-800 dark:text-gray-300"
                  >
                    <FileText size={12} /> View Invoice
                  </button>
                </div>

                {/* Items summary */}
                <div className="flex flex-wrap gap-4 text-xs">
                  {order.items.map((it, index) => (
                    <span key={index} className="rounded-lg bg-white border border-gray-100 px-3 py-1.5 dark:bg-dark-800 dark:border-gray-700 font-medium">
                      {it.name} (Qty: {it.quantity})
                    </span>
                  ))}
                </div>

                {/* Delivery progress stepper timeline */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> Active Delivery Tracking:
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center mt-2">
                    {getStatusSteps(order.status).map((st, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold ${
                            st.done ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                          } ${st.active ? "ring-4 ring-amber-500/20" : ""}`}
                        >
                          {st.done ? <Check size={12} /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-semibold ${
                          st.active ? "text-amber-500 font-bold" : st.done ? "text-emerald-600" : "text-gray-400"
                        }`}>
                          {st.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Modal Overlay */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-colors dark:bg-dark-800">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <h4 className="font-display text-base font-bold text-gray-900 dark:text-white">
                Official Commercial Invoice
              </h4>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                Close
              </button>
            </div>

            {/* Printable Invoice content */}
            <div className="mt-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-900/50">
              <div className="flex justify-between border-b border-gray-200/50 pb-3 dark:border-gray-700">
                <div>
                  <h5 className="font-display font-bold text-gray-900 dark:text-white">MERKATO INC.</h5>
                  <p className="text-[9px] text-gray-400">Addis Ababa, Piazza, Ethiopia</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">INVOICE #{invoiceOrder.id.slice(0, 8)}</p>
                  <p className="text-[9px] text-gray-400">{new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="my-3 text-[10px] text-gray-500 flex justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">Billed To:</p>
                  <p>{invoiceOrder.userName}</p>
                  <p>{invoiceOrder.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 dark:text-gray-200">Payment Channel:</p>
                  <p>{invoiceOrder.paymentMethod}</p>
                  <p>Status: <span className="font-bold text-emerald-600">{invoiceOrder.status}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-[10px] my-3">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 font-bold text-gray-500">
                    <th className="text-left py-1">Item Detail</th>
                    <th className="text-right py-1">Price</th>
                    <th className="text-right py-1">Qty</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {invoiceOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-medium text-gray-900 dark:text-white">{it.name}</td>
                      <td className="text-right py-1.5 font-mono">{it.price ? it.price.toLocaleString() : "N/A"} ETB</td>
                      <td className="text-right py-1.5 font-mono">{it.quantity}</td>
                      <td className="text-right py-1.5 font-mono">{(it.price ? it.price * it.quantity : 0).toLocaleString()} ETB</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals box */}
              <div className="border-t border-gray-200/50 pt-3 dark:border-gray-700 flex flex-col gap-1 text-[10px] text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">{invoiceOrder.subtotal?.toLocaleString() || invoiceOrder.total.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%):</span>
                  <span className="font-mono">{invoiceOrder.vat?.toLocaleString() || "Calculated"} ETB</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono">{invoiceOrder.total.toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Scan QR */}
              <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                <div className="bg-white p-1 rounded-md border border-gray-100">
                  <QrCode size={48} className="text-gray-900" />
                </div>
                <div className="flex-1">
                  <p className="text-[8px] text-gray-400 font-light leading-normal">
                    This document is digitally certified by the Ethiopian Revenue Ministry and MERKATO. Carry this QR code to verify Piazza/Bole gate delivery routing.
                  </p>
                </div>
              </div>

            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 w-full rounded-xl bg-gray-900 py-2 text-center text-xs font-semibold text-white hover:bg-gray-800 dark:bg-amber-500 dark:text-dark-900"
            >
              Print Official Copy
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from "react";
import { Trash2, ShoppingBag, Plus, Minus, Tag, ShieldCheck, CreditCard, RefreshCw, QrCode, ArrowRight, CheckCircle2 } from "lucide-react";
import { Product } from "../types";
import { api } from "../api";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigate: (view: string) => void;
  user: any;
  onOrderCompleted: () => void;
}

export default function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
  user,
  onOrderCompleted,
}: CartViewProps) {
  // Coupon and Pricing State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Checkout and Demo Payment state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("telebirr"); // telebirr, chapa, cod
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentStep, setPaymentStep] = useState("form"); // form, processing, success
  const [processingPayment, setProcessingPayment] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Price calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const subtotalAfterDiscount = Math.round(rawSubtotal * (1 - discountPercent / 100));
  const vat = Math.round(subtotalAfterDiscount * 0.15); // 15% VAT
  const deliveryFee = rawSubtotal === 0 ? 0 : subtotalAfterDiscount > 15000 ? 0 : 250;
  const grandTotal = subtotalAfterDiscount + vat + deliveryFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await api.coupons.validate(couponCode, rawSubtotal);
      setAppliedCoupon({ code: res.code, discountPercent: res.discountPercent });
      setCouponError("");
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      onNavigate("login");
      return;
    }
    setCheckoutModalOpen(true);
    setPaymentStep("form");
    setPhoneNumber(user.phone || "");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    setPaymentStep("processing");

    // Simulate OTP / Payment response delay
    setTimeout(async () => {
      try {
        const orderItems = cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
        }));

        const order = await api.orders.create({
          items: orderItems,
          paymentMethod: paymentMethod === "telebirr" ? "Telebirr Mobile Pay" : paymentMethod === "chapa" ? "Chapa Bank Pay" : "Cash on Delivery",
          couponCode: appliedCoupon?.code,
        });

        setPlacedOrder(order);
        setPaymentStep("success");
        onClearCart();
        onOrderCompleted();
      } catch (err: any) {
        alert(err.message || "Checkout failed. Please verify stock quantities.");
        setPaymentStep("form");
      } finally {
        setProcessingPayment(false);
      }
    }, 2500);
  };

  if (cart.length === 0 && paymentStep !== "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-dark-800">
          <ShoppingBag size={28} className="text-amber-500 animate-bounce" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm font-light">
          Fill your basket with authentic Ethiopian specialties and top-tier global tech. Explore our categories today.
        </p>
        <button
          onClick={() => onNavigate("products")}
          className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-xs font-semibold text-white shadow"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div id="merkato-cart-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Your Shopping Cart
      </h1>

      {paymentStep === "success" && placedOrder ? (
        /* Success Invoice Overlay Screen */
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-100 bg-white p-6 shadow-xl transition-colors dark:border-emerald-950/20 dark:bg-dark-800">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Order Confirmed Successfully!</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Thank you for shopping on MERKATO. Your invoice has been generated below.
            </p>
          </div>

          <div className="mt-6 border-t border-b border-gray-100 py-4 dark:border-gray-700">
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice ID:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">{placedOrder.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Channel:</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Grand Total:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{placedOrder.total.toLocaleString()} ETB</span>
              </div>
            </div>
          </div>

          {/* QR Invoice & Verification Badge */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-gray-200">
              <QrCode size={120} className="text-gray-900" />
            </div>
            <p className="text-[10px] text-gray-400">
              Scan this secure QR Invoice to verify delivery coordinates and transaction logs in Addis Ababa.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onNavigate("dashboard")}
              className="flex-1 rounded-lg bg-gray-900 py-2.5 text-center text-xs font-semibold text-white hover:bg-gray-800 dark:bg-amber-500 dark:text-dark-900 dark:hover:bg-amber-400 transition-colors"
            >
              Track Order Status
            </button>
            <button
              onClick={() => {
                setPlacedOrder(null);
                setPaymentStep("form");
                onNavigate("products");
              }}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        /* Standard Cart Layout */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Cart items list - 8 Cols */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 rounded-xl border border-gray-50 bg-white p-4 shadow-sm transition-all hover:border-amber-100 dark:border-gray-800 dark:bg-dark-900"
              >
                {/* Thumb image */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-dark-950">
                  <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.product.category}</p>
                  <p className="mt-1 font-mono text-xs font-bold text-gray-900 dark:text-white">
                    {item.product.price.toLocaleString()} ETB
                  </p>
                </div>

                {/* Counter */}
                <div className="flex items-center rounded-lg border border-gray-100 bg-white p-1 dark:border-gray-800 dark:bg-dark-800">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                    className="p-1 hover:text-amber-500"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-mono w-8 text-center text-xs font-semibold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                    className="p-1 hover:text-amber-500"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Trash */}
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-red-500 dark:hover:bg-gray-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Pricing calculations Summary - 4 Cols */}
          <div className="lg:col-span-4 flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-900">
            <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">Order Invoice Summary</h3>
            
            {/* Promo coupon form */}
            <form onSubmit={handleApplyCoupon} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Coupon Promo Code:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. MERKATO10"
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400 dark:bg-amber-500 dark:text-dark-900 transition-colors"
                >
                  {validatingCoupon ? <RefreshCw size={12} className="animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Tag size={10} /> Active: '{appliedCoupon.code}' ({appliedCoupon.discountPercent}% Discount Applied)
                </p>
              )}
            </form>

            <div className="border-t border-gray-100 pt-4 dark:border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items):</span>
                <span className="font-mono">{rawSubtotal.toLocaleString()} ETB</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon.discountPercent}%):</span>
                  <span className="font-mono">-{Math.round(rawSubtotal * (appliedCoupon.discountPercent / 100)).toLocaleString()} ETB</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>VAT (15%):</span>
                <span className="font-mono">{vat.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee:</span>
                <span className="font-mono">{deliveryFee === 0 ? "FREE" : `${deliveryFee} ETB`}</span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-[10px] text-amber-500 italic">Add {(15000 - subtotalAfterDiscount).toLocaleString()} ETB more for Free Delivery!</p>
              )}
              <div className="border-t border-gray-100 pt-3 dark:border-gray-800 flex justify-between font-bold text-gray-900 dark:text-white text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-base">{grandTotal.toLocaleString()} ETB</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-sm font-semibold text-white hover:from-amber-600 hover:to-yellow-600 shadow-md shadow-amber-500/10 transition-colors"
            >
              Checkout Now <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
              <ShieldCheck size={12} className="text-emerald-500" /> SECURED INTEGRATED GURSHA SYSTEM
            </div>
          </div>

        </div>
      )}

      {/* Checkout Payment Portal Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-colors dark:bg-dark-800">
            
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-amber-500" /> Online Payment Portal
              </h3>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              >
                Close
              </button>
            </div>

            {paymentStep === "processing" ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <RefreshCw size={36} className="text-amber-500 animate-spin" />
                <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                  Authenticating OTP signature with {paymentMethod === "telebirr" ? "Telebirr" : "Chapa Pay Gateway"}... Please do not close or reload.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-gray-500">Select Payment Method:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "telebirr", label: "Telebirr", desc: "Mobile Pay" },
                      { id: "chapa", label: "Chapa", desc: "Bank Gateway" },
                      { id: "cod", label: "COD", desc: "Cash Delivery" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all ${
                          paymentMethod === m.id
                            ? "border-amber-500 bg-amber-50/25 dark:bg-amber-950/10"
                            : "border-gray-100 hover:border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <span className="text-xs font-bold text-gray-900 dark:text-white capitalize">{m.label}</span>
                        <span className="text-[9px] text-gray-400">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod !== "cod" && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-500">
                      {paymentMethod === "telebirr" ? "Telebirr Registered Mobile Number:" : "Bank Account / Card Number:"}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={paymentMethod === "telebirr" ? "e.g. +251 911 000000" : "Enter card / account details"}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-dark-900 dark:text-white"
                    />
                    <p className="text-[10px] text-gray-400 leading-normal">
                      A secure 6-digit confirmation PIN will be sent to authorize payment of <strong>{grandTotal.toLocaleString()} ETB</strong>.
                    </p>
                  </div>
                )}

                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700 flex justify-between items-center text-xs font-semibold text-gray-500">
                  <span>Grand Total Payable:</span>
                  <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{grandTotal.toLocaleString()} ETB</span>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 shadow-md transition-all"
                >
                  Pay & Authorize Delivery
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

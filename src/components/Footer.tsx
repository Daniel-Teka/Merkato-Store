import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, Shield, Globe } from "lucide-react";

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer id="merkato-footer" className="mt-16 border-t border-gray-200 bg-gray-50 transition-colors dark:border-gray-800 dark:bg-dark-950">
      
      {/* Upper Footer section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              MERKATO
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Inspired by Africa's largest open-air market, MERKATO brings authentic organic single-origin coffee, traditional handwoven Habesha apparel, and global flagship tech right to your doorstep.
            </p>
            <div className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-amber-500" /> Addis Ababa, Piazza (Gulele district), Ethiopia
              </span>
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-amber-500" /> +251 911 000 000 / +251 116 000 00
              </span>
              <span className="flex items-center gap-2">
                <Mail size={14} className="text-amber-500" /> support@merkato.com
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              {["Food", "Fashion", "Shoes", "Beauty", "Home", "Computers", "Phones"].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigate("products")}
                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                  >
                    {cat} Specialty
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              {["Home", "Products", "About", "Contact", "Wishlist", "Cart"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onNavigate(item.toLowerCase())}
                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm font-semibold text-gray-900 dark:text-white">
              Newsletter
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Subscribe to get notified about flash sales, weekly coupon offers, and new premium arrivals.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-amber-500 dark:border-gray-800 dark:bg-dark-900 dark:focus:border-amber-400"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-white hover:from-amber-600 hover:to-yellow-600 transition-colors"
              >
                <Send size={14} />
              </button>
            </form>
            {subscribed && (
              <div className="rounded bg-emerald-50 p-2 text-center text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                🎉 Gursha of gratitude! Check your inbox soon.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Middle Certifications */}
      <div className="border-t border-b border-gray-200/50 bg-gray-100/50 py-4 transition-colors dark:border-gray-800/50 dark:bg-dark-950/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><Shield size={12} className="text-emerald-500" /> 100% Secure Checkout</span>
          <span className="flex items-center gap-1.5"><Globe size={12} className="text-emerald-500" /> Verified Ethiopian Artisan Goods</span>
          <span className="flex items-center gap-1.5"><HelpCircle size={12} className="text-emerald-500" /> 24/7 Premium Hotline</span>
        </div>
      </div>

      {/* Lower Copyright section */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            © 2026 MERKATO Incorporated. All Rights Reserved. Designed as a Level 4 DB & Website Development project.
          </p>
          <div className="flex gap-4 text-[11px] text-gray-400">
            <button className="hover:text-amber-500">Privacy Policy</button>
            <button className="hover:text-amber-500">Terms of Service</button>
            <button className="hover:text-amber-500">Addis Delivery maps</button>
          </div>
        </div>
      </div>

    </footer>
  );
}

import React from "react";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Product } from "../types";

interface WishlistViewProps {
  wishlist: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
  onNavigate: (view: string, id?: string) => void;
}

export default function WishlistView({
  wishlist,
  onRemoveFromWishlist,
  onMoveToCart,
  onNavigate,
}: WishlistViewProps) {
  if (wishlist.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-dark-800">
          <Heart size={28} className="text-red-500 animate-pulse" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm font-light">
          Tap the heart on any product to save it here for later. Compare options easily.
        </p>
        <button
          onClick={() => onNavigate("products")}
          className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-xs font-semibold text-white shadow"
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div id="merkato-wishlist-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
        Your Wishlist
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.map((prod) => (
          <div
            key={prod.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-dark-900 hover:border-amber-200 hover:shadow-md transition-all"
          >
            {/* Image */}
            <div
              onClick={() => onNavigate("product-details", prod.id)}
              className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-dark-950 cursor-pointer"
            >
              <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
              {prod.discount > 0 && (
                <span className="absolute top-3 left-3 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  {prod.discount}% OFF
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-4">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                {prod.category}
              </span>
              <h3
                onClick={() => onNavigate("product-details", prod.id)}
                className="font-display text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-amber-500 cursor-pointer"
              >
                {prod.name}
              </h3>
              <p className="font-mono mt-1 text-xs font-bold text-gray-900 dark:text-white">
                {prod.price.toLocaleString()} ETB
              </p>

              {/* Action Buttons Row */}
              <div className="mt-4 flex gap-2 border-t border-gray-50 pt-3 dark:border-gray-800">
                <button
                  onClick={() => onMoveToCart(prod)}
                  disabled={prod.stock === 0}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-2 text-center text-[10px] font-semibold text-white hover:bg-gray-800 disabled:bg-gray-200 dark:bg-amber-500 dark:text-dark-900 dark:hover:bg-amber-400 transition-colors"
                >
                  <ShoppingCart size={12} /> Move to Cart
                </button>
                <button
                  onClick={() => onRemoveFromWishlist(prod.id)}
                  className="rounded-lg border border-gray-100 p-2 text-gray-400 hover:bg-gray-50 hover:text-red-500 dark:border-gray-800 dark:hover:bg-gray-800"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

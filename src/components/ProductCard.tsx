import React from "react";
import { Heart, ShoppingCart, Star, ShieldAlert } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  isWishlisted: boolean;
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e?: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const isLowStock = product.stock < (product.minStock || 5);

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onNavigate("product-details", product.id)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg dark:border-gray-800 dark:bg-dark-800 dark:hover:border-amber-500/30"
    >
      {/* Top Banner overlay */}
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          {product.discount}% OFF
        </span>
      )}

      {/* Wishlist Button Overlay */}
      <button
        onClick={(e) => onToggleWishlist(product, e)}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow backdrop-blur-md transition-all hover:scale-110 dark:bg-dark-900/85"
      >
        <Heart
          size={16}
          className={`transition-colors ${
            isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400 group-hover:text-red-400"
          }`}
        />
      </button>

      {/* Product Image Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-dark-900">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {isLowStock && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
            <ShieldAlert size={10} /> LOW STOCK ({product.stock})
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {product.category}
          </span>
          <div className="flex items-center gap-0.5 text-xs text-yellow-500">
            <Star size={12} className="fill-yellow-500 text-yellow-500" />
            <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400">{product.rating}</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-display text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {product.name}
        </h3>

        {/* Product Description Short */}
        <p className="mt-1 flex-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Bottom Pricing & Cart Action Row */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-50 pt-3 dark:border-gray-700/50">
          <div className="flex flex-col">
            {product.oldPrice > product.price && (
              <span className="font-mono text-[10px] text-gray-400 line-through dark:text-gray-500">
                {product.oldPrice.toLocaleString()} ETB
              </span>
            )}
            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
              {product.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">ETB</span>
            </span>
          </div>

          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={product.stock === 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow hover:from-amber-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed dark:shadow-amber-950/20"
            title={product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}

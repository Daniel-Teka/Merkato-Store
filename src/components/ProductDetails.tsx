import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, Heart, ArrowLeft, RefreshCw, Plus, Minus, Tag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Product } from "../types";
import { api } from "../api";

interface ProductDetailsProps {
  productId: string;
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  user: any;
}

export default function ProductDetails({
  productId,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  user,
}: ProductDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.products.get(productId);
      setProduct(res.product);
      setRelated(res.related);
      setActiveImage(res.product.image);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    setQuantity(1);
    setReviewSuccess("");
    setComment("");
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!user) {
      onNavigate("login");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await api.products.addReview(productId, { rating, comment });
      setReviewSuccess("Review submitted successfully!");
      setComment("");
      setRating(5);
      // Refresh details to show new review!
      const refreshed = await api.products.get(productId);
      setProduct(refreshed.product);
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <RefreshCw size={36} className="text-amber-500 animate-spin" />
        <p className="text-xs text-gray-500 dark:text-gray-400">Downloading product specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error || "Product not found"}</p>
        <button
          onClick={() => onNavigate("products")}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft size={14} /> Back to Products
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div id="merkato-product-details" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate("products")}
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400"
      >
        <ArrowLeft size={14} /> Back to Catalog
      </button>

      {/* Main product structure Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        
        {/* Left Side: Images & Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-dark-800">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          {/* Gallery selector */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white dark:bg-dark-900 ${
                    activeImage === img ? "border-amber-500" : "border-gray-100 dark:border-gray-800"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details info */}
        <div className="flex flex-col gap-5">
          {/* Category & Tag */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded bg-amber-100/60 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              <Star size={16} className="fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-gray-900 dark:text-white">{product.rating}</span>
              <span className="text-gray-400">({product.reviews.length} reviews)</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {product.name}
          </h1>

          {/* Pricing Box */}
          <div className="rounded-xl bg-gray-50 p-4 transition-colors dark:bg-dark-800/50">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl font-black text-gray-900 dark:text-white">
                {product.price.toLocaleString()} <span className="text-base font-normal text-gray-500">ETB</span>
              </span>
              {product.oldPrice > product.price && (
                <>
                  <span className="font-mono text-base text-gray-400 line-through">
                    {product.oldPrice.toLocaleString()} ETB
                  </span>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800 dark:bg-red-950/40 dark:text-red-400">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Price inclusive of 15% VAT. Ships within 24 hours in Addis Ababa.</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-2">
              Product Overview
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 font-light">
              {product.description}
            </p>
          </div>

          {/* Sizing & Stock Alerts */}
          <div className="flex items-center gap-4 text-xs font-medium text-gray-700 dark:text-gray-300">
            <span>Availability:</span>
            {isOutOfStock ? (
              <span className="text-red-600 font-bold dark:text-red-400">❌ Out of stock</span>
            ) : (
              <span className={`font-bold ${product.stock < 5 ? "text-amber-500" : "text-emerald-600"}`}>
                {product.stock < 5 ? `Low Stock: Only ${product.stock} items left!` : `In Stock (${product.stock} units)`}
              </span>
            )}
          </div>

          {/* Action Row: Quantities & Add to Cart */}
          {!isOutOfStock && (
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-dark-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Minus size={14} />
                </button>
                <span className="font-mono w-10 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  setQuantity(1);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-sm font-semibold text-white hover:from-amber-600 hover:to-yellow-600 shadow-md shadow-amber-500/10 transition-colors"
              >
                <ShoppingCart size={18} /> Add To Shopping Cart
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                className="rounded-xl border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                title="Toggle Wishlist"
              >
                <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"} />
              </button>
            </div>
          )}

          {/* Safety Features Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-gray-100 pt-5 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-amber-500" /> 100% Quality Gursha Guarantee</span>
            <span className="flex items-center gap-2"><Truck size={16} className="text-amber-500" /> Speedy Delivery in Addis</span>
            <span className="flex items-center gap-2"><RotateCcw size={16} className="text-amber-500" /> Easy 7-day returns policy</span>
          </div>

        </div>
      </div>

      {/* Technical Specifications */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mt-12 border-t border-gray-100 pt-8 dark:border-gray-800">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
            Technical Specifications
          </h3>
          <div className="max-w-2xl overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-dark-900">
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-6 py-3 font-semibold text-gray-500 bg-gray-50/50 dark:bg-dark-800/30 dark:text-gray-400 w-1/3 capitalize">
                      {key}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Reviews */}
      <div className="mt-12 border-t border-gray-100 pt-8 dark:border-gray-800">
        <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-6">
          Customer Reviews ({product.reviews.length})
        </h3>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          
          {/* Write a Review Box */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-dark-900">
            <h4 className="font-display text-sm font-bold text-gray-900 dark:text-white mb-4">
              Write a Review
            </h4>
            {reviewSuccess && (
              <p className="mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {reviewSuccess}
              </p>
            )}
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Rating:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-yellow-500 hover:scale-110 transition-transform"
                    >
                      <Star size={18} className={star <= rating ? "fill-yellow-500" : "text-gray-300 dark:text-gray-700"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500">Comments:</span>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience about product quality and delivery..."
                  className="rounded-lg border border-gray-200 p-3 text-xs outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-dark-800 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="rounded-lg bg-gray-900 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300 dark:bg-amber-500 dark:text-dark-900 dark:hover:bg-amber-400 transition-colors"
              >
                {reviewSubmitting ? <RefreshCw size={14} className="animate-spin inline mr-1" /> : "Submit Review"}
              </button>
            </form>
          </div>

          {/* List Reviews */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {product.reviews.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No reviews yet for this product. Be the first to leave one!</p>
            ) : (
              product.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl border border-gray-50 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-dark-900"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {rev.username}
                    </span>
                    <span className="text-[10px] text-gray-400">{rev.date}</span>
                  </div>
                  <div className="flex gap-0.5 text-yellow-500 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={12} className={star <= rev.rating ? "fill-yellow-500" : "text-gray-200 dark:text-gray-800"} />
                    ))}
                  </div>
                  <p className="text-xs font-light text-gray-600 dark:text-gray-400 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-10 dark:border-gray-800">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-6">
            Recommended Related Products
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {related.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onNavigate("product-details", prod.id)}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-50 bg-white p-3 cursor-pointer shadow-sm hover:border-amber-200 dark:border-gray-800 dark:bg-dark-900"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                  <img src={prod.image} alt="" className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300" />
                </div>
                <h4 className="mt-2.5 font-display text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-500">
                  {prod.name}
                </h4>
                <span className="font-mono mt-1 text-xs font-bold text-gray-900 dark:text-white">
                  {prod.price.toLocaleString()} ETB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

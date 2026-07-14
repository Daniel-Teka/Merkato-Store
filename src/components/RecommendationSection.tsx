import React, { useState } from "react";
import { Sparkles, ArrowRight, MessageSquareCode, ShoppingCart, RefreshCw, Star } from "lucide-react";
import { Product } from "../types";
import { api } from "../api";

interface RecommendationSectionProps {
  onNavigate: (view: string, id: string) => void;
  onAddToCart: (product: Product) => void;
  user: any;
}

export default function RecommendationSection({
  onNavigate,
  onAddToCart,
  user,
}: RecommendationSectionProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [aiGreeting, setAiGreeting] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const quickPrompts = [
    { label: "Traditional Buna Ceremony ☕", prompt: "I want to host an authentic traditional Ethiopian coffee ceremony. What products do I need?" },
    { label: "Elite Developer Setup 💻", prompt: "Suggest a premium high-end software development laptop and audio setup." },
    { label: "Habesha Wedding Wardrobe 🌸", prompt: "What are the best traditional Ethiopian clothes and leather accessories for a formal ceremony?" },
    { label: "Active Highland Runner 🏃", prompt: "Find some top-tier running shoes and hydration flasks for high-altitude sports." },
  ];

  const handleRecommend = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const preferences = {
        name: user ? user.name : "Guest Shopper",
        role: user ? user.role : "customer",
      };
      const res = await api.gemini.recommend(promptText, preferences);
      setRecommendations(res.recommendations);
      setAiGreeting(res.greeting);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="merkato-recommendations" className="mt-12 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-6 shadow-sm transition-colors dark:border-amber-950/20 dark:from-dark-800 dark:to-dark-900">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow shadow-amber-500/20 animate-pulse">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
            AI-Powered Personalized Shopping Advisor
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tell our Gemini AI shopping assistant what you are looking for. We will curate the perfect package from our catalog.
          </p>
        </div>
      </div>

      {/* Quick Prompts Chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(qp.prompt);
              handleRecommend(qp.prompt);
            }}
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-gray-800 dark:bg-dark-900 dark:text-gray-300 dark:hover:border-amber-500/30 dark:hover:bg-amber-950/20 dark:hover:text-amber-400"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRecommend(query);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I need products to prepare high-quality premium espresso, or traditional holiday styles..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm outline-none transition-colors focus:border-amber-500 dark:border-gray-800 dark:bg-dark-900 dark:text-white dark:focus:border-amber-400"
          />
          <span className="absolute right-3.5 top-3.5 text-amber-500">
            <Sparkles size={16} />
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 text-sm font-semibold text-white shadow-md hover:from-amber-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
      </form>

      {/* Recommendations Results Box */}
      {hasSearched && (
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <RefreshCw size={32} className="text-amber-500 animate-spin" />
              <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                Gemini is analyzing catalog item specifications and reviews to curate your custom Gursha package...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Personalized AI Welcome Greeting */}
              {aiGreeting && (
                <div className="rounded-xl bg-amber-50/50 p-4 border border-amber-100/50 text-xs italic text-amber-800 dark:bg-amber-950/10 dark:border-amber-950/20 dark:text-amber-400 leading-relaxed">
                  📢 <strong>AI Guide:</strong> {aiGreeting}
                </div>
              )}

              {recommendations.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No direct product matches found. Try widening your search vocabulary!
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {recommendations.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-dark-900"
                    >
                      {/* Image */}
                      <div
                        onClick={() => onNavigate("product-details", prod.id)}
                        className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-50 cursor-pointer dark:bg-dark-950"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Info Details */}
                      <div className="flex flex-1 flex-col mt-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            {prod.category}
                          </span>
                          <div className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-bold">
                            <Star size={10} className="fill-yellow-500 text-yellow-500" /> {prod.rating}
                          </div>
                        </div>

                        <h4
                          onClick={() => onNavigate("product-details", prod.id)}
                          className="font-display text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 cursor-pointer hover:text-amber-500"
                        >
                          {prod.name}
                        </h4>

                        {/* Custom AI Reason explaining why Gemini recommended it */}
                        <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 border-l-2 border-emerald-500 pl-2 bg-emerald-50/20 py-1 rounded-r dark:bg-emerald-950/10">
                          {prod.aiReason || "Matches your specified preference query."}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-50 pt-2.5 dark:border-gray-800">
                          <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                            {prod.price.toLocaleString()} ETB
                          </span>
                          <button
                            onClick={() => onAddToCart(prod)}
                            disabled={prod.stock === 0}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-300 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                          >
                            <ShoppingCart size={10} /> Add Cart
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}

    </div>
  );
}

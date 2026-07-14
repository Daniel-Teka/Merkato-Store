import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Coffee, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeroProps {
  onNavigate: (view: string, category?: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Traditional Luxury Crafted in Addis",
      subtitle: "Experience authentic Habesha Kemis, linen clothing, and Gondar genuine sheepskin leathers made by expert weavers.",
      badge: "Pure Cotton Handwoven",
      cta: "Explore Fashion",
      category: "Fashion",
      bgImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200",
      themeColor: "from-amber-500/80 to-yellow-600/80",
    },
    {
      title: "World Celebrated Highlands Coffee",
      subtitle: "Savor the rich blueberry notes of natural Harar beans or washed floral Yirgacheffe coffee paired with raw white forest honey.",
      badge: "Single-Origin Speciality",
      cta: "Shop Organic Food",
      category: "Food",
      bgImage: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
      themeColor: "from-amber-800/80 to-yellow-700/80",
    },
    {
      title: "Next-Gen Tech & Intelligent Computing",
      subtitle: "Equip your workspace with M3 MacBook Pros, iPhone 15 Titanium, Google Pixels, and industry-leading audio headsets.",
      badge: "100% Verified Flagships",
      cta: "Discover Computers",
      category: "Computers",
      bgImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200",
      themeColor: "from-blue-600/70 to-indigo-800/80",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div id="merkato-hero" className="relative h-[480px] w-full overflow-hidden rounded-2xl bg-gray-900 shadow-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          style={{ backgroundImage: `url(${slides[currentSlide].bgImage})` }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        >
          {/* Overlay gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].themeColor} via-black/70 to-black/80`} />

          {/* Slide Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-3xl">
            
            {/* Promo Badge */}
            <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-md">
              <Sparkles size={12} /> {slides[currentSlide].badge}
            </div>

            {/* Slide Title */}
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              {slides[currentSlide].title}
            </h1>

            {/* Slide Subtitle */}
            <p className="mt-4 text-sm text-gray-200 sm:text-base leading-relaxed font-light">
              {slides[currentSlide].subtitle}
            </p>

            {/* Call To Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("products")}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-white hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/20 transition-all hover:translate-x-1"
              >
                {slides[currentSlide].cta} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate("products")}
                className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                Browse All Marketplace
              </button>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "w-8 bg-amber-500" : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

    </div>
  );
}

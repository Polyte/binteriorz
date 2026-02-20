import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Clock, ChevronLeft, ChevronRight, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router';

const STORAGE_KEY = 'bi_recently_viewed';
const MAX_ITEMS = 12;

/** Read recently viewed IDs from localStorage */
export function getRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Record a product view (most recent first, deduplicated, capped) */
export function trackProductView(productId: string) {
  try {
    const ids = getRecentlyViewedIds().filter((id) => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage might be full – gracefully degrade
  }
}

interface RecentlyViewedProps {
  products: any[];
  onQuickView: (p: any) => void;
}

export const RecentlyViewed = ({ products, onQuickView }: RecentlyViewedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Hydrate on mount
  useEffect(() => {
    const ids = getRecentlyViewedIds();
    if (ids.length === 0) return;
    const mapped = ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
    setRecentProducts(mapped);
  }, [products]);

  // Scroll-state checker
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [recentProducts]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.65;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (recentProducts.length === 0 || dismissed) return null;

  return (
    <section className="py-20 md:py-24 bg-neutral-50/80 border-y border-neutral-100 overflow-hidden relative">
      {/* Subtle grain */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
              <Clock className="w-4 h-4 text-neutral-500" />
            </div>
            <div>
              <h3
                className="text-lg md:text-xl text-neutral-900 tracking-tight"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Recently Viewed
              </h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold mt-0.5">
                {recentProducts.length} piece{recentProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation arrows */}
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scroll('left')}
                  className="w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scroll('right')}
                  className="w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:border-neutral-400 transition-all shadow-sm ml-1"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.04,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-shrink-0 w-[200px] md:w-[220px] group"
            >
              <Link
                to={`/product/${product.id}`}
                className="block"
              >
                {/* Image */}
                <div
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-3 bg-neutral-100"
                  style={{
                    backgroundColor: product.colorHex
                      ? `${product.colorHex}12`
                      : '#f5f5f5',
                  }}
                >
                  <ImageWithFallback
                    src={product.image_url || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 grayscale-[0.15] group-hover:grayscale-0"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                      <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-neutral-900" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="px-1">
                  <p
                    className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-1"
                    style={{ fontFamily: 'var(--font-josefin)' }}
                  >
                    {product.category}
                  </p>
                  <h4
                    className="text-sm text-neutral-900 font-medium truncate tracking-tight group-hover:text-neutral-500 transition-colors"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    {product.name}
                  </h4>
                  <p className="text-xs text-neutral-500 font-semibold mt-1">
                    R {(product.price || 0).toLocaleString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
import React, { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Link } from 'react-router';

interface ProductSliderProps {
  products: any[];
  title: string;
  onAddToCart: (p: any) => void;
  onToggleWishlist: (p: any) => void;
  onQuickView: (p: any) => void;
  wishlistItems: any[];
}

export const ProductSlider = ({
  products,
  title,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistItems,
}: ProductSliderProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onScroll);
    onScroll();
    return () => {
      emblaApi.off('scroll', onScroll);
      emblaApi.off('reInit', onScroll);
    };
  }, [emblaApi, onScroll]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section className="py-28 md:py-36 overflow-hidden relative">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-16 md:mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-neutral-300" />
              <span
                className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                New in Studio
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl text-neutral-900 leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-6"
          >
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-900 group"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              Full Catalogue
              <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-900 group-hover:border-neutral-900 group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
            <div className="flex gap-2">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="w-12 h-12 border border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900 transition-all rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="w-12 h-12 border border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900 transition-all rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Carousel */}
      <div className="px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div
          className="overflow-hidden relative"
          ref={emblaRef}
          style={{ position: 'relative' }}
        >
          <div
            className="flex -ml-6 relative"
            style={{ position: 'relative' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] pl-6 relative"
                style={{ position: 'relative' }}
              >
                <ProductCard
                  {...product}
                  onAddToCart={() => onAddToCart(product)}
                  onToggleWishlist={() => onToggleWishlist(product)}
                  onQuickView={() => onQuickView(product)}
                  isWishlisted={wishlistItems.some(
                    (item) => item.id === product.id
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scroll progress bar */}
        <div className="mt-12 md:mt-16 flex items-center gap-6">
          <div className="flex-1 h-[1px] bg-neutral-100 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-neutral-900 origin-left"
              style={{ width: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span
            className="text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-bold flex-shrink-0 tabular-nums"
            style={{ fontFamily: 'var(--font-josefin)' }}
          >
            {products.length} pieces
          </span>
        </div>
      </div>
    </section>
  );
};

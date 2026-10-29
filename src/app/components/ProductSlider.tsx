import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, useInView } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';
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
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.3 });
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    duration: 32,
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const displayProducts = useMemo(() => {
    const editorialOrder = [
      'bid-cus-188', 'bid-cus-191', 'bid-chr-210', 'bid-bed-217',
      'bid-bed-218', 'bid-tbl-224', 'bid-con-225', 'bid-tbl-165',
      'bid-con-185', 'bid-tbl-180', 'bid-tbl-187', 'bid-sof-084',
      'bid-sof-150', 'bid-chr-177', 'bid-pnd-230', 'bid-rug-014',
    ];
    const rank = new Map(editorialOrder.map((id, index) => [id, index]));
    return [...products]
      .filter((product) => product.image || product.mainImage || product.image_url)
      .sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999))
      .slice(0, 16);
  }, [products]);

  const updateCarouselState = useCallback(() => {
    if (!emblaApi) return;
    const snaps = emblaApi.scrollSnapList().length;
    const selected = emblaApi.selectedScrollSnap();
    setSnapCount(snaps);
    setSelectedIndex(selected);
    setScrollProgress(snaps > 0 ? (selected + 1) / snaps : 0);
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', updateCarouselState);
    emblaApi.on('reInit', updateCarouselState);
    updateCarouselState();
    return () => {
      emblaApi.off('select', updateCarouselState);
      emblaApi.off('reInit', updateCarouselState);
    };
  }, [emblaApi, updateCarouselState]);

  useEffect(() => {
    if (!emblaApi || !isInView || userPaused || isInteracting || displayProducts.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => emblaApi.scrollNext(), 4200);
    return () => window.clearInterval(timer);
  }, [emblaApi, isInView, userPaused, isInteracting, displayProducts.length]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section ref={sectionRef} id="catalogue" className="relative scroll-mt-24 overflow-hidden border-y border-[#dfd7ca] bg-[#f4f0e9] py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(#8b7457_0.55px,transparent_0.55px)] [background-size:10px_10px]" />
      {/* Section header */}
      <div className="relative mx-auto mb-12 max-w-[1480px] px-6 sm:px-8 lg:px-12 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-[#ad8b5d]" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#806a4f]"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                New in Studio
              </span>
            </div>
            <h2
              className="max-w-3xl text-4xl leading-[0.96] tracking-tight text-[#241d17] md:text-6xl lg:text-7xl"
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
            className="flex items-center gap-4"
          >
            <Link
              to="/shop"
              className="group hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#241d17] md:flex"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              Full Catalogue
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cbbda9] transition-all duration-300 group-hover:border-[#241d17] group-hover:bg-[#241d17] group-hover:text-white">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserPaused((paused) => !paused)}
                className="grid h-12 w-12 place-items-center rounded-full border border-[#cbbda9] text-[#806a4f] transition-all hover:border-[#241d17] hover:bg-white hover:text-[#241d17]"
                aria-label={userPaused ? 'Resume automatic product sliding' : 'Pause automatic product sliding'}
              >
                {userPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
              </button>
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous products"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cbbda9] text-[#806a4f] transition-all hover:border-[#241d17] hover:bg-white hover:text-[#241d17] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next products"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cbbda9] text-[#806a4f] transition-all hover:border-[#241d17] hover:bg-white hover:text-[#241d17] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12">
        <div
          className="relative overflow-hidden"
          ref={emblaRef}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onFocusCapture={() => setIsInteracting(true)}
          onBlurCapture={() => setIsInteracting(false)}
          onPointerDown={() => setIsInteracting(true)}
          onPointerUp={() => setIsInteracting(false)}
          style={{ position: 'relative' }}
        >
          <div
            className="relative -ml-5 flex"
            style={{ position: 'relative' }}
          >
            {displayProducts.map((product, index) => (
              <div
                key={product.id}
                className="relative flex-[0_0_88%] pl-5 sm:flex-[0_0_48%] lg:flex-[0_0_32%] xl:flex-[0_0_25%]"
                style={{ position: 'relative' }}
              >
                <ProductCard
                  imageSizes="(min-width: 1280px) 25vw, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, 88vw"
                  {...product}
                  featured={index < 4 || product.featured}
                  editorialIndex={index + 1}
                  eager={index < 4}
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
        <div className="mt-10 flex items-center gap-5 md:mt-14">
          <span className="w-8 text-[10px] font-bold tabular-nums text-[#806a4f]">{String(selectedIndex + 1).padStart(2, '0')}</span>
          <div className="relative h-px flex-1 overflow-hidden bg-[#d9cfbf]">
            <motion.div
              className="absolute left-0 top-0 h-full origin-left bg-[#6f5437]"
              style={{ width: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span
            className="text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-bold flex-shrink-0 tabular-nums"
            style={{ fontFamily: 'var(--font-josefin)' }}
          >
            {String(snapCount || displayProducts.length).padStart(2, '0')} curated pieces
          </span>
        </div>
      </div>
    </section>
  );
};

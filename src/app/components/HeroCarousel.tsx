import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ScrollIndicator } from './ScrollIndicator';
import { Link } from 'react-router';

const slides = [
  {
    video: "https://www.youtube.com/embed/upVGN5oMSXU?autoplay=1&mute=1&controls=0&loop=1&playlist=upVGN5oMSXU&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1",
    title: "Cinematic Living",
    subtitle: "Bringing cinematic quality to your private sanctuary.",
    tag: "New Feature"
  },
  {
    video: "https://www.youtube.com/embed/0JnGiu5ffMs?autoplay=1&mute=1&controls=0&loop=1&playlist=0JnGiu5ffMs&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1",
    title: "Masterful Artistry",
    subtitle: "Experience the rhythm of true craftsmanship.",
    tag: "Artisan Film"
  },
  {
    image: "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?auto=format&fit=crop&q=80&w=2000",
    title: "Timeless Craftsmanship",
    subtitle: "Custom furniture designed for generations.",
    tag: "Luxury Living"
  }
];

const ease = [0.22, 1, 0.36, 1] as const;

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const preconnects = ['https://www.youtube.com', 'https://images.unsplash.com'];
    preconnects.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    });

    const conn = (navigator as any).connection;
    if (conn) {
      const checkConnection = () => {
        const isSlow = conn.saveData || ['2g', '3g'].includes(conn.effectiveType);
        setIsLowBandwidth(isSlow);
      };
      conn.addEventListener('change', checkConnection);
      checkConnection();
      return () => conn.removeEventListener('change', checkConnection);
    }
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const duration = slides[current].video ? 360000 : 6000;
    const timer = setTimeout(next, duration);
    return () => clearTimeout(timer);
  }, [current, next]);

  const words = slides[current].title.split(' ');

  return (
    <section className="relative h-screen w-full overflow-hidden bg-neutral-950">
      {/* Background media */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: ease }}
          className="absolute inset-0"
        >
          {slides[current].video && !isLowBandwidth ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-black">
              <iframe
                src={slides[current].video}
                className="absolute top-1/2 left-1/2 min-w-full min-h-full w-[177.77777778vh] h-[56.25vw] -translate-x-1/2 -translate-y-1/2"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                title="Hero Video"
                loading="eager"
              />
            </div>
          ) : (
            <motion.img
              src={slides[current].image || "https://images.unsplash.com/photo-1758448755952-42b404bc6f39?auto=format&fit=crop&q=80&w=2000"}
              alt={slides[current].title}
              className="w-full h-full object-cover"
              loading={current === 0 ? "eager" : "lazy"}
              decoding="async"
              initial={{ scale: 1 }}
              animate={{ scale: 1.06 }}
              transition={{ duration: 8, ease: 'linear' }}
            />
          )}
          {/* Cinematic overlay layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/20 to-neutral-950/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tag badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: ease }}
                className="mb-8"
              >
                <span
                  className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.5em] text-white/70 font-bold"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  <span className="w-8 h-px bg-white/30" />
                  {slides[current].tag}
                </span>
              </motion.div>

              {/* Title — staggered word reveal */}
              <h1
                className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-10 tracking-tighter"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {words.map((word, i) => (
                  <span key={i} className="block overflow-hidden">
                    <motion.span
                      initial={{ y: '110%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{
                        delay: 0.4 + i * 0.12,
                        duration: 0.9,
                        ease: ease,
                      }}
                      className="block text-white"
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: ease }}
                className="text-lg md:text-xl text-white/50 mb-12 max-w-lg leading-relaxed font-light"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {slides[current].subtitle}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: ease }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/shop"
                  className="px-10 py-5 bg-white text-neutral-900 uppercase tracking-widest text-[10px] font-bold hover:bg-neutral-100 transition-all flex items-center gap-3 group"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="px-10 py-5 border border-white/20 text-white uppercase tracking-widest text-[10px] font-bold backdrop-blur-sm hover:bg-white/10 transition-all"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  Our Services
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide counter — right side vertical */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-6">
        <span
          className="text-xs text-white/80 tabular-nums font-bold"
          style={{ fontFamily: 'var(--font-josefin)' }}
        >
          {String(current + 1).padStart(2, '0')}
        </span>
        <div className="w-px h-20 bg-white/10 relative overflow-hidden">
          <motion.div
            key={current}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: slides[current].video ? 360 : 6, ease: 'linear' }}
            className="absolute inset-0 bg-white/60 origin-top"
          />
        </div>
        <span
          className="text-xs text-white/30 tabular-nums"
          style={{ fontFamily: 'var(--font-josefin)' }}
        >
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />

      {/* Bottom navigation bar */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex justify-between items-center">
          {/* Progress dots */}
          <div className="flex gap-2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`h-[2px] transition-all duration-700 ${
                  current === i ? 'w-14 bg-white' : 'w-6 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Nav arrows */}
          <div className="flex gap-3">
            <button
              onClick={prev}
              className="w-12 h-12 border border-white/15 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="w-12 h-12 border border-white/15 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 rounded-full flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
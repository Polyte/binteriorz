import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Naledi Khumalo',
    role: 'Residential Client, Sandton',
    text: 'B Interior Designz transformed our living room into something out of a magazine. The attention to detail in the custom walnut dining table is extraordinary — every guest comments on it.',
    rating: 5,
    initials: 'NK',
  },
  {
    name: 'James van der Merwe',
    role: 'CEO, Meridian Capital',
    text: 'We commissioned B Interior Designz for our entire executive floor. The result is a workspace that commands respect while maintaining warmth. Our boardroom table is a genuine showpiece.',
    rating: 5,
    initials: 'JM',
  },
  {
    name: 'Priya Naidoo',
    role: 'Interior Architect, Studio PN',
    text: 'As a fellow creative, I hold collaborators to the highest standard. B Interior Designz consistently delivers pieces that exceed my specifications. They understand luxury at a molecular level.',
    rating: 5,
    initials: 'PN',
  },
  {
    name: 'Michael Osei',
    role: 'Hotelier, The Langham Group',
    text: 'The custom lobby installation B Interior Designz designed for us became the centrepiece of our renovation. Guests photograph it daily. It is, without question, the best investment we made.',
    rating: 5,
    initials: 'MO',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % testimonials.length),
    [],
  );
  const prev = useCallback(
    () =>
      setCurrent(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length,
      ),
    [],
  );

  useEffect(() => {
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[current];

  return (
    <section className="py-32 md:py-44 bg-neutral-950 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/[0.012] rounded-full blur-[150px] pointer-events-none" />

      {/* Large decorative quote mark */}
      <div className="absolute top-24 right-12 md:right-24 pointer-events-none select-none">
        <span
          className="text-[200px] md:text-[300px] leading-none text-white/[0.015] font-serif"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          &ldquo;
        </span>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-neutral-700" />
            <span
              className="text-[9px] uppercase tracking-[0.6em] text-neutral-500 font-bold"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              Client Voices
            </span>
          </div>
          {/* Counter */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs text-white/70 tabular-nums font-bold"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              {String(current + 1).padStart(2, '0')}
            </span>
            <span className="text-xs text-white/20">/</span>
            <span
              className="text-xs text-white/20 tabular-nums"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              {String(testimonials.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: ease }}
          >
            {/* Quote icon */}
            <Quote
              className="w-8 h-8 text-neutral-700/40 mb-10 rotate-180"
              strokeWidth={1}
            />

            {/* Testimonial text */}
            <p
              className="text-2xl sm:text-3xl md:text-[2.75rem] text-white leading-snug md:leading-[1.25] font-light mb-14 max-w-4xl"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Attribution */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Monogram avatar */}
                <div
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="text-sm text-white font-medium tracking-wide"
                    style={{ fontFamily: 'var(--font-josefin)' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-xs text-neutral-500 mt-1"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-16 md:mt-20 pt-8 border-t border-neutral-800/30">
          {/* Progress dots */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-[2px] rounded-full transition-all duration-700 ${
                  current === i
                    ? 'w-12 bg-white'
                    : 'w-4 bg-neutral-700 hover:bg-neutral-500'
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-11 h-11 border border-neutral-700/50 text-neutral-400 hover:border-white/40 hover:text-white transition-all duration-300 rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="w-11 h-11 border border-neutral-700/50 text-neutral-400 hover:border-white/40 hover:text-white transition-all duration-300 rounded-full flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

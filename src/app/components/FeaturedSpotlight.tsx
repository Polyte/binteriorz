import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface FeaturedSpotlightProps {
  image: string;
  detailImage: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export const FeaturedSpotlight = ({
  image,
  detailImage,
  eyebrow = 'Featured Piece',
  title = 'Where Material Meets Mastery',
  description = 'Each B-Interiors piece begins as a dialogue between raw material and refined vision. European oak, hand-selected marble, brushed brass — every element earns its place through merit, not convenience.',
}: FeaturedSpotlightProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const detailScale = useTransform(scrollYProgress, [0.1, 0.5], [0.9, 1]);
  const detailOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);
  const textX = useTransform(scrollYProgress, [0.1, 0.4], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-neutral-950 py-20 md:py-24"
    >
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-amber-900/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-neutral-100/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section tag */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex items-center gap-3 md:mb-16"
        >
          <div className="w-12 h-px bg-neutral-700" />
          <span
            className="text-[9px] uppercase tracking-[0.6em] text-neutral-500 font-bold"
            style={{ fontFamily: 'var(--font-josefin)' }}
          >
            {eyebrow}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Image side — large hero image with floating detail */}
          <div className="lg:col-span-7 relative">
            <motion.div
              style={{ y: imageY }}
              className="group relative aspect-[4/5] overflow-hidden bg-neutral-900 shadow-[0_35px_90px_-38px_rgba(0,0,0,0.9)] [transform:perspective(1200px)_rotateY(-2deg)] md:aspect-[3/2] lg:aspect-[4/3]"
            >
              <ImageWithFallback
                src={image}
                alt="Featured craftsmanship"
                className="w-full h-full object-cover saturate-[0.82] transition-[transform,filter] duration-1000 group-hover:scale-[1.035] group-hover:saturate-100"
              />
              {/* Subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/45 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-4 border border-white/10" />
            </motion.div>

            {/* Floating detail image */}
            <motion.div
              style={{ scale: detailScale, opacity: detailOpacity }}
              className="absolute -bottom-8 -right-4 md:bottom-12 md:-right-8 w-36 h-44 md:w-48 md:h-56 border-4 border-neutral-950 shadow-2xl z-20 hidden sm:block"
            >
              <ImageWithFallback
                src={detailImage}
                alt="Material detail"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Year badge */}
            <div className="absolute top-8 left-8 z-10">
              <div className="bg-white/[0.08] backdrop-blur-lg border border-white/[0.08] px-5 py-3">
                <span
                  className="text-[9px] uppercase tracking-[0.5em] text-white/60 font-bold block mb-1"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  Collection
                </span>
                <span
                  className="text-2xl text-white/90 font-light"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  2026
                </span>
              </div>
            </div>
          </div>

          {/* Text side */}
          <motion.div
            style={{ x: textX, opacity: textOpacity }}
            className="lg:col-span-5 lg:pl-8"
          >
            <h2
              className="mb-6 text-4xl leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h2>

            <div className="mb-6 h-px w-16 bg-neutral-700" />

            <p
              className="mb-8 max-w-md text-lg leading-relaxed text-white/40 md:text-xl"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              {description}
            </p>

            {/* Key specs */}
            <div className="mb-9 grid grid-cols-3 gap-4 border-y border-neutral-800/60 py-6">
              {[
                { value: '200+', label: 'Hours Per Piece' },
                { value: '100%', label: 'Hand Finished' },
                { value: '25yr', label: 'Guarantee' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p
                    className="text-2xl md:text-3xl text-white/90 mb-2 font-light"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-[8px] uppercase tracking-[0.35em] text-neutral-500 font-bold"
                    style={{ fontFamily: 'var(--font-josefin)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-4 py-4 px-8 border border-white/15 text-white hover:bg-white hover:text-neutral-900 transition-all duration-500 group"
            >
              <span
                className="text-[10px] uppercase tracking-[0.3em] font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                View Collection
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

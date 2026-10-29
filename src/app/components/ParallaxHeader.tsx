import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ParallaxHeaderProps {
  image: string;
  title: string;
  subtitle?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export const ParallaxHeader = ({ image, title, subtitle }: ParallaxHeaderProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Image: deep parallax shift + Ken Burns zoom
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  // Content: floats up and fades out as you scroll
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Overlay darkens as you scroll away
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.4]);

  return (
    <div ref={ref} className="relative" style={{ position: 'relative' }}>
      <div
        className="relative h-[65vh] md:h-[75vh] overflow-hidden bg-neutral-900"
        style={{ position: 'relative' }}
      >
        {/* Parallax image layer */}
        <motion.div
          style={{ y: imgY, scale: imgScale }}
          className="absolute inset-[-20%] z-0 will-change-transform"
        >
          <ImageWithFallback
            src={image}
            alt={title}
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Static gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        {/* Scroll-driven darkening overlay */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 z-[2] bg-black"
        />

        {/* Content layer — floats up on scroll */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div style={{ y: contentY, opacity: contentOpacity }} className="will-change-transform">
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease }}
              className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/80 font-bold mb-6 block"
            >
              {subtitle || "B-Interiors Studio"}
            </motion.span>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease }}
              className="text-5xl md:text-8xl font-serif text-white tracking-tighter"
            >
              {title}
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 1, ease }}
              className="h-px w-24 md:w-48 bg-white/30 mx-auto mt-10 origin-center"
            />
          </motion.div>
        </div>

        {/* Film grain */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />
      </div>
    </div>
  );
};
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ParallaxSectionProps {
  image: string;
  title: string;
  subtitle: string;
}

export const ParallaxSection = ({ image, title, subtitle }: ParallaxSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={containerRef} className="relative" style={{ position: 'relative' }}>
      <section 
        className="relative h-[70vh] overflow-hidden flex items-center justify-center bg-neutral-900"
        style={{ position: 'relative' }} 
      >
      <motion.div 
        style={{ y }} 
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <img
          src={image}
          alt={title}
          className="w-full h-[140%] object-cover opacity-70 grayscale-[30%] scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-neutral-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950 opacity-80" />
        
        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </motion.div>
      
      <div className="relative z-10 text-center text-white px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.21, 0.45, 0.32, 0.9] }}
        >
          <span className="inline-block text-[11px] uppercase tracking-[0.8em] mb-10 font-black text-white/50">
            The Artisan Ethos
          </span>
          <h2 className="text-5xl md:text-8xl font-serif mb-12 leading-[0.9] tracking-tighter">
            {title.split(' ').map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h2>
          <div className="w-24 h-[1px] bg-white/20 mx-auto mb-12" />
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed italic font-serif">
            "{subtitle}"
          </p>
        </motion.div>
      </div>
    </section>
  </div>
  );
};

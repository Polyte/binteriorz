import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 15, suffix: '+', label: 'Years of Excellence' },
  { value: 2400, suffix: '+', label: 'Pieces Delivered' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
  { value: 47, suffix: '', label: 'Artisan Partners' },
];

function useCountUp(target: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return count;
}

const StatCounter = ({ stat, index, inView }: { stat: StatItem; index: number; inView: boolean }) => {
  const count = useCountUp(stat.value, inView, 2200 + index * 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.15,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative text-center group"
    >
      {/* Decorative top line */}
      <div className="w-6 h-px bg-neutral-300 mx-auto mb-8 group-hover:w-12 transition-all duration-700" />

      <p
        className="text-4xl md:text-5xl lg:text-6xl text-neutral-900 mb-3 tabular-nums tracking-tight font-light"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {count.toLocaleString()}
        <span className="text-neutral-300">{stat.suffix}</span>
      </p>
      <p
        className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 font-bold"
        style={{ fontFamily: 'var(--font-josefin)' }}
      >
        {stat.label}
      </p>
    </motion.div>
  );
};

export const StatsBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Subtle top/bottom hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

      <div ref={ref} className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
          {stats.map((stat, i) => (
            <StatCounter key={i} stat={stat} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

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
      className="group relative text-center"
    >
      {/* Decorative top line */}
      <div className="mx-auto mb-5 h-px w-6 bg-neutral-300 transition-all duration-700 group-hover:w-12" />

      <p
        className="mb-2 text-3xl font-light tabular-nums tracking-tight text-neutral-900 md:text-4xl lg:text-5xl"
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
    <section className="relative overflow-hidden bg-white py-14 md:py-18">
      {/* Subtle top/bottom hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

      <div ref={ref} className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {stats.map((stat, i) => (
            <StatCounter key={i} stat={stat} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

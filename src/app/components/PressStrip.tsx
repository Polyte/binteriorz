import React from 'react';
import { motion } from 'motion/react';

const publications = [
  { name: 'ELLE DECOR', style: 'italic', family: 'var(--font-playfair)' },
  { name: 'TAKEALOT', style: '', family: 'var(--font-josefin)' },
  { name: 'MAKRO', style: '', family: 'var(--font-josefin)' },
  { name: 'LEROY MERLIN', style: '', family: 'var(--font-josefin)' },
];

const ease = [0.22, 1, 0.36, 1] as const;

export const PressStrip = () => {
  return (
    <section className="py-16 md:py-24 border-b border-neutral-100 bg-white relative overflow-hidden">
      {/* Subtle fade top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[9px] uppercase tracking-[0.6em] text-neutral-300 text-center mb-12 font-bold"
          style={{ fontFamily: 'var(--font-josefin)' }}
        >
          As Featured In
        </motion.p>
        <div className="flex items-center justify-center flex-wrap gap-y-6 gap-x-6 md:gap-x-10 lg:gap-x-14">
          {publications.map((pub, i) => (
            <div key={pub.name} className="flex items-center gap-6 md:gap-10 lg:gap-14">
              {i > 0 && (
                <span className="w-px h-4 bg-neutral-200 flex-shrink-0" />
              )}
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: ease }}
                className={`text-xs md:text-sm lg:text-base tracking-[0.25em] text-neutral-300 hover:text-neutral-900 transition-colors duration-500 cursor-default select-none whitespace-nowrap ${pub.style}`}
                style={{ fontFamily: pub.family }}
              >
                {pub.name}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
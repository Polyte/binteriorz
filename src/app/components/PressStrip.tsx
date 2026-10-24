import React from 'react';
import { motion } from 'motion/react';

const publications = [
  { name: 'ELLE DECOR', style: 'italic', family: 'var(--font-playfair)' },
  { name: 'TAKEALOT', style: '', family: 'var(--font-josefin)' },
  { name: 'MAKRO', style: '', family: 'var(--font-josefin)' },
  { name: 'LEROY MERLIN', style: '', family: 'var(--font-josefin)' },
  { name: 'HOUSE & GARDEN', style: 'italic', family: 'var(--font-playfair)' },
  { name: 'VISI', style: '', family: 'var(--font-josefin)' },
];

export const PressStrip = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#ded7cc] bg-[#f6f2eb] py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(70,56,38,.05)_1px,transparent_1px)] [background-size:12.5%_100%]" />

      <div className="relative mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-9 flex items-center justify-center gap-4 md:mb-11"
        >
          <span className="h-px w-10 bg-[#a88a55]/50" />
          <p
            className="text-center text-[9px] font-bold uppercase tracking-[0.6em] text-[#776b5b]"
            style={{ fontFamily: 'var(--font-josefin)' }}
          >
            As Featured In
          </p>
          <span className="h-px w-10 bg-[#a88a55]/50" />
        </motion.div>

        <div
          aria-label={`Featured publications: ${publications.map((publication) => publication.name).join(', ')}`}
          className="group relative overflow-hidden border-y border-[#d8cfc1] py-6 select-none motion-reduce:[&_*]:animate-none md:py-8"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
          }}
        >
          <div aria-hidden="true" className="flex w-max animate-[press-slide_34s_linear_infinite] items-center group-hover:[animation-play-state:paused]">
            {[...publications, ...publications, ...publications].map((pub, i) => (
              <div key={`${pub.name}-${i}`} className="flex items-center">
                <span
                  className={`whitespace-nowrap text-sm tracking-[0.22em] text-[#857969] transition-[color,transform] duration-500 hover:-translate-y-0.5 hover:text-neutral-950 md:text-base lg:text-lg ${pub.style}`}
                  style={{ fontFamily: pub.family }}
                >
                  {pub.name}
                </span>
                <span className="mx-9 h-7 w-px flex-shrink-0 bg-[#cfc4b3] md:mx-14 lg:mx-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes press-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};

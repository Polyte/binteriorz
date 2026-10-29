import React from 'react';

// What the studio actually offers, taken from the company profile.
const topItems = [
  'Interior Design',
  'Bespoke Furniture',
  'Curtains & Window Treatments',
  'Upholstery',
  'Cushions & Soft Furnishings',
  'Lighting',
  'Décor & Styling',
  'Alberton Studio',
];

export const Marquee = () => {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#11100e] py-5 text-white md:py-6">
      <p className="sr-only">Handcrafted furniture, bespoke design, sustainable timber, and white-glove delivery.</p>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(255,255,255,.12)_0.5px,transparent_0.5px)] [background-size:8px_8px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[8%] w-px bg-gradient-to-b from-transparent via-[#d4af37]/30 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[8%] w-px bg-gradient-to-b from-transparent via-[#d4af37]/30 to-transparent" />

      <div aria-hidden="true" className="relative select-none motion-reduce:[&_*]:animate-none">
        <div className="flex whitespace-nowrap animate-[marquee_38s_linear_infinite]">
        {[...topItems, ...topItems, ...topItems].map((item, i) => (
          <span key={`t-${i}`} className="mx-7 flex items-center gap-7 md:mx-10 md:gap-10">
            <span
              className={`text-[22px] tracking-normal ${i % 2 === 0 ? 'text-white/90' : 'italic text-[#d7b96a]'}`}
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {item}
            </span>
            <span className="h-1.5 w-1.5 flex-shrink-0 rotate-45 border border-[#d7b96a]/60" />
          </span>
        ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#11100e] to-transparent md:w-40" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#11100e] to-transparent md:w-40" />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};

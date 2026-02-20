import React from 'react';

const topItems = [
  'Handcrafted Luxury',
  'European Oak',
  'White Glove Delivery',
  'Bespoke Design',
  'Alberton Studio',
  'Artisan Verified',
  'Lifetime Guarantee',
  'Sustainable Timber',
];

const bottomItems = [
  'Studio Made',
  'Heirloom Quality',
  'Interior Design',
  'Custom Fabrication',
  'Certified Timber',
  'Premium Logistics',
  'South African Craft',
  'Curated Collections',
];

export const Marquee = () => {
  return (
    <div className="relative bg-neutral-950 py-4 md:py-5 overflow-hidden border-y border-neutral-800/30 select-none">
      {/* Row 1 — left to right */}
      <div className="flex whitespace-nowrap animate-[marquee_45s_linear_infinite] mb-3">
        {[...topItems, ...topItems, ...topItems].map((item, i) => (
          <span key={`t-${i}`} className="flex items-center gap-7 mx-7">
            <span
              className="text-[10px] uppercase tracking-[0.55em] text-neutral-500 font-bold"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              {item}
            </span>
            <span className="w-[5px] h-[5px] rounded-full bg-neutral-700/80 flex-shrink-0" />
          </span>
        ))}
      </div>

      {/* Row 2 — right to left */}
      <div className="flex whitespace-nowrap animate-[marqueeReverse_55s_linear_infinite]">
        {[...bottomItems, ...bottomItems, ...bottomItems].map((item, i) => (
          <span key={`b-${i}`} className="flex items-center gap-7 mx-7">
            <span
              className="text-[9px] uppercase tracking-[0.6em] text-neutral-600/50 font-bold"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-700/40 flex-shrink-0" />
          </span>
        ))}
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

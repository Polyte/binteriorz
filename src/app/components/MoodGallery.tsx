import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Instagram, ArrowUpRight } from 'lucide-react';

interface MoodGalleryProps {
  images: string[];
  imageAlts?: string[];
  eyebrow?: string;
  title?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export const MoodGallery = ({ images, imageAlts = [], eyebrow = 'The Mood', title = 'Curated Interiors' }: MoodGalleryProps) => {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12 mb-16 md:mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: ease }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-neutral-300" />
              <span
                className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                {eyebrow}
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl text-neutral-900 leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h2>
          </motion.div>
          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500 hover:text-neutral-900 transition-colors duration-300 group"
            style={{ fontFamily: 'var(--font-josefin)' }}
          >
            <Instagram className="w-4 h-4" />
            Follow @B_Interiors
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </motion.a>
        </div>
      </div>

      {/* Full-width gallery grid */}
      <div className="px-3 md:px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {images.slice(0, 6).map((img, i) => {
            const tall = i === 0 || i === 3;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.8,
                  ease: ease,
                }}
                className={`relative overflow-hidden group cursor-pointer [isolation:isolate] ${
                  tall ? 'row-span-2 aspect-[3/5]' : 'aspect-square'
                }`}
              >
                <ImageWithFallback
                  src={img}
                  alt={imageAlts[i] || `Interior mood ${i + 1}`}
                  className="w-full h-full object-cover transition-[transform,filter] duration-1000 ease-out group-hover:scale-[1.08] saturate-[0.85] group-hover:saturate-110"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-2 border border-white/0 transition-all duration-700 group-hover:inset-4 group-hover:border-white/35" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500">
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Image number */}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <span
                    className="text-[8px] uppercase tracking-[0.4em] text-white/60 font-bold"
                    style={{ fontFamily: 'var(--font-josefin)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Bottom gradient */}
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

interface CategoryCardProps {
  title: string;
  image: string;
  href: string;
  index?: number;
  subtitle?: string;
}

export const CategoryCard = ({ title, image, href, index = 0, subtitle }: CategoryCardProps) => {
  return (
    <Link to={href} className="group relative block aspect-[4/3] overflow-hidden bg-neutral-100">
      {/* Image with slow zoom */}
      <ImageWithFallback
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
      />

      {/* Multi-layer overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/10 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/30 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700" />

      {/* Large background number */}
      <div className="absolute top-4 right-6 md:top-6 md:right-8 pointer-events-none select-none">
        <span
          className="text-6xl md:text-8xl font-light text-white/[0.04] group-hover:text-white/[0.08] transition-colors duration-700"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      
      {/* Content — bottom left */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
        <div className="overflow-hidden">
          <motion.div
            initial={false}
            className="transition-transform duration-500 group-hover:-translate-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[9px] uppercase tracking-[0.4em] text-white/50 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                Collection
              </span>
              <span className="w-4 h-px bg-white/20" />
            </div>
            <h3
              className="text-2xl md:text-3xl text-white tracking-tight flex items-center gap-3"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
              <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
            </h3>
          </motion.div>
        </div>
        
        {/* Animated underline */}
        <div className="mt-4 h-[1px] w-0 bg-white/40 transition-all duration-700 group-hover:w-full" />
      </div>

      {/* Corner action button */}
      <div className="absolute top-4 right-4 md:top-5 md:right-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 group-hover:bg-white/20 transition-colors duration-300">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
      </div>
    </Link>
  );
};

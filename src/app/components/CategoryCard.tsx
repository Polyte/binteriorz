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
    <Link to={href} className="group relative block aspect-square overflow-hidden bg-neutral-100 [isolation:isolate] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900">
      {/* Image with slow zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-[transform,filter] duration-1000 ease-out group-hover:scale-[1.08] group-hover:saturate-[1.16] group-hover:contrast-[1.04]"
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 z-10 border border-white/0 transition-all duration-700 group-hover:inset-5 group-hover:border-white/35" />

      {/* Multi-layer overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/10 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/30 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-700" />

      {/* Large background number */}
      <div className="pointer-events-none absolute right-4 top-4 select-none md:right-5 md:top-5">
        <span
          className="text-5xl font-light text-white/[0.06] transition-colors duration-700 group-hover:text-white/[0.12] md:text-6xl"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      
      {/* Content — bottom left */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
        <div className="overflow-hidden">
          <motion.div
            initial={false}
            className="transition-transform duration-500 group-hover:-translate-y-2"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/55"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                Collection
              </span>
              <span className="w-4 h-px bg-white/20" />
            </div>
            <h3
              className="flex items-center gap-2 text-lg tracking-tight text-white sm:text-xl xl:text-2xl"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
              <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
            </h3>
            {subtitle && (
              <p
                className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.24em] text-white/60 md:text-[9px]"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
        
        {/* Animated underline */}
        <div className="mt-4 h-[1px] w-0 bg-white/40 transition-all duration-700 group-hover:w-full" />
      </div>

      {/* Corner action button */}
      <div className="absolute right-3 top-3 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:right-4 md:top-4">
        <div className="rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition-colors duration-300 group-hover:bg-white/20">
          <ArrowUpRight className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
    </Link>
  );
};

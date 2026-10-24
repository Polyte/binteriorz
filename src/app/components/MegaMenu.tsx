import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowUpRight } from 'lucide-react';

const categoryOrder = [
  'Sofas', 'Chairs', 'Tables', 'Beds', 'Consoles', 'Cushions',
  'Curtains', 'Lamps', 'Pendant Lights', 'Rugs', 'Decor',
];

const categoryGroup: Record<string, string> = {
  Sofas: 'Seating & textiles',
  Chairs: 'Seating & textiles',
  Cushions: 'Seating & textiles',
  Curtains: 'Seating & textiles',
  Tables: 'Furniture',
  Consoles: 'Furniture',
  Beds: 'Furniture',
  Lamps: 'Lighting & décor',
  'Pendant Lights': 'Lighting & décor',
  Rugs: 'Lighting & décor',
  Decor: 'Lighting & décor',
};

const tileAspect = ['aspect-[4/3]', 'aspect-[3/2]', 'aspect-[5/4]', 'aspect-[16/10]'];

export const MegaMenu = ({ isOpen, onClose, products }: { isOpen: boolean; onClose: () => void; products: any[] }) => {
  const categories = useMemo(() => {
    const availableCategories = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return availableCategories
      .map((name) => {
        const items = products.filter((product) => product.category === name);
        const imageProduct = items.find((product) => product.image || product.mainImage);
        return {
          name,
          count: items.length,
          image: imageProduct?.image || imageProduct?.mainImage || '',
          group: categoryGroup[name] || 'The collection',
        };
      })
      .sort((a, b) => {
        const aOrder = categoryOrder.indexOf(a.name);
        const bOrder = categoryOrder.indexOf(b.name);
        return (aOrder < 0 ? Number.MAX_SAFE_INTEGER : aOrder)
          - (bOrder < 0 ? Number.MAX_SAFE_INTEGER : bOrder)
          || a.name.localeCompare(b.name);
      });
  }, [products]);

  const availableProducts = products.filter((product) => product.inStock !== false).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden={!isOpen}
      className="absolute left-0 top-full z-[60] w-full overflow-hidden border-b border-neutral-100 bg-white shadow-2xl dark:border-neutral-900 dark:bg-neutral-950"
      onMouseLeave={onClose}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(#75664e 0.55px, transparent 0.55px)', backgroundSize: '9px 9px' }}
      />

      <div className="relative z-10 mx-auto max-h-[calc(100vh-7rem)] max-w-[1280px] overflow-y-auto px-6 py-8 sm:px-8 lg:px-12 lg:py-9">
        <div className="mb-7 flex items-end justify-between gap-5 border-b border-neutral-100 pb-5 dark:border-neutral-900 md:mb-8 md:pb-6">
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.45em] text-[#a17d31]">The Collection</p>
            <h2 className="text-3xl text-neutral-900 dark:text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              Shop by category
            </h2>
          </div>
          <span className="hidden text-[9px] font-bold uppercase tracking-[0.28em] text-neutral-400 sm:block">
            {availableProducts} available pieces · {categories.length} categories
          </span>
        </div>

        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.035, 0.3), duration: 0.45, ease: 'easeOut' }}
              className="mb-3 break-inside-avoid sm:mb-4"
            >
              <Link
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                onClick={onClose}
                className={`group relative block ${tileAspect[index % tileAspect.length]} overflow-hidden bg-neutral-200 outline-none ring-[#d4af37]/0 transition-[box-shadow] duration-500 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,.55)] focus-visible:ring-2 dark:bg-neutral-800`}
              >
                <ImageWithFallback
                  src={category.image}
                  alt={`${category.name} collection`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.07]"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5 transition-colors duration-500 group-hover:from-black/85 group-hover:via-black/20" />
                <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/65 sm:text-[9px]">
                      {category.group}
                    </span>
                    <span className="text-[8px] tabular-nums text-white/60 sm:text-[9px]">{category.count} pieces</span>
                  </span>
                  <span className="flex items-end justify-between gap-3 border-t border-white/25 pt-2.5">
                    <span className="text-xl leading-tight text-white sm:text-2xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {category.name}
                    </span>
                    <span className="mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-all duration-500 group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-neutral-950">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-5 border-t border-neutral-100 pt-6 dark:border-neutral-900 sm:flex-row">
          <div className="flex items-center gap-8">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">Alberton, Gauteng</span>
            <Link to="/services" onClick={onClose} className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white">
              Interior design services
            </Link>
          </div>
          <Link
            to="/shop"
            onClick={onClose}
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.32em] text-neutral-900 dark:text-white"
          >
            Explore all {availableProducts} pieces
            <span className="h-px w-8 bg-neutral-900 transition-all duration-500 group-hover:w-12 dark:bg-white" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

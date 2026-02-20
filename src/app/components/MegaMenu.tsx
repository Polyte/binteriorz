import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface Category {
  name: string;
  items: { label: string; href: string }[];
  featured?: { name: string; price: string; image: string }[];
  image: string;
}

const categories: Category[] = [
  {
    name: 'The Seating Collection',
    items: [
      { label: 'Crescent Ottomans', href: '/shop' },
      { label: 'Heritage Armchairs', href: '/shop' },
      { label: 'Silk Lounge Pieces', href: '/shop' },
      { label: 'Minimalist Benches', href: '/shop' }
    ],
    featured: [
      { name: 'Heritage Leather Armchair', price: 'R 12,800', image: 'https://images.unsplash.com/photo-1702865263661-9da5ecf2f374?auto=format&fit=crop&q=80&w=300' }
    ],
    image: 'https://images.unsplash.com/photo-1755325541565-aca7a68f6e66?auto=format&fit=crop&q=80&w=500'
  },
  {
    name: 'Spatial Structures',
    items: [
      { label: 'Oak Dining Tables', href: '/shop' },
      { label: 'Marble Coffee Units', href: '/shop' },
      { label: 'Walnut Executive Desks', href: '/shop' },
      { label: 'Bespoke Sideboards', href: '/shop' }
    ],
    featured: [
      { name: 'Marble Coffee Table', price: 'R 9,500', image: 'https://images.unsplash.com/photo-1758448755778-90ebf4d0f1e7?auto=format&fit=crop&q=80&w=300' }
    ],
    image: 'https://images.unsplash.com/photo-1617262869510-3793b141c294?auto=format&fit=crop&q=80&w=500'
  },
  {
    name: 'Artisanal Elements',
    items: [
      { label: 'Brass Sphere Pendants', href: '/shop' },
      { label: 'Ceramic Table Lamps', href: '/shop' },
      { label: 'Luxury Wool Rugs', href: '/shop' },
      { label: 'Decorative Sculptures', href: '/shop' }
    ],
    featured: [
      { name: 'Brass Pendant Sphere', price: 'R 3,200', image: 'https://images.unsplash.com/photo-1669823734572-57c47df22b52?auto=format&fit=crop&q=80&w=300' }
    ],
    image: 'https://images.unsplash.com/photo-1571536206659-52415ba027d3?auto=format&fit=crop&q=80&w=500'
  }
];

export const MegaMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="absolute top-full left-0 w-full bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900 shadow-2xl overflow-hidden z-[60]"
      onMouseLeave={onClose}
    >
      {/* Grain Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.02] mix-blend-multiply dark:mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400 dark:text-neutral-500">
                  {cat.name}
                </h3>
                <ul className="space-y-4">
                  {cat.items.map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="group flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-300 font-light"
                      >
                        {item.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {cat.featured && (
                <div className="pt-6 border-t border-neutral-50 dark:border-neutral-900 space-y-4">
                  <p className="text-[8px] uppercase tracking-widest text-neutral-400">Current Acquisition</p>
                  {cat.featured.map((f) => (
                    <Link key={f.name} to="/shop" onClick={onClose} className="flex items-center gap-4 group/item">
                      <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative">
                         <ImageWithFallback src={f.image} alt={f.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-900 dark:text-white leading-tight">{f.name}</p>
                        <p className="text-[9px] text-neutral-400 mt-1">{f.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-1"
          >
            <div className="h-full bg-neutral-50 dark:bg-neutral-900 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="w-5 h-5 text-neutral-200 dark:text-neutral-800" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <h4 className="text-xl font-serif text-neutral-900 dark:text-white leading-tight mb-4">
                  Bespoke Studio <br /> Consultations
                </h4>
                <p className="text-xs text-neutral-500 font-light leading-relaxed mb-8">
                  Work directly with our lead artisans to commission a piece that defines your architectural legacy.
                </p>
                <div className="mt-auto space-y-4">
                  <Link 
                    to="/services" 
                    onClick={onClose}
                    className="block w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-center text-[10px] font-bold uppercase tracking-[0.3em] rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Book Private Session
                  </Link>
                  <p className="text-[8px] text-center uppercase tracking-widest text-neutral-400">Available in Alberton Studio Only</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        <div className="mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-12">
             <div className="space-y-1">
               <p className="text-[8px] uppercase tracking-widest text-neutral-400">Est.</p>
               <p className="text-[10px] font-bold text-neutral-900 dark:text-white">2026</p>
             </div>
             <div className="space-y-1">
               <p className="text-[8px] uppercase tracking-widest text-neutral-400">Region</p>
               <p className="text-[10px] font-bold text-neutral-900 dark:text-white">Alberton, JHB</p>
             </div>
          </div>
          <Link 
            to="/shop" 
            onClick={onClose}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-900 dark:text-white"
          >
            Explore The Full Catalogue 
            <motion.div 
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-px bg-neutral-900 dark:bg-white" 
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
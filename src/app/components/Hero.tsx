import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  bgImage: string;
}

export const Hero = ({ bgImage }: HeroProps) => {
  return (
    <section className="relative h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="B Interior Designz Luxury Furniture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <span className="inline-block text-white/90 uppercase tracking-[0.3em] text-sm mb-4">
            Established in Alberton
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-8">
            Curating Spaces, <br />
            Defining Elegance.
          </h1>
          <p className="text-lg text-white/80 mb-10 max-w-lg leading-relaxed">
            Custom furniture and bespoke interior decor services tailored for your home, office, and corporate environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-white text-neutral-900 rounded-none font-medium hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2">
              Shop Furniture <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-4 border border-white text-white rounded-none font-medium hover:bg-white/10 transition-colors">
              Bespoke Decor Services
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

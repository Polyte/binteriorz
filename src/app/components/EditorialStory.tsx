import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EditorialStoryProps {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  quote?: string;
  reverse?: boolean;
}

export const EditorialStory = ({ image, title, subtitle, description, quote, reverse }: EditorialStoryProps) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <section ref={containerRef} className="py-24 md:py-32 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24`}>
          <div className="flex-1 w-full">
            <div className="relative aspect-[4/5] overflow-hidden group">
              <motion.div style={{ scale }} className="w-full h-full">
                <ImageWithFallback 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
                />
              </motion.div>
              <div className="absolute inset-0 bg-neutral-900/5 mix-blend-multiply" />
              
              {/* Grain Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-start">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.5em] text-neutral-400 mb-6 font-bold"
            >
              {subtitle}
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-serif text-neutral-900 mb-8 leading-tight"
            >
              {title}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-lg text-neutral-600 mb-10 leading-relaxed max-w-lg"
            >
              {description}
            </motion.p>
            
            {quote && (
              <motion.blockquote 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="pl-8 border-l border-neutral-200 mb-12 italic text-neutral-500 font-serif text-xl leading-relaxed"
              >
                "{quote}"
              </motion.blockquote>
            )}
            
            <motion.button 
              whileHover={{ x: 10 }}
              className="text-xs uppercase tracking-[0.3em] font-bold border-b-2 border-neutral-900 pb-2 flex items-center gap-4 group"
            >
              Read the full story
              <div className="w-8 h-[1px] bg-neutral-900 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

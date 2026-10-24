import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ParallaxHeader } from '../components/ParallaxHeader';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowDown } from 'lucide-react';

export const About = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const stats = [
    { label: "Founded", value: "2014" },
    { label: "Artisans", value: "24" },
    { label: "Projects", value: "850+" },
    { label: "Countries", value: "12" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#fafaf9] overflow-hidden"
      ref={containerRef}
    >
      <ParallaxHeader 
        image="https://images.unsplash.com/photo-1760939858984-5dc76f0ea34a?auto=format&fit=crop&q=80&w=2000"
        title="Our Narrative"
        subtitle="Legacy of Alberton"
      />

      {/* Hero Narrative */}
      <section className="py-32 md:py-48 max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-black mb-12 block"
            >
              Genesis
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-serif text-neutral-900 leading-[0.9] tracking-tighter mb-16"
            >
              Defining the <br />Silent Space.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-light text-neutral-600 leading-relaxed max-w-3xl"
            >
              B-Interiors was founded on the belief that luxury is not about excess, but about the profound weight of simplicity. Born in a small workshop in Alberton, our journey began with a single mission: to create objects and spaces that breathe.
            </motion.p>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-8 border-t border-neutral-200 pt-12">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-serif text-neutral-900 mb-1">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Quote Overlay */}
      <section className="relative h-[80vh] w-full overflow-hidden group">
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1660796334912-8ce8e9c2cff0?auto=format&fit=crop&q=80&w=2000"
            alt="Studio Portrait"
            className="w-full h-full object-cover grayscale brightness-50"
          />
        </motion.div>
        <div className="absolute inset-0 bg-neutral-950/20 mix-blend-multiply" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl"
          >
            <span className="text-xs uppercase tracking-[0.8em] text-white/50 mb-12 block font-black">Philosophy</span>
            <blockquote className="text-4xl md:text-6xl font-serif text-white leading-tight italic mb-12">
              "A chair should not just be for sitting; it should be a sculpture for the soul."
            </blockquote>
            <div className="w-20 h-px bg-white/30 mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* The Pillars */}
      <section className="py-32 md:py-48 max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          {[
            {
              title: "Ethical Sourcing",
              num: "01",
              desc: "Every plank of timber is tracked from the forest to our floor. We prioritize FSC-certified hardwoods from local Alberton suppliers, ensuring our footprint is as light as our designs."
            },
            {
              title: "Artisan Mastery",
              num: "02",
              desc: "Our workshop combines ancient joinery techniques with modern precision engineering. We don't use nails; we use geometry. The result is furniture that lasts for generations."
            },
            {
              title: "Silent Design",
              num: "03",
              desc: "We strip away the noise. No unnecessary labels, no gaudy hardware. We let the natural grain and the architectural line speak for themselves in every project we touch."
            }
          ].map((pillar, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="space-y-8 group"
            >
              <span className="text-6xl font-serif text-neutral-200 group-hover:text-neutral-900 transition-colors duration-500">{pillar.num}</span>
              <h3 className="text-2xl font-serif text-neutral-900 uppercase tracking-tight">{pillar.title}</h3>
              <p className="text-neutral-500 leading-relaxed font-light">{pillar.desc}</p>
              <div className="w-12 h-px bg-neutral-200 group-hover:w-full group-hover:bg-neutral-900 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Workshop Reveal */}
      <section className="py-32 bg-neutral-950 text-white overflow-hidden">
        <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-24 items-center">
            <div className="flex-1 space-y-12">
              <span className="text-[10px] uppercase tracking-[0.6em] text-neutral-500 font-black block">The Workshop</span>
              <h2 className="text-5xl md:text-8xl font-serif leading-[0.9] tracking-tighter">Where Time <br />Slows Down.</h2>
              <p className="text-xl text-neutral-400 font-light max-w-md leading-relaxed">
                Located in the heart of Alberton, our studio is a sanctuary of focus. Here, the hum of the lathe and the scent of cedar create an environment where craft is paramount.
              </p>
              <motion.button 
                whileHover={{ x: 10 }}
                className="flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-black text-white group pt-8"
              >
                View Workshop Tour
                <div className="w-12 h-px bg-white/20 group-hover:w-20 group-hover:bg-white transition-all duration-500" />
              </motion.button>
            </div>
            <div className="flex-1 relative">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="aspect-[4/5] relative overflow-hidden"
               >
                 <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1759523121247-76be6b3490b2?auto=format&fit=crop&q=80&w=1200"
                  alt="Craftsmanship"
                  className="w-full h-full object-cover opacity-80"
                 />
                 <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-48 text-center bg-white relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-4"
        >
          <span className="text-[10px] uppercase tracking-[0.8em] text-neutral-400 mb-8 block font-black">Our Future</span>
          <h2 className="text-4xl md:text-6xl font-serif text-neutral-900 mb-12 leading-tight">Join us in the pursuit of the <br />perfectly crafted space.</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <a href="/shop" className="px-12 py-6 bg-neutral-900 text-white text-[10px] uppercase tracking-[0.4em] font-black hover:bg-neutral-800 transition-all">Explore Collections</a>
            <a href="/contact" className="px-12 py-6 border border-neutral-200 text-neutral-900 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-neutral-50 transition-all">Work with the Studio</a>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};
import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { ConsultationForm } from '../components/ConsultationForm';
import { ArrowRight, CheckCircle2, Ruler, Paintbrush, Truck, PenTool } from 'lucide-react';
import { ParallaxHeader } from '../components/ParallaxHeader';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
const logo = "/logo.png";

export const Services = () => {
  const containerRef = useRef(null);
  
  const services = [
    {
      id: "01",
      title: "Full-Scale Interior Design",
      subtitle: "Residential & Commercial",
      description: "Our comprehensive design service manages every aspect of your space, from initial spatial planning and CAD layouts to the final procurement of artisan furniture and textiles.",
      image: "https://images.unsplash.com/photo-1762418362644-a4daad168fb9?auto=format&fit=crop&q=80&w=1200",
      features: ["Spatial Architecture", "Bespoke Lighting Plans", "Fine Art Curation", "Project Management"]
    },
    {
      id: "02",
      title: "Artisan Furniture Design",
      subtitle: "Custom Commissions",
      description: "Collaborate directly with our master craftsmen in the Alberton workshop. We create heirloom-quality pieces tailored to your exact dimensions and material preferences.",
      image: "https://images.unsplash.com/photo-1765681415541-9d70775f88ae?auto=format&fit=crop&q=80&w=1200",
      features: ["European Oak & Walnut", "Hand-finished Details", "3D Visualization", "Lifetime Guarantee"]
    },
    {
      id: "03",
      title: "The Curation Concierge",
      subtitle: "Styling & Refinement",
      description: "A specialized service for those looking to refine an existing space. We source rare ornaments, vintage classics, and modern accents to elevate your daily environment.",
      image: "https://images.unsplash.com/photo-1762423656649-24aaf046402e?auto=format&fit=crop&q=80&w=1200",
      features: ["Sourcing Network", "Seasonal Refresh", "Textile Layering", "Object Curation"]
    }
  ];

  const processSteps = [
    { icon: Ruler, title: "Discovery", desc: "A 90-minute immersion into your lifestyle, aesthetic goals, and spatial requirements." },
    { icon: PenTool, title: "Concept", desc: "Development of moodboards, material palettes, and preliminary architectural sketches." },
    { icon: Paintbrush, title: "Refinement", desc: "Detailed 3D renderings and final selection of bespoke finishes and artisan pieces." },
    { icon: Truck, title: "Realization", desc: "White-glove delivery, installation, and final styling by our creative director." }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen"
    >
      <ParallaxHeader 
        image="https://images.unsplash.com/photo-1696761868245-3e96dfb8620b?auto=format&fit=crop&q=80&w=2000"
        title="Studio Services"
        subtitle="The B-Interiors Method"
      />

      {/* Intro Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-end">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-[0.6em] text-neutral-400 mb-8 block font-black">Our Philosophy</span>
            <h1 className="text-5xl md:text-8xl font-serif text-neutral-900 leading-[0.9] mb-12 tracking-tighter">
              Quiet Luxury, <br />Crafted Precision.
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md pb-4"
          >
            <p className="text-xl text-neutral-500 leading-relaxed font-light italic font-serif">
              "We believe that a well-designed space is the ultimate luxury. It should be a quiet sanctuary of quality, where every texture and line serves a purpose."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="pb-32 space-y-48">
        {services.map((service, idx) => (
          <div key={service.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex flex-col lg:flex-row gap-20 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 w-full">
                <div className="relative aspect-[4/5] overflow-hidden group">
                   <motion.div 
                    whileInView={{ scale: [1.1, 1] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full"
                   >
                    <ImageWithFallback 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
                    />
                   </motion.div>
                   <div className="absolute inset-0 bg-neutral-900/10 mix-blend-multiply" />
                   <div className="absolute top-10 left-10">
                     <span className="text-6xl md:text-8xl font-serif text-white/20 select-none">{service.id}</span>
                   </div>
                </div>
              </div>

              <div className="flex-1 space-y-12">
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-[0.4em] text-neutral-400 font-bold">{service.subtitle}</span>
                  <h2 className="text-4xl md:text-6xl font-serif text-neutral-900 leading-tight">{service.title}</h2>
                </div>
                
                <p className="text-xl text-neutral-600 leading-relaxed font-light max-w-lg">
                  {service.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                   {service.features.map((feature, i) => (
                     <div key={i} className="flex items-center gap-4 group/item">
                        <div className="w-1 h-1 bg-neutral-300 rounded-full group-hover/item:scale-150 group-hover/item:bg-neutral-900 transition-all duration-300" />
                        <span className="text-xs uppercase tracking-widest font-bold text-neutral-500 group-hover/item:text-neutral-900 transition-colors">{feature}</span>
                     </div>
                   ))}
                </div>

                <motion.button 
                  whileHover={{ x: 10 }}
                  className="pt-8 flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-black text-neutral-900 group"
                >
                  Start Consultation 
                  <div className="w-12 h-px bg-neutral-200 group-hover:w-20 group-hover:bg-neutral-900 transition-all duration-500" />
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Process Section */}
      <section className="py-32 bg-neutral-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <span className="text-xs uppercase tracking-[0.8em] text-neutral-500 mb-6 block font-bold">The Journey</span>
            <h2 className="text-4xl md:text-7xl font-serif mb-8">From Vision to Reality</h2>
            <div className="w-24 h-px bg-white/20 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {processSteps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="mb-8 relative">
                   <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:text-neutral-900">
                     <step.icon className="w-6 h-6" />
                   </div>
                   <div className="absolute top-1/2 left-full w-full h-px bg-white/5 hidden md:block" />
                </div>
                <h3 className="text-xl font-serif mb-4">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed font-light">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Section */}
      <section className="py-48 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
          <div className="space-y-12">
            <div>
              <span className="text-xs uppercase tracking-[0.5em] text-neutral-400 mb-6 block font-bold">Inquiries</span>
              <h2 className="text-5xl md:text-8xl font-serif text-neutral-900 leading-[0.9] tracking-tighter">
                Request a <br />Consultation.
              </h2>
            </div>
            
            <div className="space-y-8">
              <p className="text-xl text-neutral-500 leading-relaxed font-light max-w-md">
                We accept a limited number of commissions each season to ensure the highest level of detail for every client.
              </p>
              
              <div className="flex items-center gap-8 py-8 border-y border-neutral-100">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center">
                  <img src={logo} alt="" className="w-8 h-8 opacity-40" />
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-neutral-900 mb-1">Studio Hours</h4>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Mon — Fri / 09:00 — 18:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 border border-neutral-100 shadow-2xl">
            <div className="bg-white p-8 md:p-12 border border-neutral-100">
               <ConsultationForm />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
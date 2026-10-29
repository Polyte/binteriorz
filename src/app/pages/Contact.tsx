import React from 'react';
import { motion } from 'motion/react';
import { ConsultationForm } from '../components/ConsultationForm';
import { Clock } from 'lucide-react';
import { ContactLinks } from '../components/company/CompanyBlocks';
import { useCompanyContent } from '../content/CompanyContentContext';
import { ParallaxHeader } from '../components/ParallaxHeader';

export const Contact = () => {
  const content = useCompanyContent();
  const { cta } = content.sections;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 bg-[#fcfcfc]"
    >
      <ParallaxHeader 
        image="/product-images/bi-066.jpg"
        title="Get in Touch"
        subtitle="Inquiries & Appointments"
      />

      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          
          {/* Content & Info */}
          <div className="lg:col-span-5 space-y-24">
            <header>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-serif text-neutral-900 leading-tight tracking-tighter"
              >
                {cta.title}
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-lg text-neutral-500 font-light leading-relaxed max-w-md"
              >
                {cta.text}
              </motion.p>
            </header>

            <section className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                 <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-900">Connect</h3>
              </div>
              <ContactLinks contact={content.contact} />
              <div className="flex items-start gap-4 border-t border-neutral-200 pt-8 text-sm font-light text-neutral-600">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-900">Studio hours</p>
                  <p>Mon — Fri: 09:00 - 17:00 · Saturday: by appointment</p>
                </div>
              </div>
            </section>
          </div>

          {/* Form & Map */}
          <div className="lg:col-span-7 space-y-16">
            <div className="bg-white p-12 md:p-16 rounded-[3rem] border border-neutral-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-50 rounded-full -mr-32 -mt-32 opacity-50" />
               <h2 className="text-3xl font-serif text-neutral-900 mb-12 relative">Send us your brief</h2>
               <div className="relative">
                 <ConsultationForm />
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* Full-width Map Section */}
      <div className="mt-24">
        <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12 mb-8">
          <div className="flex justify-between items-end">
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold text-neutral-400">Our Location</h3>
            <span className="text-[10px] font-medium text-neutral-400 italic">35 Radio Street, Alberton, JHB</span>
          </div>
        </div>
        <div className="w-full h-[50vh] md:h-[60vh] grayscale hover:grayscale-0 transition-all duration-1000 relative group">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3576.840613217036!2d28.118931175402517!3d-26.301019677017665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e95101666e5f8f9%3A0xb12c82a88a0e8c8a!2s35%20Radio%20St%2C%20Alberton%20North%2C%20Alberton%2C%201449!5e0!3m2!1sen!2sza!4v1709736453911!5m2!1sen!2sza" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>

          {/* Custom branded marker overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none flex flex-col items-center">
            {/* Marker pin */}
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                {/* Pin head */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-neutral-900 border-[3px] border-white shadow-2xl flex items-center justify-center group-hover:bg-amber-800 transition-colors duration-1000">
                  <span className="text-white font-serif text-lg md:text-xl font-bold tracking-tight">B</span>
                </div>
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-neutral-900/20 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
              {/* Pin tail */}
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-neutral-900 group-hover:border-t-amber-800 transition-colors duration-1000 -mt-[1px]" />
              {/* Shadow dot */}
              <div className="w-6 h-2 bg-black/20 rounded-full mt-1 blur-[2px]" />
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-neutral-100"
            >
              <p className="text-[10px] md:text-xs font-bold text-neutral-900 tracking-wide whitespace-nowrap">B Interior Designz</p>
              <p className="text-[9px] md:text-[10px] text-neutral-500 font-light text-center">35 Radio St, Alberton</p>
            </motion.div>
          </div>
        </div>
        <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12 mt-8">
          <div className="flex items-center gap-4 p-8 bg-neutral-50 rounded-3xl border border-neutral-100">
            <Clock className="w-5 h-5 text-neutral-400" />
            <p className="text-xs text-neutral-500 leading-relaxed italic">
               "We recommend scheduling a private viewing for custom commission discussions."
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
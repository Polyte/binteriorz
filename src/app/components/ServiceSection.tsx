import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, Ruler, Palette, Building2, Sofa } from 'lucide-react';
import { Link } from 'react-router';

interface ServiceSectionProps {
  image: string;
  consultImage?: string;
  eyebrow?: string;
  title?: string;
}

const services = [
  {
    icon: Sofa,
    title: 'Custom Furniture Fabrication',
    description: 'Bespoke pieces built to your exact specifications using premium materials.',
  },
  {
    icon: Ruler,
    title: 'Space Planning & Design',
    description: 'Conceptual layouts that maximise flow, light, and aesthetic harmony.',
  },
  {
    icon: Building2,
    title: 'Corporate Fit-outs',
    description: 'Executive environments that command respect while maintaining warmth.',
  },
  {
    icon: Palette,
    title: 'Home Styling & Consultation',
    description: 'Expert curation that transforms your vision into a living reality.',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export const ServiceSection = ({
  image,
  eyebrow = 'Our Services',
  title = 'Bespoke Interior Decor Services',
}: ServiceSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative overflow-hidden bg-white py-16 md:py-20"
    >
      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-neutral-100" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-neutral-100" />
      </div>

      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: ease }}
          className="mb-12 md:mb-16"
        >
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="w-10 h-px bg-neutral-300" />
              <span
                className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                {eyebrow}
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl text-neutral-900 leading-[1.05] tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {title}
            </h2>
          </div>
        </motion.div>

        {/* Grid — image + services */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Image column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: ease }}
            className="lg:col-span-5 relative"
          >
            <div className="relative overflow-hidden aspect-[3/4]">
              <motion.div style={{ y: imageY }} className="absolute inset-0 -top-[6%] -bottom-[6%]">
                <ImageWithFallback
                  src={image}
                  alt="Interior Decor Service"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7, ease: ease }}
              className="absolute -bottom-6 -right-3 md:-right-8 bg-neutral-950 text-white p-8 shadow-2xl z-10"
            >
              <p
                className="text-5xl font-light mb-2"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                15<span className="text-neutral-500">+</span>
              </p>
              <p
                className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                Years of Design
                <br />
                Excellence
              </p>
            </motion.div>
          </motion.div>

          {/* Services list */}
          <div className="lg:col-span-7">
            <div className="space-y-0 border-t border-neutral-200">
              {services.map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.8,
                    ease: ease,
                  }}
                  className="group -mx-4 flex cursor-default items-start gap-5 border-b border-neutral-200 px-4 py-6 transition-colors duration-500 hover:bg-neutral-50/60 md:gap-7 md:py-7"
                >
                  {/* Step number */}
                  <span
                    className="text-[10px] text-neutral-200 font-bold mt-1 flex-shrink-0 tabular-nums w-6 group-hover:text-neutral-400 transition-colors duration-500"
                    style={{ fontFamily: 'var(--font-josefin)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-all duration-500">
                    <service.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-500 stroke-[1.5]" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-base md:text-lg text-neutral-900 font-medium tracking-tight mb-2 group-hover:translate-x-2 transition-transform duration-500"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {service.title}
                    </h4>
                    <p
                      className="text-sm text-neutral-400 leading-relaxed max-w-md"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      {service.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 mt-1 hidden md:block">
                    <ArrowRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.7, ease: ease }}
              className="mt-9"
            >
              <Link
                to="/services"
                className="inline-flex items-center gap-4 py-5 px-10 bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-300 group"
              >
                <span
                  className="text-[10px] uppercase tracking-[0.3em] font-bold"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  Book a Consultation
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

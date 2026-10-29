import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ConsultationForm } from '../components/ConsultationForm';
import { ParallaxHeader } from '../components/ParallaxHeader';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CompanyCTA, ContactLinks, Eyebrow, SectionHeading, reveal } from '../components/company/CompanyBlocks';
import { useCompanyContent } from '../content/CompanyContentContext';

const container = 'mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12';

const scrollToConsultation = () => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export const Services = () => {
  const content = useCompanyContent();
  const { services, experience, clients } = content.sections;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white">
      <ParallaxHeader image="/product-images/hero-studio-artistry.jpg" title="Our Services" subtitle={content.sections.hero.eyebrow} />

      {/* Services grid */}
      {services.enabled && (
        <section className={`${container} py-24 md:py-32`}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow={services.eyebrow} title={services.title} intro={services.intro} />
            <motion.button {...reveal(0.1)} type="button" onClick={scrollToConsultation} className="group mb-12 inline-flex w-fit flex-shrink-0 items-center gap-3 border-b border-neutral-900 pb-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 md:mb-16">
              Request a consultation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>

          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {services.items.map((service, index) => {
              // Widen the first (and last) card on desktop so the 3-column grid has no orphans.
              const spare = (3 - (services.items.length % 3)) % 3;
              const wide = (spare >= 1 && index === 0) || (spare === 2 && index === services.items.length - 1);
              return (
              <motion.article key={service.id} {...reveal((index % 3) * 0.08)} className={`group flex flex-col ${wide ? 'lg:col-span-2' : ''}`}>
                <div className={`relative aspect-[4/3] overflow-hidden bg-neutral-100 ${wide ? 'lg:aspect-[8/3]' : ''}`}>
                  {service.image?.url && <ImageWithFallback src={service.image.url} alt={service.image.alt || service.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  <span className="absolute left-4 top-4 bg-white/90 px-3 py-1 font-serif text-sm tabular-nums text-neutral-900 backdrop-blur-sm">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-6 font-serif text-2xl text-neutral-900">{service.title}</h3>
                <p className="mt-3 flex-1 font-light leading-relaxed text-neutral-600">{service.text}</p>
                <button type="button" onClick={scrollToConsultation} className="mt-5 inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#9a7b37] transition-colors hover:text-neutral-900">
                  Enquire <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {/* The experience */}
      {experience.enabled && (
        <section className="bg-neutral-950 py-24 text-white md:py-32">
          <div className={container}>
            <div className="grid gap-16 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <SectionHeading eyebrow={experience.eyebrow} title={experience.title} intro={experience.intro} light />
                <motion.div {...reveal(0.1)} className="hidden aspect-[4/3] overflow-hidden lg:block">
                  <ImageWithFallback src={experience.image.url} alt={experience.image.alt || ''} className="h-full w-full object-cover opacity-85" />
                </motion.div>
              </div>
              <ol className="grid gap-px bg-white/10 sm:grid-cols-2 lg:col-span-7">
                {experience.steps.filter(Boolean).map((step, index) => (
                  <motion.li key={index} {...reveal(index * 0.06)} className="group flex min-h-[170px] flex-col justify-between bg-neutral-950 p-7 transition-colors duration-500 hover:bg-neutral-900">
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d7b96a]">Step {String(index + 1).padStart(2, '0')}</span>
                    <span className="mt-8 font-serif text-2xl leading-snug">{step}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Who we work with */}
      {clients.enabled && (
        <section className="border-b border-neutral-200 bg-[#f1ece2] py-20 md:py-24">
          <div className={`${container} grid gap-10 lg:grid-cols-12 lg:items-center`}>
            <motion.div {...reveal()} className="lg:col-span-4">
              <Eyebrow>{clients.eyebrow}</Eyebrow>
              <h2 className="font-serif text-3xl leading-tight text-neutral-900 md:text-5xl">{clients.title}</h2>
            </motion.div>
            <ul className="flex flex-wrap gap-3 lg:col-span-8">
              {clients.items.filter(Boolean).map((item, index) => (
                <motion.li key={item} {...reveal(index * 0.05)} className="border border-neutral-900/15 bg-white/70 px-5 py-3 text-sm text-neutral-800">{item}</motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Consultation */}
      <section id="consultation" className={`${container} scroll-mt-28 py-24 md:py-32`}>
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionHeading eyebrow="Enquiries" title="Request a consultation" intro="Tell us about your space, what you would like to achieve and your timeline. We will come back to you to discuss the brief and next steps." />
            <ContactLinks contact={content.contact} />
          </div>
          <motion.div {...reveal(0.1)} className="border border-neutral-100 bg-white p-2 shadow-2xl">
            <div className="border border-neutral-100 p-8 md:p-12">
              <ConsultationForm />
            </div>
          </motion.div>
        </div>
      </section>

      <CompanyCTA content={content} />
    </motion.div>
  );
};

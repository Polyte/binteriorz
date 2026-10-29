import React from 'react';
import { motion } from 'motion/react';
import { Check, Eye, Target } from 'lucide-react';
import { ParallaxHeader } from '../components/ParallaxHeader';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CompanyCTA, Eyebrow, SectionHeading, reveal } from '../components/company/CompanyBlocks';
import { useCompanyContent } from '../content/CompanyContentContext';

const container = 'mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12';

export const About = () => {
  const content = useCompanyContent();
  const { hero, about, promise, clients, whyUs, portfolio, vision, values } = content.sections;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden bg-[#fafaf9]">
      <ParallaxHeader image={hero.image.url} title={hero.title} subtitle={hero.eyebrow} />

      {/* Tagline */}
      {hero.enabled && (hero.tagline || hero.intro) && (
        <section className="border-b border-neutral-200 bg-white">
          <motion.div {...reveal()} className={`${container} py-16 text-center md:py-20`}>
            <p className="mx-auto max-w-4xl font-serif text-2xl italic leading-snug text-neutral-800 md:text-4xl">{hero.tagline}</p>
            {hero.intro && <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-neutral-500">{hero.intro}</p>}
          </motion.div>
        </section>
      )}

      {/* Who we are */}
      {about.enabled && (
        <section className={`${container} py-24 md:py-32`}>
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SectionHeading eyebrow={about.eyebrow} title={about.title} />
              <div className="space-y-6">
                {about.paragraphs.filter(Boolean).map((paragraph, index) => (
                  <motion.p key={index} {...reveal(0.1 + index * 0.08)} className="text-lg font-light leading-relaxed text-neutral-600">{paragraph}</motion.p>
                ))}
              </div>
            </div>
            <motion.div {...reveal(0.15)} className="relative lg:col-span-6 lg:pl-8">
              <div className="aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
                <ImageWithFallback src={about.image.url} alt={about.image.alt || ''} className="h-full w-full object-cover" />
              </div>
              {about.secondaryImage?.url && (
                <div className="absolute -bottom-10 -left-4 hidden w-[42%] border-8 border-[#fafaf9] shadow-2xl sm:block lg:-left-10">
                  <div className="aspect-square overflow-hidden">
                    <ImageWithFallback src={about.secondaryImage.url} alt={about.secondaryImage.alt || ''} className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Design promise */}
      {promise.enabled && (
        <section className="bg-neutral-950 py-24 text-white md:py-32">
          <div className={`${container} grid gap-16 lg:grid-cols-2 lg:items-center`}>
            <motion.div {...reveal()} className="order-2 aspect-[4/3] overflow-hidden lg:order-1 lg:aspect-[4/5]">
              <ImageWithFallback src={promise.image.url} alt={promise.image.alt || ''} className="h-full w-full object-cover opacity-90" />
            </motion.div>
            <div className="order-1 lg:order-2">
              <SectionHeading eyebrow={promise.eyebrow} title={promise.title} intro={promise.intro} light />
              <ol className="divide-y divide-white/10 border-y border-white/10">
                {promise.points.filter(Boolean).map((point, index) => (
                  <motion.li key={index} {...reveal(index * 0.06)} className="flex gap-6 py-5">
                    <span className="font-serif text-xl tabular-nums text-[#d7b96a]">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-base font-light leading-relaxed text-white/80">{point}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Who we work with + why choose us */}
      {(clients.enabled || whyUs.enabled) && (
        <section className={`${container} py-24 md:py-32`}>
          <div className={`grid gap-8 ${clients.enabled && whyUs.enabled ? 'lg:grid-cols-2' : ''}`}>
            {clients.enabled && (
              <motion.div {...reveal()} className="border border-neutral-200 bg-white p-8 md:p-12">
                <Eyebrow>{clients.eyebrow}</Eyebrow>
                <h3 className="mb-8 font-serif text-3xl text-neutral-900 md:text-4xl">{clients.title}</h3>
                <ul className="space-y-4">
                  {clients.items.filter(Boolean).map((item) => (
                    <li key={item} className="flex gap-4 border-b border-neutral-100 pb-4 text-neutral-700 last:border-0">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#b8964a]" />{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            {whyUs.enabled && (
              <motion.div {...reveal(0.1)} className="bg-[#f1ece2] p-8 md:p-12">
                <Eyebrow>{whyUs.eyebrow}</Eyebrow>
                <h3 className="mb-8 font-serif text-3xl text-neutral-900 md:text-4xl">{whyUs.title}</h3>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {whyUs.items.filter(Boolean).map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-neutral-700">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9a7b37]" />{item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio.enabled && portfolio.items.length > 0 && (
        <section className="border-t border-neutral-200 bg-white py-24 md:py-32">
          <div className={container}>
            <SectionHeading eyebrow={portfolio.eyebrow} title={portfolio.title} intro={portfolio.intro} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {portfolio.items.map((item, index) => (
                <motion.figure key={item.id} {...reveal(index * 0.08)} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                    {item.image?.url && <ImageWithFallback src={item.image.url} alt={item.image.alt || item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                  </div>
                  <figcaption className="pt-5">
                    <h3 className="font-serif text-xl text-neutral-900">{item.title}</h3>
                    {item.text && <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.text}</p>}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vision & mission */}
      {vision.enabled && (
        <section className="relative overflow-hidden py-24 text-white md:py-32">
          <ImageWithFallback src={vision.image.url} alt={vision.image.alt || ''} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-neutral-950/75" />
          <div className={`${container} relative`}>
            <SectionHeading eyebrow={vision.eyebrow} title={vision.title} light center />
            <div className="grid gap-px bg-white/15 md:grid-cols-2">
              {[{ icon: Eye, label: 'Our vision', text: vision.vision }, { icon: Target, label: 'Our mission', text: vision.mission }].map(({ icon: Icon, label, text }, index) => (
                <motion.div key={label} {...reveal(index * 0.1)} className="bg-neutral-950/70 p-8 backdrop-blur-sm md:p-12">
                  <Icon className="mb-6 h-6 w-6 text-[#d7b96a]" strokeWidth={1.5} />
                  <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.35em] text-[#d7b96a]">{label}</h3>
                  <p className="font-serif text-2xl leading-snug md:text-3xl">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      {values.enabled && (
        <section className={`${container} py-24 md:py-32`}>
          <SectionHeading eyebrow={values.eyebrow} title={values.title} />
          <div className="grid gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
            {values.items.map((value, index) => (
              <motion.div key={value.id} {...reveal(index * 0.06)} className="group bg-[#fafaf9] p-8 transition-colors duration-500 hover:bg-white md:p-10">
                <span className="font-serif text-4xl text-neutral-200 transition-colors duration-500 group-hover:text-[#b8964a]">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 font-serif text-2xl text-neutral-900">{value.title}</h3>
                <p className="mt-3 font-light leading-relaxed text-neutral-600">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <CompanyCTA content={content} />
    </motion.div>
  );
};

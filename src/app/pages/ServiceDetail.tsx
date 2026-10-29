import React from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { CompanyCTA, ContactLinks, Eyebrow, reveal } from '../components/company/CompanyBlocks';
import { useCompanyContent } from '../content/CompanyContentContext';
import { CATEGORY_PAGES, SERVICE_PAGES, categorySlug } from '../content/landing';
import { DynamicPage } from './DynamicPage';

const container = 'mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12';

export const ServiceDetail = ({ products }: { products: any[] }) => {
  const { slug = '' } = useParams<{ slug: string }>();
  const content = useCompanyContent();
  const service = content.sections.services.items.find((item) => item.id === slug);
  const page = SERVICE_PAGES[slug];

  // Unknown service: fall through to the standard not-found view.
  if (!service) return <DynamicPage />;

  const related = (page?.relatedCategories || [])
    .flatMap((name) => products.filter((product) => product.category === name).slice(0, 2))
    .slice(0, 4);
  const otherServices = content.sections.services.items.filter((item) => item.id !== slug);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white">
      {/* Compact header */}
      <section className="relative overflow-hidden bg-neutral-950 pt-52 text-white md:pt-44">
        {service.image?.url && <ImageWithFallback src={service.image.url} alt="" loading="eager" fetchPriority="high" sizes="(min-width: 768px) 100vw, 360px" className="absolute inset-0 h-full w-full object-cover opacity-45" />}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/30" />
        <div className={`${container} relative pb-14 md:pb-20`}>
          <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
            <Link to="/" className="hover:text-white">Home</Link><ChevronRight className="h-3 w-3" />
            <Link to="/services" className="hover:text-white">Services</Link><ChevronRight className="h-3 w-3" />
            <span className="text-[#d7b96a]">{service.title}</span>
          </nav>
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight md:text-7xl">{service.title}</h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-white/75 md:text-xl">{service.text}</p>
          <a href="#enquire" className="group mt-10 inline-flex items-center gap-3 bg-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 transition-colors hover:bg-[#e4cc8d]">
            Enquire about this service <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>

      {/* Overview and what's included */}
      <section className={`${container} grid gap-16 py-20 md:py-28 lg:grid-cols-12`}>
        <motion.div {...reveal()} className="space-y-6 lg:col-span-7">
          <Eyebrow>Overview</Eyebrow>
          {(page?.intro || [service.text]).map((paragraph) => (
            <p key={paragraph} className="text-lg font-light leading-relaxed text-neutral-700 md:text-xl">{paragraph}</p>
          ))}
          {page?.idealFor?.length ? (
            <div className="pt-6">
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Ideal for</h2>
              <ul className="flex flex-wrap gap-2">
                {page.idealFor.map((item) => <li key={item} className="border border-neutral-200 bg-[#f7f3ec] px-4 py-2 text-sm text-neutral-800">{item}</li>)}
              </ul>
            </div>
          ) : null}
        </motion.div>
        {page?.includes?.length ? (
          <motion.aside {...reveal(0.1)} className="border border-neutral-200 bg-[#fbf9f5] p-8 lg:col-span-5 md:p-10">
            <h2 className="font-serif text-3xl text-neutral-900">What's included</h2>
            <ul className="mt-8 space-y-4">
              {page.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-neutral-700">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#9a7b37]" /> {item}
                </li>
              ))}
            </ul>
          </motion.aside>
        ) : null}
      </section>

      {/* How we work */}
      {content.sections.experience.steps.length > 0 && (
        <section className="bg-neutral-950 py-20 text-white md:py-24">
          <div className={container}>
            <Eyebrow light>How we work</Eyebrow>
            <h2 className="mb-12 font-serif text-4xl md:text-5xl">{content.sections.experience.title}</h2>
            <ol className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {content.sections.experience.steps.filter(Boolean).map((step, index) => (
                <li key={step} className="bg-neutral-950 p-7">
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d7b96a]">Step {String(index + 1).padStart(2, '0')}</span>
                  <p className="mt-6 font-serif text-2xl leading-snug">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className={`${container} py-20 md:py-24`}>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>From the showroom</Eyebrow>
              <h2 className="font-serif text-4xl text-neutral-900 md:text-5xl">Pieces to start with</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {page.relatedCategories.filter((name) => CATEGORY_PAGES[categorySlug(name)]).map((name) => (
                <Link key={name} to={`/shop/${categorySlug(name)}`} className="border-b border-neutral-900 pb-1 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-900">Shop {name}</Link>
              ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((product) => (
              <Link key={product.id} to={`/product/${encodeURIComponent(product.id)}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                  <ImageWithFallback src={product.image_url || product.image} alt={product.name} sizes="(min-width: 1024px) 25vw, 50vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-serif text-xl text-neutral-900">{product.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">R {Number(product.price).toLocaleString('en-ZA')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Enquire */}
      <section id="enquire" className="scroll-mt-28 border-t border-neutral-200 bg-[#f1ece2] py-20 md:py-24">
        <div className={`${container} grid gap-12 lg:grid-cols-2 lg:items-center`}>
          <div>
            <Eyebrow>Enquiries</Eyebrow>
            <h2 className="font-serif text-4xl text-neutral-900 md:text-5xl">Tell us about your space</h2>
            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-neutral-700">Share your brief, timeline and what you would like to achieve, and we will come back to you with next steps.</p>
            <Link to="/services#consultation" className="group mt-8 inline-flex items-center gap-3 bg-neutral-900 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white">
              Request a consultation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ContactLinks contact={content.contact} />
        </div>
      </section>

      {/* Other services */}
      <section className={`${container} py-20 md:py-24`}>
        <Eyebrow>More services</Eyebrow>
        <ul className="mt-6 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {otherServices.map((item) => (
            <li key={item.id} className="border-b border-neutral-200">
              <Link to={`/services/${item.id}`} className="group flex items-center justify-between py-5 font-serif text-xl text-neutral-900">
                {item.title}<ArrowRight className="h-4 w-4 text-[#9a7b37] transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CompanyCTA content={content} />
    </motion.div>
  );
};

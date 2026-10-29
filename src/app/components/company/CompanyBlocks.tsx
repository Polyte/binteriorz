import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { CompanyContent, socialLink, whatsappLink } from '../../content/company';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const ease = [0.22, 1, 0.36, 1] as const;

export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease, delay },
});

export const Eyebrow = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className={`h-px w-10 ${light ? 'bg-[#d7b96a]' : 'bg-[#b8964a]'}`} />
    <span className={`text-[10px] font-bold uppercase tracking-[0.4em] ${light ? 'text-[#d7b96a]' : 'text-[#9a7b37]'}`}>{children}</span>
  </div>
);

export const SectionHeading = ({ eyebrow, title, intro, light = false, center = false }: { eyebrow: string; title: string; intro?: string; light?: boolean; center?: boolean }) => (
  <motion.div {...reveal()} className={`mb-12 max-w-3xl md:mb-16 ${center ? 'mx-auto text-center [&>div]:justify-center' : ''}`}>
    <Eyebrow light={light}>{eyebrow}</Eyebrow>
    <h2 className={`font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl ${light ? 'text-white' : 'text-neutral-900'}`}>{title}</h2>
    {intro && <p className={`mt-6 text-lg font-light leading-relaxed md:text-xl ${light ? 'text-white/70' : 'text-neutral-600'}`}>{intro}</p>}
  </motion.div>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.77.12V9.77a5.68 5.68 0 1 0 4.91 5.63V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48Z" />
  </svg>
);

export const contactEntries = (contact: CompanyContent['contact']) => [
  { key: 'whatsapp', label: 'WhatsApp', value: contact.whatsapp, href: whatsappLink(contact.whatsapp), icon: MessageCircle },
  { key: 'phone', label: 'Phone', value: contact.phone, href: contact.phone ? `tel:${contact.phone.replace(/[^0-9+]/g, '')}` : '', icon: Phone },
  { key: 'email', label: 'Email', value: contact.email, href: contact.email ? `mailto:${contact.email.trim()}` : '', icon: Mail },
  { key: 'address', label: 'Studio', value: contact.address, href: contact.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}` : '', icon: MapPin },
  { key: 'instagram', label: 'Instagram', value: contact.instagram, href: socialLink(contact.instagram, 'https://www.instagram.com/'), icon: Instagram },
  { key: 'tiktok', label: 'TikTok', value: contact.tiktok, href: socialLink(contact.tiktok, 'https://www.tiktok.com/@'), icon: TikTokIcon },
  { key: 'facebook', label: 'Facebook', value: contact.facebook, href: socialLink(contact.facebook, 'https://www.facebook.com/'), icon: Facebook },
].filter((entry) => entry.href);

export const ContactLinks = ({ contact, light = false }: { contact: CompanyContent['contact']; light?: boolean }) => {
  const entries = contactEntries(contact);
  if (!entries.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {entries.map(({ key, label, value, href, icon: Icon }) => (
        <li key={key}>
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={`group flex items-center gap-4 border p-4 transition-colors ${light ? 'border-white/15 hover:border-[#d7b96a] hover:bg-white/5' : 'border-neutral-200 hover:border-neutral-900'}`}>
            <Icon className={`h-5 w-5 flex-shrink-0 ${light ? 'text-[#d7b96a]' : 'text-[#9a7b37]'}`} />
            <span className="min-w-0">
              <span className={`block text-[10px] font-bold uppercase tracking-[0.25em] ${light ? 'text-white/50' : 'text-neutral-400'}`}>{label}</span>
              <span className={`block break-words text-sm ${light ? 'text-white' : 'text-neutral-900'}`}>{value}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
};

export const CompanyCTA = ({ content }: { content: CompanyContent }) => {
  const cta = content.sections.cta;
  if (!cta.enabled) return null;
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-24 text-white md:py-32">
      <ImageWithFallback src={cta.image.url} alt={cta.image.alt || ''} className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/40" />
      <div className="relative mx-auto grid max-w-[1480px] gap-14 px-6 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12">
        <motion.div {...reveal()}>
          <Eyebrow light>{cta.eyebrow}</Eyebrow>
          <h2 className="font-serif text-4xl leading-[1.05] md:text-6xl">{cta.title}</h2>
          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/75">{cta.text}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/contact" className="group inline-flex items-center gap-3 bg-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-900 transition-colors hover:bg-[#e4cc8d]">
              Book a consultation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/services" className="inline-flex items-center border border-white/30 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-colors hover:border-white">
              Our services
            </Link>
          </div>
        </motion.div>
        <motion.div {...reveal(0.15)}>
          <ContactLinks contact={content.contact} light />
        </motion.div>
      </div>
    </section>
  );
};

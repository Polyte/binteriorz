import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { HeroCarousel } from '../components/HeroCarousel';
import { Marquee } from '../components/Marquee';
import { PressStrip } from '../components/PressStrip';
import { ProductSlider } from '../components/ProductSlider';
import { FeaturedSpotlight } from '../components/FeaturedSpotlight';
import { ShopByRoom } from '../components/ShopByRoom';
import { NewsletterPopup } from '../components/NewsletterPopup';
import { ArrowRight, MessageCircle, DraftingCompass, Hammer, PackageCheck } from 'lucide-react';
import { Link } from 'react-router';
import { HomepageContent, normalizeHomepageContent } from '../content/homepage';

interface HomeProps {
  products: any[];
  onAddToCart: (p: any) => void;
  onToggleWishlist: (p: any) => void;
  onQuickView: (p: any) => void;
  wishlistItems: any[];
  homepageContent?: HomepageContent | null;
}

const ease = [0.22, 1, 0.36, 1] as const;

export const Home = ({ products, onAddToCart, onToggleWishlist, onQuickView, wishlistItems, homepageContent }: HomeProps) => {
  const home = useMemo(() => normalizeHomepageContent(homepageContent), [homepageContent]);
  const prefersReducedMotion = useReducedMotion();

  const customOrderSteps = [
    { icon: MessageCircle, number: '01', title: 'Share your brief', text: 'Tell us what you need, where it will live, and what matters most to you.' },
    { icon: DraftingCompass, number: '02', title: 'Shape the details', text: 'We refine dimensions, finishes, materials, and the details that make it yours.' },
    { icon: Hammer, number: '03', title: 'Made with care', text: 'Our team brings the approved design to life with considered craftsmanship.' },
    { icon: PackageCheck, number: '04', title: 'Delivered to you', text: 'We coordinate delivery and installation so your new piece feels at home.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
      style={{ position: 'relative' }}
    >
      <h1 className="sr-only">B Interior Designz: interior design, bespoke furniture and décor in Alberton, Johannesburg South</h1>
      {/* ═══ 1. HERO ═══ */}
      {home.sections.hero.enabled && (
        <HeroCarousel slides={home.sections.hero.slides.filter((slide) => slide.id !== 'material-stories').map((slide) => ({
          ...slide,
          video: slide.id === 'cinematic-living'
            ? 'https://www.youtube.com/embed/1v5hcZpOMUI?autoplay=1&mute=1&controls=0&loop=1&playlist=1v5hcZpOMUI&start=8&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1'
            : slide.id === 'masterful-artistry'
              ? 'https://www.youtube.com/embed/NErMeyBrYTE?autoplay=1&mute=1&controls=0&loop=1&playlist=NErMeyBrYTE&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1'
              : slide.video,
          image: slide.image.url,
          imageAlt: slide.image.alt,
        }))} />
      )}

      {/* ═══ 2. LIVE PRODUCT CATALOGUE ═══ */}
      {home.sections.catalogue.enabled && (
        <>
          <ProductSlider
            title={home.sections.catalogue.title}
            products={products}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            wishlistItems={wishlistItems}
          />
          <NewsletterPopup />
        </>
      )}

      {/* A practical guide for customers considering a bespoke piece */}
      {home.sections.bespoke.enabled && <section
        className="relative z-[30] w-full overflow-visible bg-[#171510] bg-cover bg-center bg-fixed py-16 text-white md:py-20"
        style={{ backgroundImage: "url('/product-images/bi-052.jpg')" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[9999] mx-auto hidden max-w-[1480px] px-6 sm:px-8 md:block lg:px-12">
          <img
            data-wobble-reveal
            src="/bespoke-cushion.webp"
            alt="Art cushion featuring an African woman in an orange headwrap"
            loading="lazy"
            decoding="async"
            className="w-[340px] -translate-x-[52%] -translate-y-[34%] select-none drop-shadow-[0_26px_32px_rgba(0,0,0,.38)] lg:w-[410px]"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,15,12,.78)_0%,rgba(17,15,12,.62)_48%,rgba(17,15,12,.46)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? { opacity: 0.82, scale: 1 } : {
            opacity: [0.62, 0.92, 0.68, 1, 0.62],
            scale: [0.94, 1.06, 0.98, 1.08, 0.94],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,239,195,.72)_0%,rgba(255,213,143,.48)_13%,rgba(255,181,92,.24)_32%,rgba(217,145,67,.1)_52%,transparent_72%)] blur-3xl mix-blend-screen"
        />
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -right-8 -top-12 h-64 w-64 rounded-full border border-white/10" />
        <div className="relative z-10 mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease }}
            className="mb-10 flex flex-col justify-between gap-7 md:mb-12 md:flex-row md:items-end"
          >
            <div className="max-w-2xl md:ml-44 lg:ml-56">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-[#d7b96a]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#d7b96a]" style={{ fontFamily: 'var(--font-josefin)' }}>{home.sections.bespoke.eyebrow}</span>
              </div>
              <motion.h2
                data-no-reveal
                initial={{ opacity: 0, y: -72, rotateX: -32 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ type: 'spring', stiffness: 92, damping: 15, mass: 0.9, delay: 0.12 }}
                className="origin-top text-4xl leading-tight tracking-tight text-white md:text-6xl"
                style={{ fontFamily: 'var(--font-playfair)', transformPerspective: 800 }}
              >
                {home.sections.bespoke.title}
              </motion.h2>
            </div>
            <Link to="/contact" className="group inline-flex w-fit items-center gap-3 border-b border-white/40 pb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:border-[#d7b96a] hover:text-[#e4cc8d]" style={{ fontFamily: 'var(--font-josefin)' }}>
              Start a conversation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/15 shadow-2xl backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">
            {customOrderSteps.map((step, index) => (
              <motion.article key={step.number}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08, duration: 0.55, ease }}
                className="group min-h-[210px] bg-[#171510]/58 p-6 transition-colors duration-500 hover:bg-[#211e18]/76 md:p-7"
              >
                <div className="mb-7 flex items-center justify-between">
                  <step.icon className="h-5 w-5 text-[#d7b96a] transition-transform duration-300 group-hover:-translate-y-1" strokeWidth={1.5} />
                  <span className="text-xs tabular-nums text-white/35" style={{ fontFamily: 'var(--font-josefin)' }}>{step.number}</span>
                </div>
                <h3 className="mb-3 text-2xl text-white" style={{ fontFamily: 'var(--font-playfair)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{step.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>}

      {/* ═══ 3. MARQUEE — Brand Promise ═══ */}
      <Marquee />

      {/* ═══ 4. SHOP BY ROOM — Visual Navigator ═══ */}
      {home.sections.rooms.enabled && <ShopByRoom
        eyebrow={home.sections.rooms.eyebrow}
        title={home.sections.rooms.title}
        description={home.sections.rooms.description}
        rooms={home.sections.rooms.items.map((room) => ({
          ...room,
          image: room.image.url,
          video: room.slug === 'home-office'
            ? 'https://www.youtube.com/embed/pKwzfvIEiBs?autoplay=1&mute=1&controls=0&loop=1&playlist=pKwzfvIEiBs&start=30&rel=0&iv_load_policy=3&playsinline=1'
            : room.slug === 'bedroom'
              ? 'https://www.youtube.com/embed/gBv6sOXVG08?autoplay=1&mute=1&controls=0&loop=1&playlist=gBv6sOXVG08&rel=0&iv_load_policy=3&playsinline=1'
              : room.video,
        }))}
      />}

      {/* ═══ 5. PRESS — Publication Logos ═══ */}
      <PressStrip />

      {/* ═══ 6. FEATURED SPOTLIGHT — Editorial ═══ */}
      {home.sections.featured.enabled && <FeaturedSpotlight
        image="/product-images/bi-111.jpg"
        detailImage="/product-images/BID-CHR-111_03.jpeg"
        eyebrow={home.sections.featured.eyebrow}
        title={home.sections.featured.title}
        description={home.sections.featured.description}
      />}

    </motion.div>
  );
};

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { HeroCarousel } from '../components/HeroCarousel';
import { Marquee } from '../components/Marquee';
import { PressStrip } from '../components/PressStrip';
import { CategoryCard } from '../components/CategoryCard';
import { ProductSlider } from '../components/ProductSlider';
import { ServiceSection } from '../components/ServiceSection';
import { NewsletterParallax } from '../components/NewsletterParallax';
import { StatsBar } from '../components/StatsBar';
import { FeaturedSpotlight } from '../components/FeaturedSpotlight';
import { MoodGallery } from '../components/MoodGallery';
import { ShopByRoom } from '../components/ShopByRoom';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { ArrowRight, Gem, Truck, Shield, TreePine } from 'lucide-react';
const logo = "/logo.png";
import { Link } from 'react-router';

interface HomeProps {
  products: any[];
  onAddToCart: (p: any) => void;
  onToggleWishlist: (p: any) => void;
  onQuickView: (p: any) => void;
  wishlistItems: any[];
}

const trustPillars = [
  { icon: Gem, label: 'Studio Made', sub: 'Alberton, SA', accent: 'from-amber-100 to-amber-50', border: 'border-amber-200/60' },
  { icon: TreePine, label: 'Ethical Source', sub: 'Certified Timber', accent: 'from-emerald-100 to-emerald-50', border: 'border-emerald-200/60' },
  { icon: Truck, label: 'White Glove', sub: 'Premium Logistics', accent: 'from-blue-100 to-blue-50', border: 'border-blue-200/60' },
  { icon: Shield, label: 'Lifetime Care', sub: 'Heirloom Guarantee', accent: 'from-violet-100 to-violet-50', border: 'border-violet-200/60' },
];

const moodImages = [
  'https://images.unsplash.com/photo-1767800765630-f5603a47df68?auto=format&fit=crop&q=80&w=1080',
  'https://images.unsplash.com/photo-1765371515651-faa86f08f0ae?auto=format&fit=crop&q=80&w=1080',
  'https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?auto=format&fit=crop&q=80&w=1080',
  'https://images.unsplash.com/photo-1765828313695-cd872255352f?auto=format&fit=crop&q=80&w=1080',
  'https://images.unsplash.com/photo-1762418362644-a4daad168fb9?auto=format&fit=crop&q=80&w=1080',
  'https://images.unsplash.com/photo-1762423656649-24aaf046402e?auto=format&fit=crop&q=80&w=1080',
];

const ease = [0.22, 1, 0.36, 1] as const;

export const Home = ({ products, onAddToCart, onToggleWishlist, onQuickView, wishlistItems }: HomeProps) => {
  const trustRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: trustScroll } = useScroll({
    target: trustRef,
    offset: ['start end', 'end start'],
  });
  const trustY = useTransform(trustScroll, [0, 1], [30, -30]);

  const staticImages = {
    newsletter: "https://images.unsplash.com/photo-1765745518739-bd8225374713?auto=format&fit=crop&q=80&w=2000",
    service: "https://images.unsplash.com/photo-1542904990-579199bba13a?auto=format&fit=crop&q=80&w=1080",
    featured: "https://images.unsplash.com/photo-1661446569716-86e93bf267d3?auto=format&fit=crop&q=80&w=1080",
    featuredDetail: "https://images.unsplash.com/photo-1658264250874-52f403e2ebaa?auto=format&fit=crop&q=80&w=1080",
    categories: {
      tables: "https://images.unsplash.com/photo-1635826082437-1123d04d221e?auto=format&fit=crop&q=80&w=1080",
      lighting: "https://images.unsplash.com/photo-1518893883800-45cd0954574b?auto=format&fit=crop&q=80&w=1080",
      ornaments: "https://images.unsplash.com/photo-1734600891278-cea15105639f?auto=format&fit=crop&q=80&w=1080",
      vintage: "https://images.unsplash.com/photo-1629470937866-f8b6b7e98889?auto=format&fit=crop&q=80&w=1080"
    }
  };

  const categories = [
    { title: 'Custom Tables', image: staticImages.categories.tables, href: '/shop' },
    { title: 'Artisanal Lighting', image: staticImages.categories.lighting, href: '/shop' },
    { title: 'Bespoke Ornaments', image: staticImages.categories.ornaments, href: '/shop' },
    { title: 'Vintage Classics', image: staticImages.categories.vintage, href: '/shop' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
      style={{ position: 'relative' }}
    >
      {/* ═══ 1. HERO ═══ */}
      <HeroCarousel />

      {/* ═══ 2. MARQUEE — Brand Promise ═══ */}
      <Marquee />

      {/* ═══ 3. PRESS — Instant Credibility ═══ */}
      <PressStrip />

      {/* ═══ 4. CURATED CATEGORIES ═══ */}
      <section className="py-28 md:py-40 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 overflow-hidden relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: ease }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px bg-neutral-300" />
              <span
                className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                Curated Selection
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl text-neutral-900 leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Refined Living
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-900 group"
            style={{ fontFamily: 'var(--font-josefin)' }}
          >
            Explore All
            <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-900 group-hover:border-neutral-900 group-hover:text-white transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: ease }}
            >
              <CategoryCard {...cat} index={idx} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 5. STATS BAR — Social Proof Numbers ═══ */}
      <StatsBar />

      {/* ═══ 6. PRODUCT SLIDER ═══ */}
      <ProductSlider
        title="The 2026 Collection"
        products={products}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        onQuickView={onQuickView}
        wishlistItems={wishlistItems}
      />

      {/* ═══ 6b. RECENTLY VIEWED — Personalized ═══ */}
      <RecentlyViewed products={products} onQuickView={onQuickView} />

      {/* ═══ 7. FEATURED SPOTLIGHT — Editorial ═══ */}
      <FeaturedSpotlight
        image={staticImages.featured}
        detailImage={staticImages.featuredDetail}
      />

      {/* ═══ 8. SHOP BY ROOM — Visual Navigator ═══ */}
      <ShopByRoom />

      {/* ═══ 9. MOOD GALLERY — Lifestyle / Instagram ═══ */}
      <MoodGallery images={moodImages} />

      {/* ═══ 10. TRUST PILLARS ═══ */}
      <section ref={trustRef} className="py-32 md:py-44 bg-neutral-50 border-y border-neutral-100 overflow-hidden relative">
        {/* Subtle background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-20 md:mb-24"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-neutral-300" />
              <span
                className="text-[9px] uppercase tracking-[0.6em] text-neutral-400 font-bold"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                Why B-Interiors
              </span>
              <div className="w-12 h-px bg-neutral-300" />
            </div>
            <h2
              className="text-3xl md:text-5xl lg:text-6xl text-neutral-900 tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Built on Principle
            </h2>
          </motion.div>

          <motion.div style={{ y: trustY }} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trustPillars.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: ease }}
                className="group flex flex-col items-center text-center"
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${item.accent} p-5 md:p-6 mb-7 flex items-center justify-center transition-all duration-700 group-hover:shadow-xl group-hover:-translate-y-3 group-hover:scale-105 border ${item.border}`}>
                  <item.icon className="w-7 h-7 md:w-8 md:h-8 text-neutral-800 stroke-[1.5]" />
                </div>
                <h4
                  className="text-[11px] uppercase tracking-[0.35em] font-black text-neutral-900 mb-2"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  {item.label}
                </h4>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                  {item.sub}
                </p>
                {/* Decorative bottom line */}
                <div className="w-0 h-px bg-neutral-300 mt-4 group-hover:w-8 transition-all duration-700" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 11. SERVICES ═══ */}
      <ServiceSection image={staticImages.service} />

      {/* ═══ 12. ARTISAN GUILD CTA ═══ */}
      <section className="py-28 md:py-36 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: ease }}
            className="bg-neutral-950 p-12 md:p-20 lg:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-16"
          >
            {/* Grain overlay */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Subtle glow */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px bg-neutral-700" />
                <span
                  className="text-[9px] uppercase tracking-[0.6em] text-neutral-500 font-bold"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  The Guild
                </span>
              </div>
              <h2
                className="text-4xl md:text-6xl text-white mb-8 leading-[1.05] tracking-tight"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                For the <br />Artisans
              </h2>
              <p
                className="text-lg md:text-xl text-white/50 mb-12 leading-relaxed max-w-md"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Showcase your craftsmanship alongside the world's most refined
                collections. Join our network of verified luxury vendors.
              </p>
              <Link
                to="/become-a-partner"
                className="inline-flex items-center gap-4 py-5 px-10 bg-white text-neutral-900 hover:bg-neutral-100 transition-all duration-300 group"
              >
                <span
                  className="text-[10px] uppercase tracking-[0.3em] font-bold"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  Apply to Sell
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative z-10 w-full md:w-1/3 aspect-square hidden md:block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                className="w-full h-full border border-white/[0.06] rounded-full flex items-center justify-center"
              >
                <div className="w-4/5 h-4/5 border border-white/[0.04] rounded-full flex items-center justify-center">
                  <div className="w-3/5 h-3/5 border border-white/[0.03] rounded-full flex items-center justify-center">
                    <img
                      src={logo}
                      alt=""
                      className="w-14 h-14 object-contain invert opacity-20"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 13. NEWSLETTER ═══ */}
      <NewsletterParallax image={staticImages.newsletter} />
    </motion.div>
  );
};
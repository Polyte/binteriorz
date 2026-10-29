import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';
import { ScrollIndicator } from './ScrollIndicator';
import { bestImageUrl, webpSrcSet } from './figma/ImageWithFallback';
import { useUserInteracted } from '../utils/useUserInteracted';
import { Link } from 'react-router';

const defaultSlides = [
  {
    video: "https://www.youtube.com/embed/1v5hcZpOMUI?autoplay=1&mute=1&controls=0&loop=1&playlist=1v5hcZpOMUI&start=8&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1",
    title: "Curated Living",
    subtitle: "Layered interiors, sculptural furniture and considered finishes, composed around the way you live.",
    tag: "The House Edit"
  },
  {
    video: "https://www.youtube.com/embed/NErMeyBrYTE?autoplay=1&mute=1&controls=0&loop=1&playlist=NErMeyBrYTE&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1",
    title: "Bespoke Artistry",
    subtitle: "Made-to-measure pieces and refined detailing, shaped by our studio for spaces with a distinct point of view.",
    tag: "Inside the Design Studio"
  },
  {
    video: "https://www.youtube.com/embed/LxpWWAdFSgs?autoplay=1&mute=1&controls=0&loop=1&playlist=LxpWWAdFSgs&rel=0&iv_load_policy=3&vq=hd1080&enablejsapi=1&playsinline=1",
    image: "/product-images/bi-072.jpg",
    title: "Bespoke Office Setup",
    subtitle: "Tailored workspaces where considered storage, refined materials and focused comfort work beautifully together.",
    tag: "The Executive Edit"
  },
  {
    image: "/product-images/bi-057.jpg",
    title: "Enduring Interiors",
    subtitle: "Timeless rooms grounded in honest materials, balanced proportions and craftsmanship made to last.",
    tag: "The Signature Collection"
  },
  {
    image: "/product-images/bi-036.jpg",
    title: "Sculpted Spaces",
    subtitle: "A study in proportion, light and materiality—where every element is composed to give the room its own quiet rhythm.",
    tag: "The Spatial Edit"
  },
  {
    image: "/product-images/bi-072.jpg",
    title: "Reflective Balance",
    subtitle: "Art, light and sculptural forms meet in a composition designed to shift beautifully from every point of view.",
    tag: "The Art of Composition"
  },
  {
    image: "/product-images/bi-100.jpg",
    title: "Restful Retreats",
    subtitle: "Private spaces layered with tactile comfort, softened light and a calm, deeply personal sense of luxury.",
    tag: "Private Spaces"
  },
];

const ease = [0.22, 1, 0.36, 1] as const;
const SLIDE_DURATION = 11000;

interface HeroSlide {
  id?: string;
  enabled?: boolean;
  video?: string;
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle: string;
  tag: string;
  /** 'contain' floats a transparent product cutout; 'cover' (default) fills with a lifestyle photo. */
  fit?: 'cover' | 'contain';
}

export const HeroCarousel = ({ slides = defaultSlides }: { slides?: HeroSlide[] }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoFrameRef = useRef<HTMLIFrameElement>(null);
  const activeSlides = slides.filter((slide) => slide.enabled !== false);
  const visibleSlides = activeSlides.length ? activeSlides : defaultSlides;
  const [current, setCurrent] = useState(0);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  // Show the slide photo first; video starts after the visitor's first interaction.
  const videoAllowed = useUserInteracted();
  const prefersReducedMotion = useReducedMotion();
  // The first slide renders without its entrance animation so it paints immediately on page load;
  // later slides animate in as usual.
  const [hasAdvanced, setHasAdvanced] = useState(false);
  useEffect(() => { if (current !== 0) setHasAdvanced(true); }, [current]);
  const skipIntro = !hasAdvanced;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { if (media.matches) setIsLowBandwidth(true); };
    updateMotion();
    media.addEventListener?.('change', updateMotion);
    return () => media.removeEventListener?.('change', updateMotion);
  }, []);

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn) {
      const checkConnection = () => {
        const isSlow = conn.saveData || ['2g', '3g'].includes(conn.effectiveType);
        setIsLowBandwidth(isSlow);
      };
      conn.addEventListener('change', checkConnection);
      checkConnection();
      return () => conn.removeEventListener('change', checkConnection);
    }
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % visibleSlides.length);
  }, [visibleSlides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + visibleSlides.length) % visibleSlides.length);
  }, [visibleSlides.length]);

  const activeSlide = visibleSlides[current] || visibleSlides[0];
  const isActiveVideo = Boolean(activeSlide.video && !isLowBandwidth && videoAllowed);
  const isContain = activeSlide.fit === 'contain';
  const nextIndex = (current + 1) % visibleSlides.length;
  const nextSlide = visibleSlides[nextIndex];
  const nextIsContain = nextSlide?.fit === 'contain';
  const words = activeSlide.title.split(' ');

  const sendVideoCommand = useCallback((func: 'playVideo' | 'pauseVideo' | 'addEventListener', args: unknown[] = []) => {
    videoFrameRef.current?.contentWindow?.postMessage(JSON.stringify({
      event: 'command',
      func,
      args,
    }), '*');
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsHeroInView(entry.isIntersecting && entry.intersectionRatio >= 0.2);
    }, { threshold: [0, 0.2, 0.5] });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (current >= visibleSlides.length) {
      setCurrent(0);
      return;
    }
    if (isPaused || !isHeroInView || isActiveVideo) return;
    const timer = window.setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [current, isActiveVideo, isHeroInView, isPaused, next, visibleSlides.length]);

  useEffect(() => {
    if (!isActiveVideo) return;

    const frame = videoFrameRef.current;
    if (!frame) return;

    const registerForStateChanges = () => {
      frame.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: `hero-video-${current}` }), '*');
      sendVideoCommand('addEventListener', ['onStateChange']);
      sendVideoCommand(isHeroInView && !isPaused ? 'playVideo' : 'pauseVideo');
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow) return;
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (data?.event === 'onStateChange' && data.info === 0 && isHeroInView && !isPaused) {
        next();
      }
    };

    frame.addEventListener('load', registerForStateChanges);
    window.addEventListener('message', handleMessage);
    registerForStateChanges();

    return () => {
      frame.removeEventListener('load', registerForStateChanges);
      window.removeEventListener('message', handleMessage);
    };
  }, [current, isActiveVideo, isHeroInView, isPaused, next, sendVideoCommand]);

  // Warm the next slide's photo once the visitor is engaging, without competing with the first paint.
  useEffect(() => {
    if (!nextSlide?.image || !videoAllowed) return;
    const image = new Image();
    image.src = bestImageUrl(nextSlide.image, window.innerWidth);
  }, [nextSlide?.image, videoAllowed]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative h-[min(900px,100svh)] min-h-[700px] w-full overflow-hidden bg-neutral-950 outline-none [perspective:1800px] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber-300/70"
      aria-roledescription="carousel"
      aria-label="Featured B Interior Designz collections"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') prev();
        if (event.key === 'ArrowRight') next();
      }}
      onPanEnd={(_, info) => {
        if (info.offset.x < -70) next();
        if (info.offset.x > 70) prev();
      }}
    >
      <p className="sr-only" aria-live="polite">
        Slide {current + 1} of {visibleSlides.length}: {activeSlide.title}
      </p>

      {/* Background media */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.015, x: direction > 0 ? 18 : -18, rotateY: direction > 0 ? 42 : -42 }}
          animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, scale: 1.008, x: direction > 0 ? -28 : 28, rotateY: direction > 0 ? -58 : 58 }}
          transition={{ duration: 1.05, ease: [0.65, 0, 0.2, 1] }}
          style={{ transformOrigin: direction > 0 ? 'left center' : 'right center', transformStyle: 'preserve-3d' }}
          className="absolute inset-0 [backface-visibility:hidden]"
        >
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0 origin-center will-change-transform"
              initial={{ scale: 1 }}
              animate={{ scale: prefersReducedMotion ? 1 : 1.055 }}
              transition={{ duration: (SLIDE_DURATION / 1000) + 0.8, ease: 'linear' }}
            >
              {isActiveVideo ? (
                <div className="absolute inset-0 h-full w-full overflow-hidden bg-black pointer-events-none">
                  <iframe
                    ref={videoFrameRef}
                    src={activeSlide.video}
                    className="absolute top-1/2 left-1/2 min-w-full min-h-full w-[177.77777778vh] h-[56.25vw] -translate-x-1/2 -translate-y-1/2 [filter:brightness(1.1)_saturate(.94)_contrast(1.03)]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    title={`${activeSlide.title} background video`}
                    loading="lazy"
                  />
                </div>
              ) : activeSlide.fit === 'contain' ? (
                <picture className="contents">
                  <source type="image/webp" srcSet={webpSrcSet(activeSlide.image || "/product-images/bi-057.jpg")} sizes="100vw" />
                <img
                  src={activeSlide.image || "/product-images/bi-057.jpg"}
                  alt={activeSlide.imageAlt || activeSlide.title}
                  className="h-full w-full object-contain object-bottom [transform-origin:bottom_center] scale-[0.9] drop-shadow-[0_45px_60px_rgba(0,0,0,0.55)] sm:scale-[0.78] lg:translate-x-[15%] lg:scale-[0.84] xl:translate-x-[6%]"
                  loading={current === 0 ? "eager" : "lazy"}
                  fetchPriority={current === 0 ? "high" : "auto"}
                  decoding="async"
                />
                </picture>
              ) : (
                <picture className="contents">
                  <source type="image/webp" srcSet={webpSrcSet(activeSlide.image || "/product-images/bi-057.jpg")} sizes="100vw" />
                <img
                  src={activeSlide.image || "/product-images/bi-057.jpg"}
                  alt={activeSlide.imageAlt || activeSlide.title}
                  className="h-full w-full object-cover brightness-[1.14] contrast-[1.04] saturate-[1.03]"
                  loading={current === 0 ? "eager" : "lazy"}
                  fetchPriority={current === 0 ? "high" : "auto"}
                  decoding="async"
                />
                </picture>
              )}
            </motion.div>
          {/* Cinematic overlay layers */}
          <div className="hero-lighting-wash absolute inset-0" />
          <div className={`absolute inset-0 bg-gradient-to-b ${isContain ? 'from-neutral-950/35 via-transparent to-neutral-950/55' : 'from-neutral-950/48 via-neutral-950/10 to-neutral-950/62'}`} />
          <div className={`absolute inset-0 bg-gradient-to-r ${isContain ? 'from-neutral-950/80 via-neutral-950/20 to-transparent' : 'from-neutral-950/68 via-neutral-950/5 to-neutral-950/10'}`} />
          </div>

          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0.52, x: direction > 0 ? '120%' : '-120%' }}
            animate={{ opacity: 0, x: direction > 0 ? '-130%' : '130%' }}
            transition={{ duration: 1.08, ease: [0.45, 0, 0.55, 1] }}
            className={`pointer-events-none absolute inset-y-0 w-1/3 blur-md ${direction > 0 ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-[#fff4b5]/35 via-white/10 to-transparent`}
          />
          <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 w-px bg-[#f2d572]/35 shadow-[0_0_30px_rgba(242,213,114,.35)] ${direction > 0 ? 'right-0' : 'left-0'}`} />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic texture and responsive ambient light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[62%] z-[2] w-[48vw] -translate-x-1/2 rounded-full bg-amber-100/[0.09] blur-[130px] mix-blend-screen" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,.48)_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] opacity-[0.035] bg-noise" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-px bg-gradient-to-r from-transparent via-amber-100/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto grid h-full max-w-[1480px] grid-cols-1 items-center px-6 pb-24 pt-28 sm:px-8 sm:pb-28 sm:pt-32 md:pt-36 lg:px-12 lg:pt-32 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-16">
        <div className="max-w-3xl">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={current}
              initial={skipIntro ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.48, delay: 0.12, ease }}
            >
              {/* Tag badge */}
              <motion.div
                initial={skipIntro ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: ease }}
                className="mb-7"
              >
                <span
                  className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.5em] text-white/70 font-bold"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  <span className="w-8 h-px bg-white/30" />
                  {activeSlide.tag}
                </span>
              </motion.div>

              {/* Cover headline */}
              <div className="relative">
                <h2
                  className="relative z-[1] mb-8 h-[7rem] text-6xl leading-[0.9] tracking-tighter [perspective:900px] md:h-[11rem] md:text-8xl lg:h-[14.5rem] lg:text-9xl"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  {words.map((word, i) => (
                    <span key={i} className="block overflow-hidden">
                      <motion.span
                        initial={skipIntro ? false : { y: '-135%', opacity: 0, rotateX: -55 }}
                        animate={{ y: '0%', opacity: 1, rotateX: 0 }}
                        exit={{ y: '115%', opacity: 0, rotateX: 35 }}
                        transition={{
                          delay: 0.28 + i * 0.14,
                          type: 'spring',
                          stiffness: 105,
                          damping: 13,
                          mass: 0.85,
                        }}
                        className={i === 1
                          ? 'hero-gold-shine block origin-top'
                          : 'block origin-top text-white'}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </h2>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={skipIntro ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: ease }}
                className="mb-8 h-20 max-w-lg border-l border-[#d4af37]/50 pl-5 text-lg font-light leading-relaxed text-white/70 line-clamp-3 md:text-xl lg:mb-10"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {activeSlide.subtitle}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                initial={skipIntro ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: ease }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/shop"
                  className="group relative overflow-hidden px-10 py-5 bg-white text-neutral-900 uppercase tracking-widest text-[10px] font-bold hover:bg-[#f2d572] transition-all duration-500 flex items-center gap-3 shadow-[0_12px_35px_-18px_rgba(255,255,255,.7)]"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  <span className="relative z-10">Shop Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span aria-hidden="true" className="absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/70 blur-md transition-all duration-700 group-hover:left-[120%]" />
                </Link>
                <Link
                  to="/services"
                  className="px-10 py-5 border border-white/20 text-white uppercase tracking-widest text-[10px] font-bold backdrop-blur-sm hover:bg-white/10 transition-all"
                  style={{ fontFamily: 'var(--font-josefin)' }}
                >
                  Our Services
                </Link>
              </motion.div>

              <motion.div
                initial={skipIntro ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.05, duration: 0.7 }}
                className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[7px] font-bold uppercase tracking-[0.26em] text-white/40 sm:text-[8px]"
                style={{ fontFamily: 'var(--font-josefin)' }}
              >
                <span className="h-px w-8 bg-white/20" />
                <span>Vol. 01</span>
                <span className="text-[#d4af37]">•</span>
                <span>South Africa</span>
                <span className="text-[#d4af37]">•</span>
                <span>2026</span>
              </motion.div>

            </motion.div>
          </AnimatePresence>
        </div>

      {/* Editorial mirror — the next story in the carousel */}
      {visibleSlides.length > 1 && (
        <div className="pointer-events-none relative hidden h-[420px] w-[232px] justify-self-end [perspective:1400px] xl:block 2xl:h-[470px] 2xl:w-[260px]">
          <span aria-hidden="true" className="absolute -bottom-5 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-[50%] bg-black/55 blur-xl" />

          <AnimatePresence initial={false} mode="sync">
            <motion.button
              key={`preview-${current}`}
              type="button"
              onClick={() => { setDirection(1); setCurrent(nextIndex); }}
              aria-label={`Show next slide: ${nextSlide.title}`}
              initial={{ opacity: 0, x: direction > 0 ? 30 : -30, rotateY: direction > 0 ? 54 : -54 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -26 : 26, rotateY: direction > 0 ? -68 : 68 }}
              transition={{ duration: 1.05, ease: [0.65, 0, 0.2, 1] }}
              style={{ transformOrigin: direction > 0 ? 'left center' : 'right center', transformStyle: 'preserve-3d' }}
              className="pointer-events-auto group absolute inset-0 block h-full w-full text-left [backface-visibility:hidden]"
            >
              <span className="relative block h-full rounded-b-[1.3rem] rounded-t-[8rem] bg-[linear-gradient(105deg,#28150e_0%,#6b422c_18%,#362016_38%,#8b5d3e_55%,#3b2116_76%,#70452e_100%)] p-[10px] shadow-[0_32px_85px_-26px_rgba(0,0,0,.95),inset_0_1px_1px_rgba(255,222,177,.35)] ring-1 ring-[#c58a57]/50 transition-transform duration-700 group-hover:-translate-y-1">
                <span aria-hidden="true" className="absolute inset-[3px] rounded-b-[1.1rem] rounded-t-[7.8rem] border border-[#d2a16f]/35 shadow-[inset_0_0_18px_rgba(13,6,3,.75)]" />
                <span aria-hidden="true" className="absolute inset-y-8 left-[6px] w-px bg-gradient-to-b from-transparent via-[#e0b17c]/40 to-transparent" />
                <span aria-hidden="true" className="absolute inset-y-8 right-[6px] w-px bg-gradient-to-b from-transparent via-black/55 to-transparent" />

                <span className="relative block h-full overflow-hidden rounded-b-[0.75rem] rounded-t-[7.25rem] border border-[#d3a36e]/45 bg-[#17100d] shadow-[inset_0_0_30px_rgba(0,0,0,.8)]">
                  <picture className="contents">
                    <source type="image/webp" srcSet={webpSrcSet(nextSlide.image || '/product-images/bi-057.jpg')} sizes="220px" />
                    <motion.img
                      src={nextSlide.image || '/product-images/bi-057.jpg'}
                      loading="lazy"
                      decoding="async"
                      alt={nextSlide.imageAlt || nextSlide.title}
                      className={`h-full w-full opacity-80 [filter:brightness(.88)_saturate(.72)_sepia(.14)] transition-[transform,filter,opacity] duration-1000 group-hover:scale-105 group-hover:opacity-95 group-hover:[filter:brightness(.96)_saturate(.9)_sepia(.08)] ${nextIsContain ? 'object-contain object-bottom p-4 pb-14' : 'object-cover'}`}
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.2, ease }}
                    />
                  </picture>
                  <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-[#3b2418]/15" />
                  <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(118deg,transparent_12%,rgba(255,255,255,.03)_24%,rgba(255,245,226,.22)_32%,rgba(255,255,255,.04)_41%,transparent_53%)] mix-blend-screen" />
                  <span aria-hidden="true" className="absolute inset-[5px] rounded-b-[0.5rem] rounded-t-[6.9rem] border border-white/15 shadow-[inset_0_0_24px_rgba(228,201,167,.12)] transition-all duration-700 group-hover:inset-[8px] group-hover:border-[#e8c18c]/30" />
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: '135%', skewX: -12, opacity: 0 }}
                    animate={{ x: '-165%', opacity: [0, 0.7, 0] }}
                    transition={{ delay: 0.18, duration: 1.15, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-y-0 z-10 w-1/2 bg-gradient-to-r from-transparent via-[#fff8e7]/38 to-transparent blur-sm"
                  />

                  <span className="absolute left-1/2 top-8 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#c99a66]/35 bg-[#2e1a12]/55 px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.32em] text-[#ead1b2] backdrop-blur-md" style={{ fontFamily: 'var(--font-josefin)' }}>
                    <span className="h-1 w-1 rounded-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,.8)]" /> Up next
                  </span>

                  <span className="absolute inset-x-5 bottom-6">
                    <span className="mb-2 block text-[8px] font-bold uppercase tracking-[0.28em] text-[#e8bd82]" style={{ fontFamily: 'var(--font-josefin)' }}>{nextSlide.tag}</span>
                    <span className="block text-2xl leading-[1.05] text-white" style={{ fontFamily: 'var(--font-playfair)' }}>{nextSlide.title}</span>
                    <span className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                      <span className="text-[8px] uppercase tracking-[0.23em] text-white/50">Explore story</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d0a06d]/40 text-[#efd2ae] transition-all duration-500 group-hover:border-[#c9874c] group-hover:bg-[#6b422c] group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </span>
                </span>
              </span>

              <span className="absolute -left-9 top-1/2 -translate-y-1/2 text-[9px] font-bold tabular-nums tracking-[0.25em] text-[#d6a875]/55 [writing-mode:vertical-rl]" style={{ fontFamily: 'var(--font-josefin)' }}>
                {String(nextIndex + 1).padStart(2, '0')} / {String(visibleSlides.length).padStart(2, '0')}
              </span>
            </motion.button>
          </AnimatePresence>
        </div>
      )}
      </div>

      {/* Slide counter — right side vertical */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 hidden md:flex xl:hidden flex-col items-center gap-6">
        <span
          className="text-xs text-white/80 tabular-nums font-bold"
          style={{ fontFamily: 'var(--font-josefin)' }}
        >
          {String(current + 1).padStart(2, '0')}
        </span>
        <div className="w-px h-20 bg-white/10 relative overflow-hidden">
          <motion.div
            key={`${current}-${isPaused}`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isPaused ? 0 : 1 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
            className="absolute inset-0 bg-white/60 origin-top"
          />
        </div>
        <span
          className="text-xs text-white/30 tabular-nums"
          style={{ fontFamily: 'var(--font-josefin)' }}
        >
          {String(visibleSlides.length).padStart(2, '0')}
        </span>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />

      {/* Bottom navigation bar */}
      <div className="absolute bottom-6 left-0 right-0 z-20">
        <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between gap-5 border-t border-white/10 pt-5">
          {/* Editorial progress index */}
          <div className="max-w-xl flex-1">
            <div className="mb-3 flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.28em]" style={{ fontFamily: 'var(--font-josefin)' }}>
              <span className="text-[#efd36b]">{String(current + 1).padStart(2, '0')}</span>
              <span className="max-w-[13rem] truncate text-white/65">{activeSlide.title}</span>
              <span className="h-px flex-1 bg-white/15" />
              <span className="text-white/30">{String(visibleSlides.length).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-2">
              {visibleSlides.map((slide, i) => (
                <button
                  key={slide.id || `${slide.title}-${i}`}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  aria-label={`Show slide ${i + 1}: ${slide.title}`}
                  aria-current={current === i ? 'true' : undefined}
                  className="group flex h-4 min-w-0 flex-1 items-center"
                >
                  <span className="block h-[2px] w-full overflow-hidden bg-white/15">
                    {current === i ? (
                      <motion.span key={`${current}-${i}-${isPaused}`} className="block h-full origin-left bg-gradient-to-r from-[#9f7407] via-[#fff1a8] to-[#d4af37]" initial={{ scaleX: 0 }} animate={{ scaleX: isPaused ? 0 : 1 }} transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }} />
                    ) : <span className="block h-full w-0 bg-white/50 transition-all duration-500 group-hover:w-full" />}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nav arrows */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/10 text-white/60 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/60 hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPaused((paused) => !paused)}
              aria-label={isPaused ? 'Resume carousel autoplay' : 'Pause carousel autoplay'}
              aria-pressed={isPaused}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/10 text-white/60 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/60 hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
            >
              {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/10 text-white/60 backdrop-blur-md transition-all duration-300 hover:border-[#d4af37]/60 hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronLeft, ChevronRight, Expand, Heart, MapPin, MessageCircle, Minus, Plus, Ruler, ShoppingBag, X } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ShareMenu } from '../components/ShareMenu';
import { ProductReviews } from '../components/ProductReviews';
import { useCompanyContent } from '../content/CompanyContentContext';
import { whatsappLink } from '../content/company';
import { CATEGORY_PAGES, SERVICE_PAGES, categorySlug } from '../content/landing';
import { absoluteUrl, customerDescription } from '../seo';
import { getRecentlyViewedIds, trackProductView } from '../utils/recentlyViewed';

interface ProductDetailProps {
  products: any[];
  onAddToCart: (product: any, quantity?: number) => void;
  onToggleWishlist: (product: any) => void;
  wishlistItems: any[];
}

type MediaItem = { url: string; type: 'image' | 'video' };

const container = 'mx-auto max-w-[1480px] px-6 sm:px-8 lg:px-12';

const ROOM_LABELS: Record<string, string> = {
  'living-room': 'Living room',
  bedroom: 'Bedroom',
  'dining-room': 'Dining room',
  'home-office': 'Home office',
  entryway: 'Entryway',
};

const formatPrice = (value: unknown) => `R ${Number(value || 0).toLocaleString('en-ZA')}`;
const known = (value: unknown) => {
  const text = String(value || '').trim();
  return text && !/to confirm/i.test(text) ? text : '';
};
const isAvailable = (product: any) => product.stock !== 0 && !/unavailable|out of stock|discontinued/i.test(product.availability || '');

const mediaFor = (product: any): MediaItem[] => {
  const items = (Array.isArray(product.gallery) ? product.gallery : [])
    .map((item: any) => (typeof item === 'string' ? { url: item, type: 'image' } : { url: item?.url, type: item?.type === 'video' ? 'video' : 'image' }))
    .filter((item: MediaItem) => item.url);
  return items.length ? items : [{ url: product.image_url || product.image, type: 'image' }];
};

/** Full-screen viewer with keyboard, button and swipe navigation. */
const Lightbox = ({ media, index, name, onIndex, onClose }: { media: MediaItem[]; index: number; name: string; onIndex: (i: number) => void; onClose: () => void }) => {
  const startX = useRef<number | null>(null);
  const go = useCallback((step: number) => onIndex((index + step + media.length) % media.length), [index, media.length, onIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
  }, [go, onClose]);

  const item = media[index];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      role="dialog" aria-modal="true" aria-label={`${name} photos`}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-950/95"
      onPointerDown={(event) => { startX.current = event.clientX; }}
      onPointerUp={(event) => {
        if (startX.current === null) return;
        const delta = event.clientX - startX.current;
        startX.current = null;
        if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
      }}
    >
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="h-6 w-6" /></button>
      {media.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"><ChevronRight className="h-6 w-6" /></button>
        </>
      )}
      {item.type === 'video'
        ? <video src={item.url} controls autoPlay playsInline className="max-h-[88vh] max-w-[92vw]" />
        : <img src={item.url} alt={`${name}, photo ${index + 1}`} className="max-h-[88vh] max-w-[92vw] select-none object-contain" draggable={false} />}
      {media.length > 1 && <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tabular-nums tracking-widest text-white/70">{index + 1} / {media.length}</p>}
    </motion.div>
  );
};

/** Main image with hover zoom on desktop, thumbnails when there is more than one photo. */
const Gallery = ({ media, name, onOpen, index, setIndex }: { media: MediaItem[]; name: string; onOpen: () => void; index: number; setIndex: (i: number) => void }) => {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const item = media[index];
  const go = (step: number) => setIndex((index + step + media.length) % media.length);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto md:max-h-[640px] md:w-20 md:flex-col md:overflow-y-auto [scrollbar-width:none]">
          {media.map((entry, i) => (
            <button key={entry.url + i} type="button" onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === index}
              className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition md:w-20 ${i === index ? 'border-neutral-900' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              {entry.type === 'video'
                ? <video src={entry.url} muted className="h-full w-full object-cover" />
                : <img src={entry.url} alt="" loading="lazy" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      )}

      <div
        className="group relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-[#f1ede6]"
        onMouseMove={(event) => {
          if (item.type === 'video' || !window.matchMedia('(hover: hover)').matches) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setZoom({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={onOpen}
      >
        {item.type === 'video' ? (
          <video src={item.url} controls muted playsInline className="h-full w-full object-cover" />
        ) : (
          <ImageWithFallback
            key={item.url}
            src={item.url}
            alt={`${name}${media.length > 1 ? `, photo ${index + 1}` : ''}`}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 55vw, calc(100vw - 48px)"
            className="h-full w-full object-cover transition-transform duration-200 ease-out"
            style={zoom ? { transform: 'scale(1.9)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        )}
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 shadow-sm">
          <Expand className="h-3.5 w-3.5" /> <span className="hidden md:inline">Hover to zoom · Click to enlarge</span><span className="md:hidden">Tap to enlarge</span>
        </span>
        {media.length > 1 && (
          <>
            <button type="button" onClick={(event) => { event.stopPropagation(); go(-1); }} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow transition md:opacity-0 md:group-hover:opacity-100"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={(event) => { event.stopPropagation(); go(1); }} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-neutral-900 shadow transition md:opacity-0 md:group-hover:opacity-100"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>
    </div>
  );
};

const Disclosure = ({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) => (
  <details open={defaultOpen} className="group border-b border-neutral-200">
    <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-900 [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
    </summary>
    <div className="pb-6 text-[15px] leading-relaxed text-neutral-600">{children}</div>
  </details>
);

const ProductTile = ({ product }: { product: any }) => (
  <Link to={`/product/${encodeURIComponent(product.id)}`} className="group block">
    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#f1ede6]">
      <ImageWithFallback src={product.image_url || product.image} alt={product.name} sizes="(min-width: 1024px) 25vw, 50vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
    </div>
    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">{product.category}</p>
    <h3 className="mt-1 font-serif text-lg leading-snug text-neutral-900 group-hover:text-[#8a6a2f]">{product.name}</h3>
    <p className="mt-1 text-sm text-neutral-700">{formatPrice(product.price)}</p>
  </Link>
);

const ProductRow = ({ title, eyebrow, products, link }: { title: string; eyebrow: string; products: any[]; link?: { to: string; label: string } }) => (
  products.length === 0 ? null : (
    <section className="border-t border-neutral-200 py-16 md:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#9a7b37]">{eyebrow}</p>
          <h2 className="font-serif text-3xl text-neutral-900 md:text-4xl">{title}</h2>
        </div>
        {link && <Link to={link.to} className="border-b border-neutral-900 pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-900">{link.label}</Link>}
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {products.map((product) => <ProductTile key={product.id} product={product} />)}
      </div>
    </section>
  )
);

export const ProductDetail = ({ products, onAddToCart, onToggleWishlist, wishlistItems }: ProductDetailProps) => {
  const { id = '' } = useParams();
  const { contact } = useCompanyContent();
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const buyRef = useRef<HTMLDivElement>(null);

  const product = useMemo(() => products.find((item) => item.id === decodeURIComponent(id)), [products, id]);

  useEffect(() => {
    if (!product) return;
    setRecentIds(getRecentlyViewedIds().filter((recentId) => recentId !== product.id));
    trackProductView(product.id);
    setQuantity(1);
    setImageIndex(0);
  }, [product]);

  // Show a compact purchase bar once the main buttons scroll out of view.
  useEffect(() => {
    const target = buyRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(target);
    return () => observer.disconnect();
  }, [product]);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf9f5] pt-32">
        {products.length === 0
          ? <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" aria-label="Loading" />
          : (
            <div className="text-center">
              <h1 className="font-serif text-4xl text-neutral-900">This piece is no longer listed</h1>
              <Link to="/shop" className="mt-6 inline-block border-b border-neutral-900 pb-1 text-[10px] font-bold uppercase tracking-[0.25em]">Back to the shop</Link>
            </div>
          )}
      </div>
    );
  }

  const media = mediaFor(product);
  const available = isAvailable(product);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);
  const description = customerDescription(product.description);
  const slug = categorySlug(product.category);
  const categoryPage = CATEGORY_PAGES[slug];
  const serviceId = categoryPage?.relatedService && SERVICE_PAGES[categoryPage.relatedService] ? categoryPage.relatedService : undefined;
  const pageUrl = absoluteUrl(`/product/${encodeURIComponent(product.id)}`);
  const enquiry = `Hi B Interior Designz, I'm interested in the ${product.name}${product.sku ? ` (${product.sku})` : ''}. ${pageUrl}`;
  const whatsapp = whatsappLink(contact.whatsapp, enquiry);

  const facts = [
    { label: 'Category', value: product.category, to: categoryPage ? `/shop/${slug}` : undefined },
    { label: 'Colour', value: known(product.color) },
    { label: 'Material', value: known(product.materialFinish || product.material) },
    { label: 'Suits', value: (product.rooms || []).map((room: string) => ROOM_LABELS[room] || room).join(', ') },
    { label: 'Product code', value: product.sku || product.internalSku },
  ].filter((fact) => fact.value);

  const sameCategory = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  // One piece from each other category that suits the same rooms.
  const completeTheLook = products
    .filter((item) => item.category !== product.category && (item.rooms || []).some((room: string) => (product.rooms || []).includes(room)))
    .filter((item, i, list) => list.findIndex((other) => other.category === item.category) === i)
    .slice(0, 4);
  const recentlyViewed = recentIds.map((recentId) => products.find((item) => item.id === recentId)).filter(Boolean).slice(0, 4);

  const siblings = products.filter((item) => item.category === product.category);
  const position = siblings.findIndex((item) => item.id === product.id);
  const previous = position > 0 ? siblings[position - 1] : undefined;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : undefined;

  const addToCart = () => onAddToCart(product, quantity);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#fbf9f5] pb-24 pt-52 md:pt-40">
      <div className={container}>
        {/* Breadcrumb, plus previous/next within the category */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
            <Link to="/" className="hover:text-neutral-900">Home</Link><ChevronRight className="h-3 w-3" />
            <Link to="/shop" className="hover:text-neutral-900">Shop</Link><ChevronRight className="h-3 w-3" />
            {categoryPage ? <Link to={`/shop/${slug}`} className="hover:text-neutral-900">{product.category}</Link> : <span>{product.category}</span>}
            <ChevronRight className="h-3 w-3" />
            <span className="text-neutral-900" aria-current="page">{product.name}</span>
          </nav>
          {(previous || next) && (
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              {previous && <Link to={`/product/${encodeURIComponent(previous.id)}`} className="flex items-center gap-1 hover:text-neutral-900"><ChevronLeft className="h-3.5 w-3.5" /> Previous</Link>}
              {previous && next && <span className="text-neutral-300">|</span>}
              {next && <Link to={`/product/${encodeURIComponent(next.id)}`} className="flex items-center gap-1 hover:text-neutral-900">Next <ChevronRight className="h-3.5 w-3.5" /></Link>}
            </div>
          )}
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-12 xl:gap-16">
          <div className="lg:col-span-7">
            <Gallery media={media} name={product.name} index={imageIndex} setIndex={setImageIndex} onOpen={() => setLightboxOpen(true)} />
          </div>

          {/* Purchase panel */}
          <div className="lg:sticky lg:top-32 lg:col-span-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#9a7b37]">{product.category}</p>
            <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight text-neutral-900 md:text-5xl">{product.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <p className="text-2xl font-medium text-neutral-900">{formatPrice(product.price)}</p>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${available ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-200 text-neutral-600'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${available ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
                {available ? 'Available' : 'Currently unavailable'}
              </span>
            </div>

            {description && <p className="mt-6 text-[17px] font-light leading-relaxed text-neutral-700">{description}</p>}

            <div ref={buyRef} className="mt-8 space-y-3">
              <div className="flex gap-3">
                <div className="flex items-center rounded-full border border-neutral-300 bg-white">
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={quantity <= 1} className="grid h-12 w-11 place-items-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite" aria-label={`Quantity ${quantity}`}>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))} aria-label="Increase quantity" className="grid h-12 w-11 place-items-center text-neutral-500 hover:text-neutral-900"><Plus className="h-4 w-4" /></button>
                </div>
                <button type="button" onClick={addToCart} disabled={!available} className="flex h-12 flex-1 items-center justify-center gap-3 rounded-full bg-neutral-900 px-6 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300">
                  <ShoppingBag className="h-4 w-4" /> Add to cart
                </button>
                <button type="button" onClick={() => onToggleWishlist(product)} aria-pressed={isWishlisted} aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'} className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-full border transition ${isWishlisted ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900'}`}>
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noreferrer" className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-900 transition hover:border-neutral-900">
                  <MessageCircle className="h-4 w-4" /> Ask about this piece on WhatsApp
                </a>
              ) : (
                <Link to="/contact" className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-900 transition hover:border-neutral-900">
                  <MessageCircle className="h-4 w-4" /> Ask about this piece
                </Link>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-y border-neutral-200 py-4 text-sm text-neutral-600">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#9a7b37]" /> See it at our Alberton showroom</span>
              <ShareMenu productName={product.name} productId={product.id} productImage={product.image_url || product.image} variant="light" />
            </div>

            <div className="mt-2">
              {facts.length > 0 && (
                <Disclosure title="Details" defaultOpen>
                  <dl className="grid grid-cols-[minmax(0,8rem)_1fr] gap-x-4 gap-y-3 text-sm">
                    {facts.map((fact) => (
                      <React.Fragment key={fact.label}>
                        <dt className="text-neutral-400">{fact.label}</dt>
                        <dd className="text-neutral-900">{fact.to ? <Link to={fact.to} className="underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900">{fact.value}</Link> : fact.value}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </Disclosure>
              )}
              <Disclosure title="Sizing & finishes">
                <p className="flex gap-3"><Ruler className="mt-1 h-4 w-4 flex-shrink-0 text-[#9a7b37]" /> Exact dimensions, finishes and fabric options can vary. Ask us before you order and we will confirm the details for your space.</p>
                {serviceId && <p className="mt-3">Need a different size or fabric? <Link to={`/services/${serviceId}`} className="text-neutral-900 underline underline-offset-4">See how we make pieces to order</Link>.</p>}
              </Disclosure>
              <Disclosure title="Delivery & collection">
                <p>After you order, we contact you to confirm delivery or collection and the timing. You are welcome to see the piece first at 35 Radio Street, Alberton.</p>
              </Disclosure>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <ProductRow eyebrow="Complete the look" title="Pairs well with" products={completeTheLook} />
          <ProductRow eyebrow="More like this" title={`More ${product.category.toLowerCase()}`} products={sameCategory} link={categoryPage ? { to: `/shop/${slug}`, label: `All ${product.category.toLowerCase()}` } : undefined} />
          <ProductRow eyebrow="Your history" title="Recently viewed" products={recentlyViewed} />
        </div>

        <ProductReviews productId={product.id} />
      </div>

      {/* Compact purchase bar once the main buttons are off screen (sits above the mobile nav) */}
      {createPortal(
        <AnimatePresence>
          {showStickyBar && (
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.25 }}
              className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[90] border-t border-neutral-200 bg-white/95 backdrop-blur md:bottom-0">
              <div className={`${container} flex items-center gap-4 py-3`}>
                <img src={product.image_url || product.image} alt="" className="hidden h-12 w-12 rounded-lg object-cover sm:block" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-base text-neutral-900">{product.name}</p>
                  <p className="text-sm text-neutral-600">{formatPrice(product.price)}</p>
                </div>
                <button type="button" onClick={addToCart} disabled={!available} className="flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:bg-neutral-300">
                  <ShoppingBag className="h-4 w-4" /> Add{quantity > 1 ? ` ${quantity}` : ''}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {lightboxOpen && <Lightbox media={media} index={imageIndex} name={product.name} onIndex={setImageIndex} onClose={() => setLightboxOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
};

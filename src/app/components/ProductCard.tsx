import React, { useState } from 'react';
import { ArrowUpRight, Heart, Maximize2, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { prefetch } from '../utils/prefetch';
import { ImageLightbox } from './ImageLightbox';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  image_url?: string;
  category: string;
  material?: string;
  stock?: number;
  featured?: boolean;
  color?: string;
  colorHex?: string;
  availability?: string;
  editorialIndex?: number;
  eager?: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onQuickView: () => void;
  isWishlisted?: boolean;
}

export const ProductCard = ({ id, name, price, image, image_url, category, material, stock, featured, color, colorHex, availability, editorialIndex, eager = false, onAddToCart, onToggleWishlist, onQuickView, isWishlisted }: ProductCardProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();
  const isLowStock = typeof stock === 'number' && stock > 0 && stock <= 5;
  const isSoldOut = stock === 0 || /unavailable|out of stock|discontinued/i.test(availability || '');
  const displayImage = image_url || image;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col rounded-[1.6rem] border border-black/[0.055] bg-white/90 p-2 shadow-[0_18px_45px_-38px_rgba(51,35,19,.7)] backdrop-blur-sm transition-all duration-700 hover:-translate-y-1 hover:border-[#bba98e]/70 hover:shadow-[0_28px_65px_-40px_rgba(51,35,19,.72)]"
      onMouseEnter={() => prefetch(`/product/${id}`)}
    >
      <div className="product-card-visual relative aspect-[4/5] overflow-hidden rounded-[1.15rem] bg-[#eee9e1] shadow-[0_12px_32px_-24px_rgba(20,20,20,.28)] transition-[box-shadow,transform] duration-700 group-hover:shadow-[0_26px_55px_-30px_rgba(20,20,20,.5)]" style={{ backgroundColor: colorHex ? `${colorHex}12` : '#eee9e1' }}>
        <Link to={`/product/${id}`} className="block h-full w-full" aria-label={`View ${name}`}>
          <ImageWithFallback src={displayImage} alt={name} className="h-full w-full object-cover transition-[transform,filter] duration-[1400ms] ease-out group-hover:scale-[1.045] group-hover:saturate-[1.04]" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" />
          <div className="pointer-events-none absolute inset-3 rounded-[1rem] border border-white/0 transition-all duration-700 group-hover:inset-4 group-hover:border-white/55" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute bottom-5 left-5 translate-y-2 text-[8px] font-bold uppercase tracking-[0.3em] text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-90">Explore piece</span>
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 sm:left-4 sm:top-4">
          {editorialIndex && <span className="grid h-8 min-w-8 place-items-center rounded-full border border-white/60 bg-[#2d241c]/80 px-2 text-[8px] font-bold tabular-nums tracking-[0.12em] text-white shadow-sm backdrop-blur-md">{String(editorialIndex).padStart(2, '0')}</span>}
          {featured && <span className="rounded-full border border-white/50 bg-white/80 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.24em] text-neutral-900 shadow-sm backdrop-blur-md">Studio pick</span>}
          {isLowStock && <span className="rounded-full bg-[#402d24]/95 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-white shadow-sm">Only {stock} left</span>}
        </div>

        <button type="button" onClick={onToggleWishlist} aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`} aria-pressed={isWishlisted} className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border shadow-sm backdrop-blur transition-all duration-300 sm:right-4 sm:top-4 ${isWishlisted ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-white/60 bg-white/90 text-neutral-900 hover:bg-white'}`}>
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100 sm:inset-x-4 sm:bottom-4">
          <button type="button" onClick={onQuickView} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-neutral-900 shadow-lg hover:bg-neutral-100" aria-label={`Quick view ${name}`}>
            <Maximize2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={onAddToCart} disabled={isSoldOut} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-500">
            <ShoppingBag className="h-3.5 w-3.5" />{isSoldOut ? 'Sold out' : 'Add to cart'}
          </button>
        </div>

        <button type="button" onClick={() => setLightboxOpen(true)} aria-label={`Enlarge image of ${name}`} className="absolute bottom-4 right-4 hidden h-9 w-9 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-sm transition hover:bg-white lg:grid lg:group-hover:hidden">
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-1 gap-4 px-3 pb-3 pt-5">
        <div className="w-px shrink-0 self-stretch bg-[#d2c4b2] transition-all duration-500 group-hover:bg-[#806342]" aria-hidden="true" />
        <Link to={`/product/${id}`} className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#968570]">
            <span>{category}</span>{material && <><span aria-hidden="true">·</span><span className="truncate">{material}</span></>}
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-serif text-[1.12rem] font-medium leading-snug tracking-tight text-[#241d17] transition-colors group-hover:text-[#765d43]">{name}</h3>
              {color && <p className="mt-1 text-[10px] text-neutral-400">{color}</p>}
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-900" />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold tabular-nums text-[#241d17]">R {Number(price || 0).toLocaleString('en-ZA')}</p>
            {availability && <span className="truncate text-[8px] font-bold uppercase tracking-[0.16em] text-[#9a8c79]">{availability}</span>}
          </div>
        </Link>
      </div>

      <button type="button" onClick={onAddToCart} disabled={isSoldOut} className="mx-2 mb-2 mt-1 flex h-11 items-center justify-center gap-2 rounded-full border border-[#d4c7b5] text-[9px] font-bold uppercase tracking-[0.2em] text-[#241d17] transition hover:border-[#241d17] hover:bg-[#241d17] hover:text-white disabled:cursor-not-allowed disabled:text-neutral-400 md:hidden">
        <ShoppingBag className="h-3.5 w-3.5" />{isSoldOut ? 'Sold out' : 'Add to cart'}
      </button>

      <ImageLightbox isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} image={displayImage} alt={name} productName={name} productPrice={price} productCategory={category} productId={id} colorHex={colorHex} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onViewDetails={() => navigate(`/product/${id}`)} isWishlisted={isWishlisted} />
    </motion.article>
  );
};

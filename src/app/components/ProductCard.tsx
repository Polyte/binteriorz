import React, { useRef, useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { prefetch } from '../utils/prefetch';
import { ImageLightbox } from './ImageLightbox';
const logo = "/logo.png";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  image_url?: string;
  category: string;
  colorHex?: string;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onQuickView: () => void;
  isWishlisted?: boolean;
}

export const ProductCard = ({ id, name, price, image, image_url, category, colorHex, onAddToCart, onToggleWishlist, onQuickView, isWishlisted }: ProductCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const badgeY = useTransform(scrollYProgress, [0, 1], [-15, 15]);
  const isArtisan = category.toLowerCase().includes('furniture') || category.toLowerCase().includes('custom') || category.toLowerCase().includes('seating') || category.toLowerCase().includes('tables');

  // Calculate a very soft tint of the product color for the background
  const cardBg = colorHex ? `${colorHex}10` : 'rgba(245, 245, 245, 0.5)';

  return (
    <div ref={cardRef} className="relative h-full" style={{ position: 'relative' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8 }}
        className="group relative flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden p-3 transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] border border-transparent hover:border-neutral-100"
        onMouseEnter={() => prefetch(`/product/${id}`)}
        style={{ backgroundColor: 'white', position: 'relative' }}
      >
      {/* Image Container with soft color background */}
      <div 
        className="relative aspect-square overflow-hidden rounded-[2rem] mb-6 transition-all duration-700"
        style={{ backgroundColor: colorHex ? `${colorHex}15` : '#f8f8f8' }}
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block w-full h-full cursor-zoom-in"
        >
          <ImageWithFallback
            src={image_url || image}
            alt={name}
            className="h-full w-full object-cover mix-blend-multiply grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
        </button>

        {/* Certified Artisan Badge */}
        {isArtisan && (
          <div className="absolute top-5 left-5 z-10 pointer-events-none">
            <motion.div 
              style={{ y: badgeY }}
              className="bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 border border-white/10 shadow-xl rounded-full"
            >
              <div className="w-4 h-4 rounded-full overflow-hidden border border-white/20">
                <img src={logo} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-[7px] uppercase tracking-[0.3em] text-white font-bold leading-none">Artisan Verified</span>
            </motion.div>
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute bottom-5 left-5 z-20">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              onQuickView();
            }}
            className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Actions Overlay */}
        <div className="absolute top-5 right-5 flex flex-col gap-2 z-20">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onToggleWishlist}
            className={`w-11 h-11 rounded-full shadow-lg backdrop-blur-md transition-all duration-500 flex items-center justify-center ${
              isWishlisted 
                ? 'bg-neutral-900 text-white' 
                : 'bg-white/90 text-neutral-900 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </motion.button>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAddToCart}
          className="absolute bottom-5 right-5 z-20 bg-neutral-900 text-white w-11 h-11 rounded-full shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center hover:bg-neutral-800"
        >
          <ShoppingCart className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Info Section */}
      <Link to={`/product/${id}`} className="block px-5 pb-5 group/info">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: colorHex || '#e5e5e5' }} 
            />
            <p className="text-[9px] text-neutral-400 uppercase tracking-[0.3em] font-bold">{category}</p>
          </div>
          <h3 className="text-base font-serif font-bold text-neutral-900 mb-2 tracking-tight group-hover/info:text-neutral-500 transition-colors">{name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-900">R {price.toLocaleString()}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Details</span>
               <Eye className="w-3 h-3 text-neutral-400" />
            </div>
          </div>
      </Link>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        image={image_url || image}
        alt={name}
        productName={name}
        productPrice={price}
        productCategory={category}
        productId={id}
        colorHex={colorHex}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        onViewDetails={() => navigate(`/product/${id}`)}
        isWishlisted={isWishlisted}
      />
      </motion.div>
    </div>
  );
};
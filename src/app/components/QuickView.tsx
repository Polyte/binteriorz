import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Heart, ShieldCheck, Search, ChevronDown, Split } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShareMenu } from './ShareMenu';
const logo = "/logo.png";

const knownValue = (value: unknown) => {
  const text = String(value || '').trim();
  return text && !/to confirm/i.test(text) ? text : '';
};

const productDescription = (product: any) => String(product?.description || '').replace(/<[^>]*>/g, '').trim();

// Only real catalogue facts are shown; unknown ("To Confirm") values are left out.
const productDetails = (product: any) => [
  { label: 'Material', value: knownValue(product?.materialFinish || product?.material) },
  { label: 'Colour', value: knownValue(product?.color) },
].filter((detail) => detail.value);

// Extra views come from the product's own gallery; the main image is already shown first.
const galleryThumbnails = (product: any) => (Array.isArray(product?.gallery) ? product.gallery : [])
  .slice(1)
  .map((item: any, index: number) => ({ id: `view-${index + 2}`, name: `View ${index + 2}`, url: typeof item === 'string' ? item : item?.url }))
  .filter((item: { url?: string }) => item.url && item.url !== (product.image_url || product.image));

interface QuickViewProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: any) => void;
  onToggleWishlist: (p: any) => void;
  isWishlisted: boolean;
}

export const QuickView = ({ product, isOpen, onClose, onAddToCart, onToggleWishlist, isWishlisted }: QuickViewProps) => {
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [comparisonImage, setComparisonImage] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image_url || product.image);
      setComparisonImage(galleryThumbnails(product)[0]?.url || product.image_url || product.image);
      setComparisonMode(false);
      setShowScrollIndicator(true);
    }
  }, [product]);

  if (!product) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop > 50) {
      setShowScrollIndicator(false);
    } else {
      setShowScrollIndicator(true);
    }
  };

  const handleMaterialSelect = (url: string) => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    if (comparisonMode) {
      setComparisonImage(url);
    } else {
      setActiveImage(url);
    }
  };

  const toggleComparison = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(20);
    setComparisonMode(!comparisonMode);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const isArtisan = product.category.toLowerCase().includes('furniture') || product.category.toLowerCase().includes('custom');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            onScroll={handleScroll}
            className="fixed inset-x-0 bottom-0 top-[5%] md:top-[10%] bg-white z-[120] overflow-y-auto rounded-t-[2rem] shadow-2xl"
          >
            {/* Mobile Header */}
            <div className="sticky top-0 right-0 left-0 bg-white/80 backdrop-blur-md z-30 px-6 py-4 flex justify-between items-center md:hidden border-b border-neutral-100">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Quick View</span>
              <button 
                onClick={onClose}
                className="p-2 bg-neutral-100 rounded-full active:scale-90 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Close */}
            <div className="absolute top-8 right-8 md:right-12 z-20 hidden md:block">
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 bg-neutral-100 rounded-full hover:bg-neutral-900 hover:text-white transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Scroll Indicator (Mobile only) */}
            <AnimatePresence>
              {showScrollIndicator && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-none"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-neutral-400">Scroll to Explore</span>
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronDown className="w-4 h-4 text-neutral-300" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 md:py-24">
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                {/* Image / Material Zoom Section */}
                <div className="flex-1">
                  <div 
                    ref={imageRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    className="aspect-square bg-neutral-50 overflow-hidden relative rounded-xl lg:rounded-none cursor-crosshair group"
                  >
                    {!comparisonMode ? (
                      <motion.div
                        animate={{
                          scale: isZoomed ? 2 : 1,
                          x: isZoomed ? `${50 - zoomPos.x}%` : "0%",
                          y: isZoomed ? `${50 - zoomPos.y}%` : "0%",
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.5 }}
                        className="w-full h-full origin-center"
                      >
                        <ImageWithFallback
                          src={activeImage || product.image_url || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <div className="flex w-full h-full">
                        <div className="w-1/2 h-full border-r border-white/20 overflow-hidden relative">
                          <ImageWithFallback src={activeImage!} alt="Base" className="w-full h-full object-cover scale-150" />
                          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[8px] text-white uppercase font-bold tracking-widest">Selected</div>
                        </div>
                        <div className="w-1/2 h-full overflow-hidden relative">
                          <ImageWithFallback src={comparisonImage!} alt="Comparison" className="w-full h-full object-cover scale-150" />
                          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[8px] text-white uppercase font-bold tracking-widest">Compare</div>
                        </div>
                      </div>
                    )}

                    {/* Hint overlay */}
                    <AnimatePresence>
                      {!isZoomed && !comparisonMode && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none group-hover:bg-black/0 transition-colors"
                        >
                          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-white/20">
                            <Search className="w-3 h-3 text-neutral-400" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-600">Material Zoom</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isArtisan && (
                      <div className="absolute top-4 left-4 md:top-8 md:left-8 pointer-events-none">
                        <div className="bg-neutral-900 px-3 py-1.5 md:px-4 md:py-2 border border-white/10 shadow-2xl flex items-center gap-2 md:gap-3">
                           <div className="w-4 h-4 md:w-5 md:h-5 rounded-full overflow-hidden border border-white/20">
                            <img src={logo} alt="" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white font-bold">Artisan Certified</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extra product views, only when the product has more than one photo */}
                  {galleryThumbnails(product).length > 0 && (
                  <div className="mt-4 md:mt-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-neutral-400">More views</span>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleComparison}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                          comparisonMode ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-transparent border-neutral-200 text-neutral-500'
                        }`}
                      >
                        <Split className="w-3 h-3" />
                        <span className="text-[8px] uppercase font-bold tracking-widest">Comparison Mode</span>
                      </motion.button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMaterialSelect(product.image_url || product.image)}
                        className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 border-2 transition-all ${
                          (comparisonMode ? comparisonImage : activeImage) === (product.image_url || product.image) ? 'border-neutral-900 scale-105 shadow-md' : 'border-transparent'
                        } rounded-lg overflow-hidden bg-neutral-50`}
                      >
                        <ImageWithFallback src={product.image_url || product.image} alt="Main" className="w-full h-full object-cover" />
                      </motion.button>
                      {galleryThumbnails(product).map((thumb: { id: string; name: string; url: string }) => (
                        <motion.button
                          key={thumb.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMaterialSelect(thumb.url)}
                          className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 border-2 transition-all ${
                            (comparisonMode ? comparisonImage : activeImage) === thumb.url ? 'border-neutral-900 scale-105 shadow-md' : 'border-transparent'
                          } rounded-lg overflow-hidden bg-neutral-50 relative group`}
                        >
                          <ImageWithFallback src={thumb.url} alt={thumb.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold uppercase tracking-widest">{thumb.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-6 md:space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-neutral-400 font-bold">{product.category}</span>
                      <div className="h-px w-6 md:w-8 bg-neutral-200" />
                      <div className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold">In Stock</span>
                      </div>
                    </div>
                    <h2 className="text-3xl md:text-6xl font-serif text-neutral-900 mb-2 md:mb-4">{product.name}</h2>
                    <p className="text-xl md:text-2xl font-medium text-neutral-600">R {product.price?.toLocaleString()}</p>
                  </div>

                  {productDescription(product) && (
                    <p className="text-neutral-500 leading-relaxed text-base md:text-lg font-light">{productDescription(product)}</p>
                  )}

                  <div className="space-y-4 pt-4">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <motion.button 
                        whileTap={{ scale: 0.95, y: 2 }}
                        onClick={() => onAddToCart(product)}
                        className="flex-grow bg-neutral-900 text-white py-4 md:py-5 px-8 text-xs uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3 order-1 sm:order-none shadow-lg shadow-neutral-900/10 active:shadow-sm"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Collection
                      </motion.button>
                      <div className="flex gap-3 md:gap-4">
                        <motion.button 
                          whileTap={{ scale: 0.9, rotate: isWishlisted ? -15 : 15 }}
                          onClick={() => onToggleWishlist(product)}
                          className={`flex-1 sm:flex-none p-4 md:p-5 border transition-all duration-300 flex items-center justify-center ${
                            isWishlisted ? 'bg-neutral-100 border-neutral-100 text-neutral-900' : 'border-neutral-200 hover:border-neutral-900'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-neutral-900' : ''}`} />
                        </motion.button>
                        <ShareMenu
                          productName={product.name}
                          productId={product.id}
                          productImage={product.image_url || product.image}
                          variant="light"
                          compact
                        />
                      </div>
                    </div>
                  </div>

                  {productDetails(product).length > 0 && (
                    <div className="grid grid-cols-2 gap-6 md:gap-8 pt-10 md:pt-12 border-t border-neutral-100">
                      {productDetails(product).map(({ label, value }) => (
                        <div key={label}>
                          <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 mb-2 md:mb-3">{label}</h4>
                          <p className="text-xs md:text-sm text-neutral-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
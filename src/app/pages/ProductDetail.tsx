import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, ChevronRight, ChevronLeft, Minus, Plus, ShieldCheck, Truck, RefreshCw, Eye, Sparkles, Play, Film } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ShareMenu } from '../components/ShareMenu';
import { customerDescription } from '../seo';
import { ProductReviews } from '../components/ProductReviews';
import { trackProductView } from '../components/RecentlyViewed';
const logo = "/logo.png";

interface ProductDetailProps {
  products: any[];
  onAddToCart: (p: any) => void;
  onToggleWishlist: (p: any) => void;
  wishlistItems: any[];
}

export const ProductDetail = ({ products, onAddToCart, onToggleWishlist, wishlistItems }: ProductDetailProps) => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [selectedFinish, setSelectedFinish] = useState('Natural Finish');

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(p => p.id === id);
      setProduct(found);
      if (found?.material) setSelectedFinish(`${found.material} Natural`);
      // Track this product view for "Recently Viewed" strip
      if (found?.id) trackProductView(found.id);
    }
  }, [id, products]);

  const isWishlisted = useMemo(() => 
    product ? wishlistItems.some(item => item.id === product.id) : false
  , [product, wishlistItems]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 bg-[#fcfcfc]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-neutral-100 border-t-neutral-900 rounded-full" 
        />
      </div>
    );
  }

  // Use real gallery from admin or fallback to legacy image field
  const galleryItems: { url: string; type: 'image' | 'video' }[] = product.gallery?.length > 0
    ? product.gallery
    : [{ url: product.image_url || product.image, type: 'image' as const }];

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % galleryItems.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

  const grainOverlay = (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" style={{ 
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
    }} />
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 relative bg-[#fcfcfc]"
      style={{ position: 'relative' }}
    >
      {grainOverlay}
      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-neutral-400 mb-16 font-bold">
          <Link to="/" className="hover:text-neutral-900 transition-colors">Studio</Link>
          <div className="w-1 h-1 rounded-full bg-neutral-200" />
          <Link to="/shop" className="hover:text-neutral-900 transition-colors">Catalog</Link>
          <div className="w-1 h-1 rounded-full bg-neutral-200" />
          <span className="text-neutral-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24 items-start">
          {/* Main Gallery - Spans 7 cols */}
          <div className="lg:col-span-7 space-y-8 sticky top-32">
            <div 
              className="relative aspect-[4/5] overflow-hidden rounded-[3rem] group"
              style={{ backgroundColor: product.colorHex ? `${product.colorHex}10` : '#f5f5f5' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                  className="w-full h-full"
                >
                  {galleryItems[activeImageIndex]?.type === 'video' ? (
                    <video
                      src={galleryItems[activeImageIndex].url}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageWithFallback 
                      src={galleryItems[activeImageIndex]?.url} 
                      className="w-full h-full object-cover mix-blend-multiply transition-all duration-1000 group-hover:scale-110" 
                      alt={product.name} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute inset-0 flex items-center justify-between px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage} 
                  className="p-5 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl text-neutral-900"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage} 
                  className="p-5 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl text-neutral-900"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-8 left-8">
                <div className="bg-neutral-900/90 backdrop-blur-md px-4 py-2 flex items-center gap-3 border border-white/10 shadow-2xl rounded-full">
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-white/20">
                    <img src={logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-white font-bold">Artisan Handcrafted</span>
                </div>
              </div>
            </div>

            <div className={`grid gap-4 ${galleryItems.length <= 3 ? 'grid-cols-3' : galleryItems.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
              {galleryItems.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-[4/3] rounded-2xl overflow-hidden bg-white border-2 transition-all duration-500 relative ${idx === activeImageIndex ? 'border-neutral-900 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                      <video src={item.url} muted className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-neutral-900 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={item.url} className="w-full h-full object-cover" alt={`${product.name} view ${idx + 1}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Details - Spans 5 cols */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <header className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold">{product.category}</span>
                <div className="h-px w-12 bg-neutral-100" />
                <div className="flex items-center gap-2 text-emerald-600">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[9px] uppercase tracking-widest font-bold">Ready to ship</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif text-neutral-900 tracking-tighter leading-[0.9] mb-6">{product.name}</h1>
              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-medium text-neutral-900">R {product.price.toLocaleString()}</p>
                <span className="text-xs text-neutral-400 tracking-widest uppercase">Inc. VAT</span>
              </div>
            </header>

            <div className="space-y-12">
              <div className="prose prose-neutral max-w-none">
                <p className="text-lg text-neutral-600 leading-relaxed font-light">
                  {customerDescription(product.description) || <>The <span className="text-neutral-900 font-medium italic">{product.name}</span> is available to view in our Alberton showroom.</>}
                </p>
                <p className="mt-4 text-sm text-neutral-500">
                  Ask us about exact dimensions, finishes and sizing before you order, or <Link to="/contact" className="text-neutral-900 underline underline-offset-4">get in touch</Link> to see it in the showroom.
                </p>
              </div>

              {/* Selection Options */}
              <div className="grid grid-cols-1 gap-10">
                <div>
                   <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-900">Proportion</label>
                    <span className="text-[10px] text-neutral-400 font-medium italic">{selectedSize}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Standard', 'Gallery', 'Bespoke'].map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-4 text-[10px] uppercase tracking-[0.2em] border-2 transition-all duration-500 rounded-2xl font-bold flex items-center justify-center ${selectedSize === size ? 'bg-neutral-50 border-neutral-900 text-neutral-900 shadow-inner' : 'border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-12 border-t border-neutral-100">
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center bg-white border-2 border-neutral-100 rounded-2xl px-4 py-2">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:text-neutral-900 transition-colors text-neutral-400"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold font-serif">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:text-neutral-900 transition-colors text-neutral-400"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAddToCart({ ...product, id: `${product.id}-${selectedFinish}-${selectedSize}` })}
                    className="flex-1 bg-neutral-900 text-white py-6 px-8 text-xs uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-all rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-neutral-900/20 group"
                  >
                    <ShoppingBag className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                    Reserve Piece
                  </motion.button>

                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => onToggleWishlist(product)}
                    className={`w-16 sm:w-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${isWishlisted ? 'bg-neutral-100 border-neutral-100 text-neutral-900 shadow-inner' : 'border-neutral-100 hover:border-neutral-900 text-neutral-400 hover:text-neutral-900'}`}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-neutral-900' : ''}`} />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between py-6 border-y border-neutral-100">
                  <div className="flex items-center gap-6">
                     <ShareMenu
                       productName={product.name}
                       productId={product.id}
                       productImage={product.image_url || product.image}
                       variant="light"
                     />
                     <div className="w-px h-4 bg-neutral-100" />
                     <button className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors font-bold">
                        <ShieldCheck className="w-4 h-4" /> Authenticity
                     </button>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <Truck className="w-4 h-4" />
                    <span className="text-[9px] uppercase tracking-widest font-bold">White Glove Delivery</span>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <details className="group border-b border-neutral-100 pb-4">
                  <summary className="list-none flex justify-between items-center cursor-pointer py-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-900">Dimensionality</span>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="pt-4 text-xs text-neutral-500 leading-loose">
                    <p>Width: 120cm | Depth: 45cm | Height: 75cm</p>
                    <p>Custom dimensions available upon commission request.</p>
                  </div>
                </details>
                <details className="group border-b border-neutral-100 pb-4">
                  <summary className="list-none flex justify-between items-center cursor-pointer py-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-900">Provenance & Origin</span>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="pt-4 text-xs text-neutral-500 leading-loose">
                    <p>Crafted: Alberton Heritage Studio, Gauteng</p>
                    <p>Material Source: Sustainable Cape Woodlands</p>
                    <p>Verification ID: BI-{product.id}-2026</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Complements Section */}
        <section className="mt-48">
          <header className="flex justify-between items-end mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold block mb-4">Curated Dialogues</span>
              <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 tracking-tighter">Complete the Aesthetic</h2>
            </div>
            <Link to="/shop" className="text-[10px] uppercase tracking-[0.3em] font-bold border-b-2 border-neutral-900 pb-2 hover:text-neutral-500 hover:border-neutral-500 transition-colors">View All Works</Link>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <Link to={`/product/${item.id}`}>
                  <div 
                    className="aspect-[4/5] overflow-hidden rounded-[2rem] mb-6 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2"
                    style={{ backgroundColor: item.colorHex ? `${item.colorHex}10` : '#f5f5f5' }}
                  >
                    <img src={item.image_url || item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt={item.name} />
                  </div>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-2">{item.category}</p>
                  <h3 className="text-sm font-serif font-bold text-neutral-900 tracking-tight group-hover:text-neutral-500 transition-colors">{item.name}</h3>
                  <p className="text-sm text-neutral-900 mt-2">R {item.price.toLocaleString()}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>
    </motion.div>
  );
};
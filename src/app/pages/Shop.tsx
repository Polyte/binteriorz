import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { ParallaxHeader } from '../components/ParallaxHeader';
import { useSearchParams } from 'react-router';

interface ShopProps {
  products: any[];
  onAddToCart: (p: any) => void;
  onToggleWishlist: (p: any) => void;
  onQuickView: (p: any) => void;
  wishlistItems: any[];
  loading: boolean;
}

export const Shop = ({ products, onAddToCart, onToggleWishlist, onQuickView, wishlistItems, loading }: ShopProps) => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMaterial, setActiveMaterial] = useState('All');
  const [activeColor, setActiveColor] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  // Handle ?room= query param from Shop by Room navigator
  useEffect(() => {
    const room = searchParams.get('room');
    if (room) {
      setActiveRoom(room);
    }
  }, [searchParams]);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
  const materials = useMemo(() => ['All', ...new Set(products.map(p => p.material).filter(Boolean))], [products]);
  const colors = useMemo(() => {
    const colorMap = new Map();
    products.forEach(p => {
      if (p.color && p.colorHex) {
        colorMap.set(p.color, p.colorHex);
      }
    });
    return Array.from(colorMap.entries());
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.subcategory || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesMaterial = activeMaterial === 'All' || p.material === activeMaterial;
      const matchesColor = activeColor === 'All' || p.color === activeColor;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesRoom = !activeRoom || (p.rooms || []).includes(activeRoom);
      
      return matchesSearch && matchesCategory && matchesMaterial && matchesColor && matchesPrice && matchesRoom;
    });
  }, [products, searchQuery, activeCategory, activeMaterial, activeColor, priceRange, activeRoom]);

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
      className="pb-24 relative min-h-screen bg-[#fcfcfc]"
      style={{ position: 'relative' }}
    >
      {grainOverlay}
      
      <ParallaxHeader 
        image="https://images.unsplash.com/photo-1706971761998-110526d59a57?auto=format&fit=crop&q=80&w=2000"
        title="The Shop"
        subtitle="Curated Collection • Est. 2026"
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 mt-16">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            
            {/* Active room filter badge */}
            {activeRoom && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Showing:</span>
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-full">
                  <span className="text-[10px] uppercase tracking-widest font-bold">{activeRoom.replace(/-/g, ' ')}</span>
                  <button onClick={() => setActiveRoom(null)} className="ml-1 hover:text-neutral-300 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 ml-auto">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Network Mode</span>
                <button 
                  onClick={() => setIsLowBandwidth(!isLowBandwidth)}
                  className={`flex items-center gap-3 px-4 py-2 border rounded-full transition-all duration-500 ${isLowBandwidth ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-600'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${isLowBandwidth ? 'bg-green-400' : 'bg-neutral-300'} animate-pulse`} />
                  <span className="text-[10px] uppercase tracking-tighter font-bold">{isLowBandwidth ? 'Low Bandwidth Active' : 'High Performance'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-neutral-100 py-6">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-all duration-500">
                  <SlidersHorizontal className="w-4 h-4 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold">Filter & Sort</span>
              </button>
              
              <div className="hidden lg:flex items-center gap-4">
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                      activeCategory === cat ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              <input 
                type="text" 
                placeholder="Find a masterpiece..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-neutral-50 rounded-full border-none text-xs tracking-widest focus:ring-1 focus:ring-neutral-900 outline-none placeholder:text-neutral-300 transition-all"
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 relative" style={{ position: 'relative' }}>
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-neutral-100 animate-pulse rounded-sm" />
                  <div className="h-4 w-2/3 bg-neutral-100 animate-pulse" />
                  <div className="h-4 w-1/3 bg-neutral-100 animate-pulse" />
                </div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                >
                  <ProductCard 
                    {...product} 
                    onAddToCart={() => onAddToCart(product)} 
                    onToggleWishlist={() => onToggleWishlist(product)}
                    onQuickView={() => onQuickView(product)}
                    isWishlisted={wishlistItems.some(item => item.id === product.id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center">
                <p className="text-neutral-400 font-serif italic text-2xl tracking-tight">No pieces match your current selection.</p>
                <button 
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveMaterial('All');
                    setActiveColor('All');
                    setPriceRange([0, 50000]);
                    setSearchQuery('');
                  }}
                  className="mt-8 text-[10px] uppercase tracking-[0.3em] underline underline-offset-8 text-neutral-900 font-bold"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar Filter Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[120] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-serif tracking-tight">Refine Selection</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-all duration-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-12">
                {/* Categories */}
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-6 font-bold">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                          activeCategory === cat ? 'bg-neutral-900 border-neutral-900 text-white font-bold' : 'border-neutral-100 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-6 font-bold">Materiality</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {materials.map(mat => (
                      <button
                        key={mat}
                        onClick={() => setActiveMaterial(mat)}
                        className={`px-4 py-3 text-[10px] uppercase tracking-widest border flex items-center justify-between transition-all ${
                          activeMaterial === mat ? 'bg-neutral-50 border-neutral-900 text-neutral-900 font-bold' : 'border-neutral-100 text-neutral-500 hover:border-neutral-200'
                        }`}
                      >
                        {mat}
                        {activeMaterial === mat && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-6 font-bold">Color Palette</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setActiveColor('All')}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-[8px] uppercase font-bold transition-all ${
                        activeColor === 'All' ? 'border-neutral-900 scale-110' : 'border-transparent'
                      }`}
                    >
                      All
                    </button>
                    {colors.map(([name, hex]) => (
                      <button
                        key={name}
                        onClick={() => setActiveColor(name)}
                        title={name}
                        className={`relative w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                          activeColor === name ? 'border-neutral-900 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: hex as string }}
                      >
                        {activeColor === name && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-4 h-4 ${['White', 'Natural', 'Light Wood', 'Sage', 'Sand'].includes(name) ? 'text-neutral-900' : 'text-white'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-6 font-bold">Investment Range</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between text-xs font-medium text-neutral-600">
                      <span>R 0</span>
                      <span>R {priceRange[1].toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="50000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-neutral-900"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[5000, 10000, 20000, 50000].map(p => (
                        <button
                          key={p}
                          onClick={() => setPriceRange([0, p])}
                          className={`px-3 py-1.5 text-[9px] uppercase tracking-widest border rounded-full transition-all ${
                            priceRange[1] === p ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-neutral-100 text-neutral-400 hover:border-neutral-300'
                          }`}
                        >
                          Under R {p / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-neutral-100 flex gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex-1 bg-neutral-900 text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-colors"
                >
                  Show {filteredProducts.length} Pieces
                </button>
                <button 
                  onClick={() => {
                    setActiveCategory('All');
                    setActiveMaterial('All');
                    setActiveColor('All');
                    setPriceRange([0, 50000]);
                  }}
                  className="px-6 py-4 border border-neutral-100 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
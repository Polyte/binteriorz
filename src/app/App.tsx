import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router';
import { Toaster, toast } from 'sonner';
import { ThemeProvider, useTheme } from 'next-themes';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { Wishlist } from './components/Wishlist';
import { QuickView } from './components/QuickView';
import { BackToTop } from './components/BackToTop';
import { supabase } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { AnimatePresence, motion } from 'motion/react';
const logo = "/logo.png";

import { MobileBottomNav } from './components/MobileBottomNav';
import { CraftsmanshipStory } from './components/CraftsmanshipStory';
import { GlobalSearch } from './components/GlobalSearch';
import { CampaignBanner } from './components/CampaignBanner';
import { WhatsAppWidget } from './components/WhatsAppWidget';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { ThankYou } from './pages/ThankYou';
import { VendorApplication } from './pages/VendorApplication';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Account } from './pages/Account';
import { DynamicPage } from './pages/DynamicPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCraftsmanshipOpen, setIsCraftsmanshipOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [cartItems, setCartItems] = useState<any[]>(() => {
    const saved = localStorage.getItem('bi_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistItems, setWishlistItems] = useState<any[]>(() => {
    const saved = localStorage.getItem('bi_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [session, setSession] = useState<any>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  // Global Cmd+K / Ctrl+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('bi_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('bi_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const location = useLocation();

  const isAdminRoute = location.pathname === '/admin';

  useEffect(() => {
    if (!showPreloader) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const toggleWishlist = (product: any) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        toast.info(`${product.name} removed from wishlist`);
        return prev.filter(item => item.id !== product.id);
      }
      toast.success(`${product.name} saved to wishlist`);
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-710d82e2/products`, {
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch products: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        
        if (!Array.isArray(data) || data.length < 5) {
          console.log('Products missing or insufficient, seeding database...');
          const seedRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-710d82e2/seed`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${publicAnonKey}`,
              'apikey': publicAnonKey,
              'Content-Type': 'application/json'
            }
          });
          
          if (!seedRes.ok) console.warn('Seeding failed, using initial products');

          const reRes = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-710d82e2/products`, {
            headers: { 
              'Authorization': `Bearer ${publicAnonKey}`,
              'apikey': publicAnonKey
            }
          });
          
          if (reRes.ok) {
            const reData = await reRes.json();
            setProducts(Array.isArray(reData) ? reData : []);
          }
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.error('Critical: Failed to fetch products:', err);
        // Fallback to empty or dummy if absolutely necessary to prevent crash
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const timer = setTimeout(() => setShowPreloader(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to collection`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 relative overflow-x-hidden">
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-neutral-900 flex items-center justify-center overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
              <div className="w-32 h-32 mb-8 relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-neutral-700 rounded-full border-t-white"
                />
                <div className="absolute inset-2 bg-black rounded-full overflow-hidden p-4">
                  <img src={logo} alt="B-Interiors" className="w-full h-full object-contain" />
                </div>
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                <h2 className="text-white text-2xl font-serif tracking-[0.3em] uppercase mb-2">B-Interiors</h2>
                <div className="h-0.5 w-12 bg-white mx-auto" />
                <p className="text-neutral-500 text-[10px] uppercase tracking-[0.5em] mt-4">Alberton Est. 2026</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="page-transition"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[90] bg-neutral-900 flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 relative opacity-40">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-neutral-700 rounded-full border-t-white"
                />
                <div className="absolute inset-1 bg-black rounded-full overflow-hidden p-2">
                  <img src={logo} alt="" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollToTop />
      <BackToTop />
      <Toaster position="top-center" richColors theme={theme as 'light' | 'dark' | 'system'} />
      
      {/* Global Grain Overlay */}
      {!isAdminRoute && (
        <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      )}

      {!isAdminRoute && <CampaignBanner onVisibilityChange={setIsBannerVisible} />}

      {!isAdminRoute && (
        <Navbar 
          cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)} 
          wishlistCount={wishlistItems.length}
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          isAdmin={!!session}
          bannerVisible={isBannerVisible}
        />
      )}
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onRemove={removeFromCart}
        onClear={() => setCartItems([])}
      />

      <Wishlist
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemove={removeFromWishlist}
        onAddToCart={addToCart}
      />

      <QuickView
        isOpen={!!quickViewProduct}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        isWishlisted={quickViewProduct ? wishlistItems.some(item => item.id === quickViewProduct.id) : false}
      />

      <main className="relative z-10" style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home products={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlistItems={wishlistItems} />} />
            <Route path="/shop" element={<Shop products={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlistItems={wishlistItems} loading={loading} />} />
            <Route path="/product/:id" element={<ProductDetail products={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlistItems={wishlistItems} />} />
            <Route path="/checkout" element={<Checkout items={cartItems} total={cartItems.reduce((a, b) => a + (b.price * b.quantity), 0)} onClearCart={() => setCartItems([])} />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/become-a-partner" element={<VendorApplication />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/p/:slug" element={<DynamicPage />} />
            <Route path="*" element={<DynamicPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && (
        <MobileBottomNav
          onOpenStory={() => setIsCraftsmanshipOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
          wishlistCount={wishlistItems.length}
        />
      )}
      <CraftsmanshipStory isOpen={isCraftsmanshipOpen} onClose={() => setIsCraftsmanshipOpen(false)} />
      {!isAdminRoute && <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} products={products} />}
      {!isAdminRoute && <WhatsAppWidget />}
    </div>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <Router>
      <AppContent />
    </Router>
  </ThemeProvider>
);

export default App;
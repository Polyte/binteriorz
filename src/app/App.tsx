import React, { Suspense, lazy, useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router';
import { Toaster, toast } from 'sonner';
import { ThemeProvider, useTheme } from 'next-themes';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { Wishlist } from './components/Wishlist';
import { QuickView } from './components/QuickView';
import { BackToTop } from './components/BackToTop';
import { cloudflareAuth } from '../../utils/cloudflare/client';
import { AnimatePresence, motion } from 'motion/react';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CraftsmanshipStory } from './components/CraftsmanshipStory';
import { GlobalSearch } from './components/GlobalSearch';
import { CampaignBanner } from './components/CampaignBanner';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { PageMotion } from './components/PageMotion';
import { CompanyContentProvider, useCompanyContent } from './content/CompanyContentContext';
import { socialLink } from './content/company';
import { landingMetadata } from './content/landing';
import { DEFAULT_OG_IMAGE, FALLBACK_METADATA, PAGE_METADATA, absoluteUrl, businessJsonLd, productImage, productJsonLd, productMetadata } from './seo';
import { DEFAULT_HOMEPAGE_CONTENT, HomepageContent, normalizeHomepageContent } from './content/homepage';
import { bundledProductCatalogue, normalizeProducts, resolveProductCatalogue } from './data/productCatalogue';

const API = `/api`;

const RouteMetadata = ({ products }: { products: any[] }) => {
  const { pathname } = useLocation();
  const { contact } = useCompanyContent();
  useEffect(() => {
    if (document.documentElement.dataset.notFound === pathname) return; // the 404 view owns its metadata
    const productMatch = pathname.match(/^\/product\/([^/]+)/);
    const product = productMatch ? products.find((item) => item.id === decodeURIComponent(productMatch[1])) : null;
    const metadata = product
      ? productMetadata(product)
      : PAGE_METADATA[pathname] ?? landingMetadata(pathname) ?? { ...FALLBACK_METADATA, noIndex: /^\/(p|shop|services)\//.test(pathname) };
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        const [, key, name] = selector.match(/\[(name|property)="([^"]+)"\]/) || [];
        if (key && name) element.setAttribute(key, name);
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };
    const url = absoluteUrl(pathname);
    const image = absoluteUrl(product ? productImage(product) : DEFAULT_OG_IMAGE);
    document.title = metadata.title;
    setMeta('meta[name="description"]', 'content', metadata.description);
    setMeta('meta[name="keywords"]', 'content', metadata.keywords);
    setMeta('meta[name="robots"]', 'content', metadata.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('meta[property="og:title"]', 'content', metadata.title);
    setMeta('meta[property="og:description"]', 'content', metadata.description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', product ? 'product' : 'website');
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[name="twitter:title"]', 'content', metadata.title);
    setMeta('meta[name="twitter:description"]', 'content', metadata.description);
    setMeta('meta[name="twitter:image"]', 'content', image);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;

    // Structured data: the business (with the contact details published in the admin) plus the product, if any.
    const sameAs = [
      socialLink(contact.instagram, 'https://www.instagram.com/'),
      socialLink(contact.tiktok, 'https://www.tiktok.com/@'),
      socialLink(contact.facebook, 'https://www.facebook.com/'),
    ].filter(Boolean);
    const jsonLd = [businessJsonLd({ phone: contact.phone, whatsapp: contact.whatsapp, email: contact.email, sameAs }), ...(product ? productJsonLd(product) : [])];
    let script = document.getElementById('seo-jsonld');
    if (!script) { script = document.createElement('script'); script.id = 'seo-jsonld'; script.setAttribute('type', 'application/ld+json'); document.head.appendChild(script); }
    script.textContent = JSON.stringify(jsonLd);
  }, [pathname, products, contact]);
  return null;
};

// Pages
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Shop = lazy(() => import('./pages/Shop').then((module) => ({ default: module.Shop })));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail').then((module) => ({ default: module.ServiceDetail })));
const Services = lazy(() => import('./pages/Services').then((module) => ({ default: module.Services })));
const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })));
const Contact = lazy(() => import('./pages/Contact').then((module) => ({ default: module.Contact })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((module) => ({ default: module.ProductDetail })));
const Checkout = lazy(() => import('./pages/Checkout').then((module) => ({ default: module.Checkout })));
const ThankYou = lazy(() => import('./pages/ThankYou').then((module) => ({ default: module.ThankYou })));
const VendorApplication = lazy(() => import('./pages/VendorApplication').then((module) => ({ default: module.VendorApplication })));
const Admin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.Admin })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Account = lazy(() => import('./pages/Account').then((module) => ({ default: module.Account })));
const DynamicPage = lazy(() => import('./pages/DynamicPage').then((module) => ({ default: module.DynamicPage })));

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 500);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const AppContent = () => {
  const { theme } = useTheme();
  const [products, setProducts] = useState<any[]>(bundledProductCatalogue);
  const productChannelRef = useRef<BroadcastChannel | null>(null);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [loading, setLoading] = useState(false);
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

  const syncProducts = useCallback((nextProducts: any[], broadcast = false) => {
    const normalized = normalizeProducts(nextProducts);
    setProducts(normalized);
    if (broadcast) productChannelRef.current?.postMessage(normalized);
  }, []);

  const handleAdminProductsChange = useCallback((nextProducts: any[]) => {
    syncProducts(nextProducts, true);
  }, [syncProducts]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('b-interiors-product-catalogue');
    productChannelRef.current = channel;
    channel.onmessage = (event) => {
      if (Array.isArray(event.data)) syncProducts(event.data);
    };
    return () => {
      productChannelRef.current = null;
      channel.close();
    };
  }, [syncProducts]);

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
    cloudflareAuth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = cloudflareAuth.onAuthStateChange((_event, session) => {
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
    let active = true;
    setLoading(true);
    fetch(`${API}/products`, {
      headers: { },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalogue request failed');
        return {
          data: await response.json(),
          version: response.headers.get('X-Product-Catalogue-Version'),
        };
      })
      .then(({ data, version }) => {
        if (!active) return;
        syncProducts(resolveProductCatalogue(data, version));
      })
      .catch(() => { if (active) syncProducts(bundledProductCatalogue); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [syncProducts]);

  useEffect(() => {
    let active = true;
    fetch(`${API}/homepage-content`, {
      headers: { },
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data) setHomepageContent(normalizeHomepageContent(data)); })
      .catch(() => { /* Built-in homepage content remains available offline. */ });
    return () => { active = false; };
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
      <ScrollToTop />
      <RouteMetadata products={products} />
      <BackToTop />
      <Toaster position="top-center" richColors theme={theme as 'light' | 'dark' | 'system'} />
      
      {/* Global Grain Overlay */}
      {!isAdminRoute && <CampaignBanner onVisibilityChange={setIsBannerVisible} />}

      {!isAdminRoute && (
        <Navbar 
          products={products}
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
          <Suspense fallback={<div className="min-h-[60vh]" aria-label="Loading page" />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageMotion><Home products={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlistItems={wishlistItems} homepageContent={homepageContent} /></PageMotion>} />
            <Route path="/shop" element={<PageMotion><Shop products={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlistItems={wishlistItems} loading={loading} /></PageMotion>} />
            <Route path="/shop/:category" element={<PageMotion><Shop products={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlistItems={wishlistItems} loading={loading} /></PageMotion>} />
            <Route path="/product/:id" element={<PageMotion><ProductDetail products={products} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} wishlistItems={wishlistItems} /></PageMotion>} />
            <Route path="/checkout" element={<PageMotion><Checkout items={cartItems} total={cartItems.reduce((a, b) => a + (b.price * b.quantity), 0)} onClearCart={() => setCartItems([])} /></PageMotion>} />
            <Route path="/thank-you" element={<PageMotion><ThankYou /></PageMotion>} />
            <Route path="/services" element={<PageMotion><Services /></PageMotion>} />
            <Route path="/services/:slug" element={<PageMotion><ServiceDetail products={products} /></PageMotion>} />
            <Route path="/about" element={<PageMotion><About /></PageMotion>} />
            <Route path="/contact" element={<PageMotion><Contact /></PageMotion>} />
            <Route path="/become-a-partner" element={<PageMotion><VendorApplication /></PageMotion>} />
            <Route path="/admin" element={<Admin products={products} onProductsChange={handleAdminProductsChange} />} />
            <Route path="/login" element={<PageMotion><Login /></PageMotion>} />
            <Route path="/account" element={<PageMotion><Account /></PageMotion>} />
            <Route path="/p/:slug" element={<PageMotion><DynamicPage /></PageMotion>} />
            <Route path="*" element={<PageMotion><DynamicPage /></PageMotion>} />
          </Routes>
          </Suspense>
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
      <CompanyContentProvider>
        <AppContent />
      </CompanyContentProvider>
    </Router>
  </ThemeProvider>
);

export default App;

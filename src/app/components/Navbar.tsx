import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Menu, X, ChevronDown, Heart, Sun, Moon, Sparkles, User, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import { MegaMenu } from './MegaMenu';
import { prefetch } from '../utils/prefetch';
const logo = "/logo.png";

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop', hasMega: true },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

interface NavbarProps {
  products: any[];
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch?: () => void;
  isAdmin?: boolean;
  bannerVisible?: boolean;
}

export const Navbar = ({ products, cartCount, wishlistCount, onOpenCart, onOpenWishlist, onOpenSearch, isAdmin, bannerVisible }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled && !isOpen && !isMegaMenuOpen;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleMouseEnter = (link: any) => {
    prefetch(link.href);
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    if (link.hasMega) setIsMegaMenuOpen(true);
    else setIsMegaMenuOpen(false);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav 
      className={`fixed left-0 right-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${
        isTransparent 
          ? 'bg-transparent border-b border-white/25'
          : 'bg-sky-50/25 dark:bg-slate-900/20 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/35 dark:border-white/15 shadow-[0_12px_40px_-24px_rgba(12,30,45,.5)]'
      }`}
      style={{ top: bannerVisible ? 'var(--banner-height, 44px)' : '0px' }}
      onMouseLeave={handleMouseLeave}
    >
      {!isTransparent && <div aria-hidden="true" className="nav-glass-sheen pointer-events-none absolute inset-0 z-0 overflow-hidden" />}
      <div className="relative z-10 max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`flex justify-between items-center transition-[height] duration-500 ${isScrolled ? 'h-[4.5rem]' : 'h-24'}`}>
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="group flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl ${
                isTransparent 
                  ? 'bg-white border-white/20' 
                  : 'bg-black dark:bg-white border-neutral-800 dark:border-neutral-200'
              }`}>
                <img src={logo} alt="B-Interiors" className={`w-full h-full object-contain ${!isTransparent ? 'dark:invert' : ''}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-serif font-bold tracking-[0.2em] leading-none transition-colors duration-500 ${
                  isTransparent ? 'text-white' : 'text-neutral-900 dark:text-white'
                }`}>B-INTERIORS</span>
                <span className={`text-[7px] uppercase tracking-[0.4em] font-bold mt-1.5 transition-colors duration-500 ${
                  isTransparent ? 'text-white/60' : 'text-neutral-400 dark:text-neutral-500'
                }`}>Studio Alberton</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10 h-full">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative flex items-center h-full group/nav"
                onMouseEnter={() => handleMouseEnter(link)}
              >
                <Link
                  to={link.href}
                  className={`text-[9px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-2 py-4 relative ${
                    isTransparent
                      ? isActive(link.href)
                        ? 'text-white font-bold'
                        : 'text-white/60 hover:text-white'
                      : isActive(link.href)
                        ? 'text-neutral-900 dark:text-white font-bold'
                        : 'text-[#b0862f] hover:text-[#d4af37] dark:text-[#d4af37] dark:hover:text-[#f3d873]'
                  } ${isScrolled ? '[text-shadow:0_1px_1px_rgba(255,255,255,.85),0_2px_6px_rgba(41,30,12,.32)] dark:[text-shadow:0_2px_7px_rgba(0,0,0,.8)]' : ''}`}
                >
                  {link.name}
                  {link.isNew && (
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" 
                    />
                  )}
                  {link.hasMega && (
                    <ChevronDown 
                      className={`w-3 h-3 transition-transform duration-500 ${
                        isMegaMenuOpen 
                          ? 'rotate-180 ' + (isTransparent ? 'text-white' : 'text-neutral-900 dark:text-white') 
                          : (isTransparent ? 'text-white/40' : 'text-neutral-300')
                      }`} 
                    />
                  )}
                </Link>
                {isActive(link.href) && (
                  <motion.div 
                    layoutId="navActiveLine"
                    className={`absolute bottom-6 left-0 right-0 h-[1px] ${
                      isTransparent ? 'bg-white' : 'bg-neutral-900 dark:bg-white'
                    }`} 
                  />
                )}
              </div>
            ))}

            {isAdmin && (
              <div className="relative flex items-center h-full group/nav">
                <Link
                  to="/admin"
                  className={`text-[9px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center gap-2 py-4 relative border px-3 rounded-full ${
                    isTransparent
                      ? 'text-white border-white/20 hover:bg-white/10'
                      : 'text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  } ${isScrolled ? '[text-shadow:0_1px_1px_rgba(255,255,255,.85),0_2px_6px_rgba(41,30,12,.3)] dark:[text-shadow:0_2px_7px_rgba(0,0,0,.8)]' : ''}`}
                >
                  Console
                </Link>
              </div>
            )}
            
            <div className={`flex items-center space-x-3 ml-8 pl-8 border-l transition-colors duration-500 ${
              isTransparent ? 'border-white/10' : 'border-neutral-100 dark:border-neutral-800'
            }`}>
              {/* Account Link */}
              <Link
                to="/account"
                className={`p-2.5 rounded-full transition-all group ${
                  isTransparent ? 'hover:bg-white/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <User className={`w-4 h-4 transition-colors ${
                  isActive('/account')
                    ? (isTransparent ? 'text-white' : 'text-neutral-900 dark:text-white')
                    : (isTransparent ? 'text-white/60 group-hover:text-white' : 'text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white')
                }`} />
              </Link>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-2.5 rounded-full transition-all group relative overflow-hidden ${
                  isTransparent ? 'hover:bg-white/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <AnimatePresence mode="wait">
                  {mounted && theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                    >
                      <Sun className={`w-4 h-4 transition-colors ${isTransparent ? 'text-white/60 group-hover:text-white' : 'text-neutral-400 group-hover:text-white'}`} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                    >
                      <Moon className={`w-4 h-4 transition-colors ${isTransparent ? 'text-white/60 group-hover:text-white' : 'text-neutral-400 group-hover:text-neutral-900'}`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {onOpenSearch && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onOpenSearch}
                  className={`p-2.5 rounded-full transition-all group ${
                    isTransparent ? 'hover:bg-white/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }`}
                >
                  <Search className={`w-4 h-4 transition-colors ${isTransparent ? 'text-white/60 group-hover:text-white' : 'text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'}`} />
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.9, rotate: wishlistCount > 0 ? -15 : 15 }}
                onClick={onOpenWishlist}
                className={`p-2.5 rounded-full transition-all relative group ${
                  isTransparent ? 'hover:bg-white/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <Heart className={`w-4 h-4 transition-colors ${
                  wishlistCount > 0 
                    ? 'text-rose-500 fill-rose-500' 
                    : (isTransparent ? 'text-white/60 group-hover:text-white' : 'text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white')
                }`} />
                {wishlistCount > 0 && (
                  <span className={`absolute top-1 right-1 w-3 h-3 flex items-center justify-center rounded-full ring-2 text-[6px] font-bold ${
                    isTransparent 
                      ? 'bg-white text-black ring-black/20' 
                      : 'bg-neutral-900 dark:bg-white text-white dark:text-black ring-white dark:ring-neutral-950'
                  }`}>
                    {wishlistCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9, y: 2 }}
                onClick={onOpenCart}
                className={`p-2.5 rounded-full transition-all relative group flex items-center gap-3 px-5 hover:pr-7 duration-500 ${
                  isTransparent 
                    ? 'bg-white text-black hover:bg-neutral-100' 
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">{cartCount > 0 ? cartCount : 'Empty'}</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center space-x-2">
             <button onClick={toggleTheme} className={`p-2 transition-colors ${isTransparent ? 'text-white/60' : 'text-neutral-400'}`}>
               {mounted && theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md focus:outline-none transition-colors ${
                isTransparent 
                  ? 'text-white' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mega Menu Overlay */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <MegaMenu 
            isOpen={isMegaMenuOpen} 
            onClose={() => setIsMegaMenuOpen(false)} 
            products={products}
          />
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed top-0 right-0 bottom-0 z-[110] w-full max-w-sm bg-white dark:bg-neutral-950 shadow-2xl overflow-y-auto overscroll-contain"
            >
              {/* Close button */}
              <div className="flex justify-end p-6">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                </motion.button>
              </div>

              <div className="px-8 pb-32 space-y-1">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 transition-colors ${
                        isActive(link.href)
                          ? 'text-neutral-900 dark:text-white'
                          : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-2xl font-serif">{link.name}</span>
                      {isActive(link.href) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                      )}
                    </Link>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + navLinks.length * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to="/account"
                    className={`flex items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 transition-colors ${
                      isActive('/account')
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-2xl font-serif">Account</span>
                    {isActive('/account') && (
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                    )}
                  </Link>
                </motion.div>

                {isAdmin && (
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + (navLinks.length + 1) * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to="/admin"
                      className={`flex items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-800 transition-colors ${
                        isActive('/admin')
                          ? 'text-neutral-900 dark:text-white'
                          : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="text-2xl font-serif">Console</span>
                      <span className="text-[8px] uppercase tracking-[0.2em] font-bold border border-neutral-200 dark:border-neutral-800 px-2 py-1 rounded-full text-neutral-400">Admin</span>
                    </Link>
                  </motion.div>
                )}

                {/* Quick actions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="pt-8 flex gap-3"
                >
                  {onOpenSearch && (
                    <button
                      onClick={() => { setIsOpen(false); setTimeout(() => onOpenSearch?.(), 300); }}
                      className="flex-1 flex items-center justify-center gap-2 py-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <Search className="w-4 h-4 text-neutral-400" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-500">Search</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setIsOpen(false); setTimeout(() => onOpenWishlist(), 300); }}
                    className="flex-1 flex items-center justify-center gap-2 py-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors relative"
                  >
                    <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-neutral-400'}`} />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-500">
                      Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                    </span>
                  </button>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="pt-3"
                >
                  <button
                    onClick={() => { setIsOpen(false); setTimeout(() => onOpenCart(), 300); }}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
                      {cartCount > 0 ? `View Bag (${cartCount})` : 'Your Bag is Empty'}
                    </span>
                  </button>
                </motion.div>

                {/* Footer info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="pt-10 border-t border-neutral-100 dark:border-neutral-800 mt-8 space-y-3"
                >
                  <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 font-bold">Studio Enquiries</p>
                  <p className="text-sm font-serif italic text-neutral-500 dark:text-neutral-400">studio@b-interiors.com</p>
                  <div className="flex items-center gap-2 pt-2">
                    <Sparkles className="w-3 h-3 text-neutral-300" />
                    <span className="text-[8px] uppercase tracking-widest text-neutral-300">Alberton, Gauteng</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

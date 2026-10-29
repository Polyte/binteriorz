import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, Heart, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router';
const logo = "/logo.png";

interface MobileBottomNavProps {
  onOpenStory?: () => void;
  onOpenSearch?: () => void;
  onOpenWishlist?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

export const MobileBottomNav = ({
  onOpenStory,
  onOpenSearch,
  onOpenWishlist,
  onOpenCart,
  cartCount = 0,
  wishlistCount = 0,
}: MobileBottomNavProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-100 dark:border-neutral-800 z-[100] md:hidden"
    >
      <div className="flex justify-around items-center px-2 pt-2 pb-1 relative">
        {/* Home */}
        <Link to="/" className="flex-1">
          <NavButton
            icon={<Home className="w-[18px] h-[18px]" />}
            label="Home"
            active={isActive('/')}
          />
        </Link>

        {/* Search */}
        <button onClick={onOpenSearch} className="flex-1">
          <NavButton
            icon={<Search className="w-[18px] h-[18px]" />}
            label="Search"
            active={false}
          />
        </button>

        {/* Central Artisan Badge */}
        <div className="relative flex-1 flex justify-center">
          <div className="relative -mt-7">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onOpenStory}
              aria-label="Our craftsmanship story"
              className="w-14 h-14 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-950 shadow-xl cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 dark:border-neutral-800">
                <img src={logo} alt="" className="w-full h-full object-contain dark:invert" />
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-white/10 dark:border-neutral-700"
              />
            </motion.button>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-[0.15em] font-bold text-neutral-900 dark:text-white whitespace-nowrap">
              Artisan
            </span>
          </div>
        </div>

        {/* Wishlist */}
        <button onClick={onOpenWishlist} className="flex-1">
          <NavButton
            icon={
              <div className="relative">
                <Heart className={`w-[18px] h-[18px] ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[7px] font-bold px-0.5">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </div>
            }
            label="Wishlist"
            active={wishlistCount > 0}
          />
        </button>

        {/* Cart */}
        <button onClick={onOpenCart} className="flex-1">
          <NavButton
            icon={
              <div className="relative">
                <ShoppingBag className="w-[18px] h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black text-[7px] font-bold px-0.5">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
            }
            label="Cart"
            active={cartCount > 0}
          />
        </button>
      </div>

      {/* Safe area spacing for notched devices */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </motion.div>
  );
};

const NavButton = ({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => (
  <div className="flex flex-col items-center gap-0.5 py-1">
    <div className={`p-1 transition-colors ${active ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}>
      {icon}
    </div>
    <span className={`text-[8px] uppercase tracking-[0.1em] font-bold transition-colors ${active ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}`}>
      {label}
    </span>
  </div>
);

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { Gift, X, Heart, Star, ArrowRight, Sparkles } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: 'heart' | 'star' | 'gift' | 'sparkles';
}

interface CampaignBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

// Floating sparkle particle
const Particle = ({ delay, campaign }: { delay: number; campaign: Campaign }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDuration = useMemo(() => 3 + Math.random() * 4, []);
  const randomSize = useMemo(() => 2 + Math.random() * 3, []);

  return (
    <motion.div
      className="absolute rounded-full bg-white pointer-events-none"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${randomX}%`,
        top: '50%',
      }}
      initial={{ opacity: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0],
        y: [0, -20, -30, -40],
        scale: [0, 1, 0.8, 0],
      }}
      transition={{
        duration: randomDuration,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 1 + Math.random() * 3,
        ease: 'easeOut',
      }}
    />
  );
};

// Campaign-specific animated icon
const AnimatedIcon = ({ type }: { type: Campaign['icon'] }) => {
  const iconClass = 'w-4 h-4';

  if (type === 'heart') {
    return (
      <motion.div
        animate={{
          scale: [1, 1.25, 1, 1.15, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: 'easeInOut',
        }}
      >
        <Heart className={`${iconClass} fill-current drop-shadow-lg`} />
      </motion.div>
    );
  }

  if (type === 'star') {
    return (
      <motion.div
        animate={{
          rotate: [0, 15, -15, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
      >
        <Star className={`${iconClass} fill-current drop-shadow-lg`} />
      </motion.div>
    );
  }

  if (type === 'gift') {
    return (
      <motion.div
        animate={{
          y: [0, -4, 0],
          rotate: [0, -5, 5, -3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 2.5,
          ease: 'easeInOut',
        }}
      >
        <Gift className={`${iconClass} drop-shadow-lg`} />
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{
        rotate: [0, 180, 360],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <Sparkles className={`${iconClass} drop-shadow-lg`} />
    </motion.div>
  );
};

export const CampaignBanner = ({ onVisibilityChange }: CampaignBannerProps) => {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const bannerElRef = useRef<HTMLDivElement>(null);
  const shimmerX = useMotionValue(-100);

  // Periodic shimmer sweep
  useEffect(() => {
    if (!activeCampaign || !isVisible) return;

    const runShimmer = () => {
      animate(shimmerX, [-100, 200], {
        duration: 2.5,
        ease: [0.25, 0.1, 0.25, 1],
      });
    };

    // Initial shimmer after entrance
    const initialTimeout = setTimeout(runShimmer, 1200);
    // Repeating shimmer
    const interval = setInterval(runShimmer, 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [activeCampaign, isVisible, shimmerX]);

  const shimmerGradient = useTransform(
    shimmerX,
    (x) =>
      `linear-gradient(105deg, transparent ${x - 30}%, rgba(255,255,255,0.12) ${x - 10}%, rgba(255,255,255,0.25) ${x}%, rgba(255,255,255,0.12) ${x + 10}%, transparent ${x + 30}%)`
  );

  useEffect(() => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    if (month === 2 && day <= 15) {
      setActiveCampaign({
        id: 'valentines',
        title: 'Share the Love',
        subtitle: '15% Off all Bedroom & Decor sets this Valentine\u2019s season.',
        color: 'bg-rose-600',
        gradientFrom: 'from-rose-700',
        gradientTo: 'to-pink-500',
        icon: 'heart',
      });
    } else if (month === 12 && day <= 26) {
      setActiveCampaign({
        id: 'christmas',
        title: 'A B Interior Designz Christmas',
        subtitle: 'Gift elegance this year. Free delivery in Alberton on all orders.',
        color: 'bg-emerald-800',
        gradientFrom: 'from-emerald-800',
        gradientTo: 'to-green-600',
        icon: 'star',
      });
    } else if ((month === 12 && day >= 27) || (month === 1 && day <= 10)) {
      setActiveCampaign({
        id: 'newyear',
        title: 'New Year, New Space',
        subtitle: 'Kickstart 2026 with a boardroom makeover. Corporate specials inside.',
        color: 'bg-neutral-900',
        gradientFrom: 'from-neutral-900',
        gradientTo: 'to-neutral-700',
        icon: 'gift',
      });
    } else {
      setActiveCampaign({
        id: 'standard',
        title: 'Autumn Refresh',
        subtitle: 'Transform your living space with our new walnut collection.',
        color: 'bg-amber-800',
        gradientFrom: 'from-amber-800',
        gradientTo: 'to-orange-600',
        icon: 'sparkles',
      });
    }
  }, []);

  // Notify parent and set CSS variable for banner height
  useEffect(() => {
    const visible = !!(activeCampaign && isVisible);
    onVisibilityChange?.(visible);
    if (!visible) {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
  }, [activeCampaign, isVisible, onVisibilityChange]);

  const measureBanner = useCallback(() => {
    if (bannerElRef.current) {
      const h = bannerElRef.current.offsetHeight;
      document.documentElement.style.setProperty('--banner-height', `${h}px`);
    }
  }, []);

  useEffect(() => {
    if (!activeCampaign || !isVisible) return;
    const raf = requestAnimationFrame(() => measureBanner());
    window.addEventListener('resize', measureBanner);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measureBanner);
    };
  }, [activeCampaign, isVisible, measureBanner]);

  // Generate particles
  const particles = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i),
    []
  );

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.setProperty('--banner-height', '0px');
      }}
    >
      {activeCampaign && isVisible && (
        <motion.div
          ref={bannerElRef}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            height: 0,
            opacity: 0,
            paddingTop: 0,
            paddingBottom: 0,
            y: -10,
          }}
          transition={{ duration: 0.6, ease }}
          onAnimationComplete={measureBanner}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="campaign-gold-bar text-[#241700] py-1.5 px-4 fixed top-0 left-0 right-0 z-[60] overflow-hidden"
        >
          {/* Animated shimmer overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: shimmerGradient }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((i) => (
              <Particle key={i} delay={i * 0.7} campaign={activeCampaign} />
            ))}
          </div>

          {/* Animated top edge glow */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Content */}
          <div className="max-w-[1480px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center relative z-10">
            {/* Icon + Title group */}
            <motion.div
              className="flex items-center gap-2.5"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease }}
            >
              <AnimatedIcon type={activeCampaign.icon} />

              {/* Animated separator dot */}
              <motion.span
                className="w-1 h-1 rounded-full bg-[#3b2600]/40 hidden sm:block"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs whitespace-nowrap [text-shadow:0_1px_0_rgba(255,255,255,0.45)]">
                {activeCampaign.title}
              </span>
            </motion.div>

            {/* Animated vertical divider */}
            <motion.div
              className="hidden sm:block w-[1px] h-4 bg-[#3b2600]/25"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5, duration: 0.4, ease }}
            />

            {/* Subtitle with typewriter-style fade */}
            <motion.p
              className="text-[11px] sm:text-sm font-semibold text-[#2d1c00]/85 max-w-md"
              initial={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.5, duration: 0.7, ease }}
            >
              {activeCampaign.subtitle}
            </motion.p>

            {/* CTA button with hover animation */}
            <motion.button
              className="group relative text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 px-4 py-1 rounded-full bg-black/10 backdrop-blur-sm border border-black/15 hover:bg-black/15 transition-colors duration-300"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5, ease }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Shop Now</span>
              <motion.span
                className="inline-flex"
                animate={{ x: isHovered ? [0, 3, 0] : 0 }}
                transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-3 h-3" />
              </motion.span>

              {/* Button shimmer on hover */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </motion.button>
          </div>

          {/* Animated bottom edge glow */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 80%, transparent 100%)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Close button */}
          <motion.button
            onClick={() => setIsVisible(false)}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/15 transition-all duration-300 group/close"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1, duration: 0.4, ease }}
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.85 }}
          >
            <X className="w-3.5 h-3.5 transition-transform duration-200" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

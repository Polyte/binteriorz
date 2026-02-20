import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Check, Link2, Mail, X } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

const ease = [0.22, 1, 0.36, 1] as const;

// Brand SVG icons (small, inline)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
  </svg>
);

interface SharePlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverBg: string;
  getUrl: (url: string, text: string, image?: string) => string;
}

const platforms: SharePlatform[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <WhatsAppIcon />,
    color: 'text-[#25D366]',
    hoverBg: 'hover:bg-[#25D366]/10',
    getUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <FacebookIcon />,
    color: 'text-[#1877F2]',
    hoverBg: 'hover:bg-[#1877F2]/10',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    name: 'X',
    icon: <XTwitterIcon />,
    color: 'text-neutral-900 dark:text-white',
    hoverBg: 'hover:bg-neutral-100 dark:hover:bg-white/10',
    getUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: <PinterestIcon />,
    color: 'text-[#E60023]',
    hoverBg: 'hover:bg-[#E60023]/10',
    getUrl: (url, text, image) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image || '')}&description=${encodeURIComponent(text)}`,
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="w-4 h-4" />,
    color: 'text-neutral-600',
    hoverBg: 'hover:bg-neutral-100 dark:hover:bg-white/10',
    getUrl: (url, text) => `mailto:?subject=${encodeURIComponent(`B-Interiors: ${text}`)}&body=${encodeURIComponent(`${text}\n\nView it here: ${url}`)}`,
  },
];

interface ShareMenuProps {
  productName: string;
  productId?: string;
  productImage?: string;
  /** 'light' for white bg, 'dark' for dark bg contexts like the lightbox */
  variant?: 'light' | 'dark';
  /** Override the share URL */
  shareUrl?: string;
  /** Compact mode renders an icon-only trigger */
  compact?: boolean;
  /** Custom trigger element */
  children?: React.ReactNode;
}

export const ShareMenu = ({
  productName,
  productId,
  productImage,
  variant = 'light',
  shareUrl,
  compact = false,
  children,
}: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const url = shareUrl || (productId ? `${window.location.origin}/product/${productId}` : window.location.href);
  const shareText = `Discover ${productName} — handcrafted luxury by B-Interiors`;

  const isDark = variant === 'dark';

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const handleShare = useCallback((platform: SharePlatform) => {
    const shareLink = platform.getUrl(url, shareText, productImage);
    window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=500');
    setIsOpen(false);
    toast.success(`Shared via ${platform.name}`);
  }, [url, shareText, productImage]);

  const handleCopyLink = useCallback(async () => {
    const success = await copyToClipboard(url, productName);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url, productName]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `B-Interiors: ${productName}`,
          text: shareText,
          url,
        });
        setIsOpen(false);
      } catch {
        // User cancelled
      }
    }
  }, [productName, shareText, url]);

  // Popover positioning
  const [menuPos, setMenuPos] = useState<'bottom' | 'top'>('bottom');
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuPos(spaceBelow < 360 ? 'top' : 'bottom');
    }
  }, [isOpen]);

  return (
    <div className="relative inline-flex">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={
          compact
            ? `p-4 md:p-5 border rounded-none flex items-center justify-center transition-all duration-300 ${
                isDark
                  ? 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
                  : 'border-neutral-200 hover:border-neutral-900'
              }`
            : `flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                isDark
                  ? 'text-white/50 hover:text-white'
                  : 'text-neutral-400 hover:text-neutral-900'
              }`
        }
      >
        {children || (
          <>
            <Share2 className={compact ? 'w-5 h-5' : 'w-4 h-4'} />
            {!compact && 'Share'}
          </>
        )}
      </button>

      {/* Menu popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: menuPos === 'bottom' ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: menuPos === 'bottom' ? -8 : 8 }}
            transition={{ duration: 0.25, ease }}
            className={`absolute z-[300] w-72 rounded-2xl shadow-2xl overflow-hidden ${
              menuPos === 'bottom' ? 'top-full mt-3' : 'bottom-full mb-3'
            } right-0 ${
              isDark
                ? 'bg-neutral-900 border border-white/10'
                : 'bg-white border border-neutral-100'
            }`}
            style={{ boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.12)' }}
          >
            {/* Header */}
            <div className={`px-5 pt-5 pb-3 flex items-center justify-between ${
              isDark ? 'border-b border-white/5' : 'border-b border-neutral-50'
            }`}>
              <span className={`text-[9px] uppercase tracking-[0.4em] font-bold ${
                isDark ? 'text-white/30' : 'text-neutral-400'
              }`}>
                Share This Piece
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-neutral-100 text-neutral-400'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Social platforms */}
            <div className="px-3 py-3 space-y-0.5">
              {platforms.map((platform, i) => (
                <motion.button
                  key={platform.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2, ease }}
                  onClick={() => handleShare(platform)}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${
                    isDark ? 'hover:bg-white/5' : platform.hoverBg
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isDark
                      ? 'bg-white/5 group-hover:bg-white/10'
                      : 'bg-neutral-50 group-hover:bg-white group-hover:shadow-sm'
                  } ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <span className={`text-xs font-semibold tracking-wide ${
                    isDark ? 'text-white/70 group-hover:text-white' : 'text-neutral-700 group-hover:text-neutral-900'
                  }`}>
                    {platform.name}
                  </span>
                  <div className={`ml-auto text-[8px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark ? 'text-white/30' : 'text-neutral-300'
                  }`}>
                    Open
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className={`mx-5 ${isDark ? 'border-t border-white/5' : 'border-t border-neutral-100'}`} />

            {/* Copy link + Native Share */}
            <div className="px-3 py-3 space-y-0.5">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22, duration: 0.2, ease }}
                onClick={handleCopyLink}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-neutral-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  copied
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : isDark
                      ? 'bg-white/5 group-hover:bg-white/10 text-white/50'
                      : 'bg-neutral-50 group-hover:bg-white group-hover:shadow-sm text-neutral-500'
                }`}>
                  {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-semibold tracking-wide ${
                  copied
                    ? 'text-emerald-600'
                    : isDark ? 'text-white/70 group-hover:text-white' : 'text-neutral-700 group-hover:text-neutral-900'
                }`}>
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </span>
              </motion.button>

              {/* Native share (mobile) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.26, duration: 0.2, ease }}
                  onClick={handleNativeShare}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isDark
                      ? 'bg-white/5 group-hover:bg-white/10 text-white/50'
                      : 'bg-neutral-50 group-hover:bg-white group-hover:shadow-sm text-neutral-500'
                  }`}>
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-semibold tracking-wide ${
                    isDark ? 'text-white/70 group-hover:text-white' : 'text-neutral-700 group-hover:text-neutral-900'
                  }`}>
                    More Options…
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

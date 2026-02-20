import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, RotateCcw, ShoppingCart, Heart, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { createPortal } from 'react-dom';
import { ShareMenu } from './ShareMenu';

const ease = [0.22, 1, 0.36, 1] as const;

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  alt: string;
  productName?: string;
  productPrice?: number;
  productCategory?: string;
  productId?: string;
  colorHex?: string;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  onViewDetails?: () => void;
  isWishlisted?: boolean;
}

export const ImageLightbox = ({
  isOpen,
  onClose,
  image,
  alt,
  productName,
  productPrice,
  productCategory,
  productId,
  colorHex,
  onAddToCart,
  onToggleWishlist,
  onViewDetails,
  isWishlisted,
}: ImageLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.5, 4));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(s - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  }, [scale, resetZoom]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...position };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [scale, position]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || scale <= 1) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: posStart.current.x + dx,
        y: posStart.current.y + dy,
      });
    },
    [isDragging, scale]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Scroll to zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.3 : 0.3;
      setScale((s) => {
        const next = Math.min(Math.max(s + delta, 1), 4);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    },
    []
  );

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200]"
          />

          {/* Modal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-4 md:p-8 pointer-events-none"
          >
            <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row bg-neutral-950 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl pointer-events-auto">
              
              {/* Top bar (mobile) */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/80 backdrop-blur-md md:hidden border-b border-white/5">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Image Preview</span>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Image area */}
              <div
                ref={containerRef}
                className="relative flex-1 min-h-[50vh] md:min-h-0 overflow-hidden bg-neutral-950 flex items-center justify-center select-none"
                onDoubleClick={handleDoubleClick}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
                style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
              >
                <motion.div
                  animate={{
                    scale,
                    x: position.x,
                    y: position.y,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <ImageWithFallback
                    src={image}
                    alt={alt}
                    className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain pointer-events-none"
                    draggable={false}
                  />
                </motion.div>

                {/* Zoom controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
                  <button
                    onClick={zoomOut}
                    disabled={scale <= 1}
                    className="p-2 text-white/70 hover:text-white disabled:text-white/20 transition-colors rounded-full hover:bg-white/10"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-white/50 font-mono min-w-[3rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    disabled={scale >= 4}
                    className="p-2 text-white/70 hover:text-white disabled:text-white/20 transition-colors rounded-full hover:bg-white/10"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button
                    onClick={resetZoom}
                    className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Desktop close */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors hidden md:flex items-center justify-center border border-white/10"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>

                {/* Double-click hint */}
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <span className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-bold">
                      Double-click or scroll to zoom
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Product info sidebar */}
              {productName && (
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease }}
                  className="w-full md:w-80 lg:w-96 bg-neutral-900 p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5"
                >
                  <div className="space-y-5">
                    {/* Category */}
                    <div className="flex items-center gap-3">
                      {colorHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/10"
                          style={{ backgroundColor: colorHex }}
                        />
                      )}
                      <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/40">
                        {productCategory || 'Collection'}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-2xl md:text-3xl font-serif text-white tracking-tight leading-tight">
                      {productName}
                    </h3>

                    {/* Price */}
                    {productPrice && (
                      <p className="text-lg font-medium text-white/70">
                        R {productPrice.toLocaleString()}
                      </p>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-white/10" />

                    {/* Quick details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 mb-1">Materiality</p>
                        <p className="text-xs text-white/60 font-light">Premium Oak, Tactile Velvet, Brushed Steel</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/30 mb-1">Origin</p>
                        <p className="text-xs text-white/60 font-light">Alberton Workshop, South Africa</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 mt-8">
                    {onAddToCart && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          onAddToCart();
                          onClose();
                        }}
                        className="w-full bg-white text-neutral-900 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-100 transition-colors flex items-center justify-center gap-3 rounded-xl"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Collection
                      </motion.button>
                    )}
                    <div className="flex gap-3">
                      {onToggleWishlist && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onToggleWishlist()}
                          className={`flex-1 py-3.5 border rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-[0.2em] font-bold ${
                            isWishlisted
                              ? 'bg-white/10 border-white/20 text-white'
                              : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                          {isWishlisted ? 'Saved' : 'Save'}
                        </motion.button>
                      )}
                      {onViewDetails && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            onViewDetails();
                            onClose();
                          }}
                          className="flex-1 py-3.5 border border-white/10 rounded-xl text-white/50 hover:text-white hover:border-white/30 flex items-center justify-center gap-2 transition-all text-[10px] uppercase tracking-[0.2em] font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Details
                        </motion.button>
                      )}
                    </div>

                    {/* Share */}
                    {productName && (
                      <div className="pt-3 border-t border-white/5">
                        <ShareMenu
                          productName={productName}
                          productId={productId}
                          productImage={image}
                          variant="dark"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
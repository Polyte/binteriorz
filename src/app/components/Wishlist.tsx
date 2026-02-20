import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onRemove: (id: string) => void;
  onAddToCart: (product: any) => void;
}

export const Wishlist = ({ isOpen, onClose, items, onRemove, onAddToCart }: WishlistProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-serif font-bold tracking-tight text-neutral-900">Your Wishlist</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-1">Saved Designs</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-neutral-200" />
                  </div>
                  <h3 className="text-lg font-serif font-medium text-neutral-900 mb-2">Your wishlist is empty</h3>
                  <p className="text-sm text-neutral-500 mb-8 max-w-[240px]">Save your favorite pieces to view them later or add to collection.</p>
                  <button
                    onClick={onClose}
                    className="px-8 py-4 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-6 group"
                    >
                      <div className="w-24 h-32 bg-neutral-50 flex-shrink-0 overflow-hidden relative">
                        <ImageWithFallback
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-serif font-bold text-neutral-900">{item.name}</h4>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-neutral-400 mt-1">{item.category}</p>
                          </div>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="p-1 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-sm font-medium">R {item.price.toLocaleString()}</span>
                          <button
                            onClick={() => {
                              onAddToCart(item);
                              onRemove(item.id);
                            }}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-900 hover:gap-3 transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t border-neutral-100 bg-neutral-50/50">
                <button
                  onClick={() => {
                    items.forEach(item => onAddToCart(item));
                    items.forEach(item => onRemove(item.id));
                    onClose();
                  }}
                  className="w-full py-5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add All to Collection
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

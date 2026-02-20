import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const Cart = ({ isOpen, onClose, items, onRemove, onClear }: CartProps) => {
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[60] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white">
                   <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-neutral-900 leading-none">Your Collection</h2>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{items.length} Acquisition{items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-neutral-50 rounded-full transition-all text-neutral-400 hover:text-neutral-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-neutral-200" />
                  </div>
                  <h3 className="text-xl font-serif text-neutral-900 mb-2">The studio is quiet.</h3>
                  <p className="text-sm text-neutral-400 font-light max-w-[200px]">Your acquisition bag is currently empty.</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="flex gap-6 group"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-50 flex-shrink-0 border border-neutral-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">{item.name}</h3>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 mb-2 font-medium">Bespoke Selection • Qty {item.quantity}</p>
                      <p className="text-sm font-bold text-neutral-900">R {item.price.toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t border-neutral-100 bg-[#fcfcfc] rounded-t-[2rem]">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    <span>Subtotal</span>
                    <span>R {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-400 uppercase tracking-widest font-bold">
                    <span>White-Glove Delivery</span>
                    <span className="text-emerald-600">Complimentary</span>
                  </div>
                  <div className="h-px w-full bg-neutral-100 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-serif font-bold text-neutral-900">Total Investment</span>
                    <span className="text-2xl font-serif font-bold text-neutral-900">R {total.toLocaleString()}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full py-6 bg-neutral-900 text-white text-[10px] uppercase tracking-[0.4em] font-bold rounded-2xl shadow-2xl shadow-neutral-900/20 hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 group"
                >
                  Initiate Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <p className="text-[9px] text-center text-neutral-400 uppercase tracking-[0.3em] font-bold mt-6 opacity-60">
                   Encrypted Acquisition Protocol
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
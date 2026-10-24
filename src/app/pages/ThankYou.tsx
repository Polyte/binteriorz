import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLocation, Link, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, Package, Mail, ArrowRight, Instagram, Clock, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPayFastReturn = searchParams.get('payfast') === '1';

  // State from checkout flow (passed via navigate state)
  const stateData = location.state || {};

  const [orderId, setOrderId] = useState<string>(stateData.orderId || '');
  const [email, setEmail] = useState<string>(stateData.email || '');
  const [items, setItems] = useState<any[]>(stateData.items || []);
  const [total, setTotal] = useState<number>(stateData.total || 0);
  const [customerName, setCustomerName] = useState<string>(stateData.customerName || '');
  const [paymentMethod, setPaymentMethod] = useState<string>('payfast');
  const [orderStatus, setOrderStatus] = useState<string>('confirmed');
  const [loading, setLoading] = useState(false);

  // Handle PayFast return — look up order from server
  useEffect(() => {
    if (isPayFastReturn && !orderId) {
      const savedOrderId = localStorage.getItem('bi_payfast_order');
      if (savedOrderId) {
        setLoading(true);
        setOrderId(savedOrderId);

        const fetchOrder = async () => {
          try {
            const res = await fetch(`/api/payfast/orders/${encodeURIComponent(savedOrderId)}`);
            if (res.ok) {
              const data = await res.json();
              setOrderId(data.orderId);
              setEmail(data.email || '');
              setItems(data.items || []);
              setTotal(data.total || 0);
              setCustomerName(data.customerName || '');
              setPaymentMethod(data.paymentMethod || 'payfast');
              setOrderStatus(data.status || 'pending_payment');
            } else {
              console.error('Failed to look up PayFast order:', savedOrderId);
            }
          } catch (err) {
            console.error('Error fetching PayFast order:', err);
          } finally {
            setLoading(false);
            localStorage.removeItem('bi_payfast_order');
          }
        };

        fetchOrder();
      } else {
        // No order ID found at all
        navigate('/shop');
      }
    }
  }, [isPayFastReturn, orderId, navigate]);

  // Redirect if no order data at all (and not loading)
  useEffect(() => {
    if (!isPayFastReturn && !stateData.orderId) {
      navigate('/shop');
    }
  }, [isPayFastReturn, stateData.orderId, navigate]);

  // Confetti on load
  useEffect(() => {
    if (orderId && !loading) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#171717', '#ffffff', '#e5e5e5'],
      });
    }
  }, [orderId, loading]);

  if (loading) {
    return (
      <div className="pt-48 pb-24 min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-neutral-100 border-t-neutral-900 rounded-full mx-auto mb-6"
          />
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-bold">
            Confirming Your Payment...
          </p>
        </div>
      </div>
    );
  }

  if (!orderId) return null;

  const isPending = orderStatus === 'pending_payment';

  return (
    <div className="pt-48 pb-24 min-h-screen bg-[#fcfcfc]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`mb-12 inline-flex items-center justify-center w-24 h-24 rounded-full text-white shadow-2xl ${
              isPending ? 'bg-amber-600 shadow-amber-600/40' : 'bg-neutral-900 shadow-neutral-900/40'
            }`}
          >
            {isPending ? (
              <Clock className="w-12 h-12" />
            ) : (
              <CheckCircle2 className="w-12 h-12" />
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif text-neutral-900 mb-6 tracking-tighter">
              {isPending ? 'Payment Processing' : 'Thank You'}
            </h1>
            <p className="text-lg text-neutral-500 mb-4 font-light leading-relaxed">
              {isPending ? (
                <>Your PayFast payment is being processed. Order <span className="text-neutral-900 font-bold tracking-widest">{orderId}</span> will be confirmed shortly.</>
              ) : (
                <>Your collection has been reserved. Order <span className="text-neutral-900 font-bold tracking-widest">{orderId}</span> is now being prepared in our Alberton studio.</>
              )}
            </p>
            {paymentMethod === 'payfast' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00457C]/10 to-[#00A4EF]/10 rounded-full mt-2">
                <Wallet className="w-3.5 h-3.5 text-[#00457C]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00457C]">Paid via PayFast</span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Order Details */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7 space-y-8"
          >
            {isPending && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem]">
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 mb-1">Payment Pending Confirmation</h3>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      PayFast is processing your payment. You'll receive a confirmation email once the payment is verified. This usually takes a few moments for EFT payments and is instant for card payments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-900 mb-8 pb-4 border-b border-neutral-50">Collection Summary</h3>

              <div className="space-y-6">
                {items?.map((item: any) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-50 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">{item.name}</h4>
                      <p className="text-[10px] text-neutral-400 mt-1">{item.material} {item.material ? '•' : ''} Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-serif font-bold italic">R {item.price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {total > 0 && (
                <div className="mt-10 pt-8 border-t border-neutral-50 space-y-4">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Investment Subtotal</span>
                    <span>R {total?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>White-Glove Delivery</span>
                    <span className="text-emerald-600 font-bold">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-xl font-serif pt-4 border-t border-neutral-50">
                    <span>Total Investment</span>
                    <span className="font-bold">R {total?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
                <Mail className="w-5 h-5 mb-4 text-neutral-400" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-900 mb-2">Confirmation Sent</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  A receipt {isPending ? 'will be' : 'has been'} sent to <span className="font-bold text-neutral-900">{email}</span>.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
                <Package className="w-5 h-5 mb-4 text-neutral-400" />
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-900 mb-2">White-Glove Service</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Our logistics team will contact you to schedule delivery.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Side Info */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-5 space-y-6 lg:sticky lg:top-32"
          >
            <div className="bg-neutral-900 p-10 rounded-[2.5rem] text-white">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-6">Client Registry</h3>
              {customerName && <p className="text-sm font-serif italic mb-2">{customerName}</p>}
              <p className="text-xs text-neutral-400 leading-relaxed mb-8">
                Your acquisition is now officially registered in our archive. We ensure every piece carries its lineage and craftsmanship certificates.
              </p>

              <Link
                to="/shop"
                className="w-full py-5 bg-white text-neutral-900 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-neutral-100 transition-all flex items-center justify-center gap-4 group"
              >
                Continue Exploring <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <button className="w-full py-5 border-2 border-neutral-100 text-neutral-900 rounded-2xl text-[10px] uppercase tracking-[0.4em] font-bold hover:border-neutral-900 transition-all flex items-center justify-center gap-4 group">
              <Instagram className="w-4 h-4" /> Tag Your Studio
            </button>

            <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-300 font-bold text-center italic pt-8">
              "Design is a sensory experience."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

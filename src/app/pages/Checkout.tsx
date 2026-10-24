import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ShieldCheck, Truck, Lock, CheckCircle2, AlertCircle, ExternalLink, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = `/api`;
const headers = {
  'Content-Type': 'application/json',
};

// ─── Step Indicator ─────────────────────────────────────────────
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Review' },
  ];
  return (
    <div className="flex items-center gap-0 mb-16">
      {steps.map((step, i) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                backgroundColor: currentStep >= step.num ? '#171717' : '#ffffff',
                borderColor: currentStep >= step.num ? '#171717' : '#e5e5e5',
                scale: currentStep === step.num ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
            >
              {currentStep > step.num ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <span className={currentStep >= step.num ? 'text-white' : 'text-neutral-400'}>
                  {step.num}
                </span>
              )}
            </motion.div>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold hidden sm:block ${currentStep >= step.num ? 'text-neutral-900' : 'text-neutral-300'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 mx-4">
              <div className="h-px bg-neutral-200 relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-neutral-900"
                  initial={{ width: '0%' }}
                  animate={{ width: currentStep > step.num ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Outer Wrapper: Loads PayFast Config ─────────────────────────
interface CheckoutProps {
  items: any[];
  total: number;
  onClearCart: () => void;
}

export const Checkout = ({ items, total, onClearCart }: CheckoutProps) => {
  const navigate = useNavigate();
  const [payFastAvailable, setPayFastAvailable] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
      return;
    }

    const initPayFast = async () => {
      try {
        const res = await fetch('/api/payfast/config');
        if (!res.ok) throw new Error('PayFast config fetch failed');
        const { configured } = await res.json();
        setPayFastAvailable(configured);
      } catch (err) {
        console.error('Failed to load PayFast config:', err);
        setPayFastAvailable(false);
      } finally {
        setConfigLoading(false);
      }
    };

    initPayFast();
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  // Loading state
  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] pt-32">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-neutral-100 border-t-neutral-900 rounded-full mx-auto mb-6"
          />
          <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-bold">
            Initializing Secure Checkout
          </p>
        </div>
      </div>
    );
  }

  // Error state - PayFast not configured
  if (!payFastAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] pt-32 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif text-neutral-900 mb-4">Payment System Unavailable</h2>
          <p className="text-sm text-neutral-500 font-light mb-8 leading-relaxed">
            We're unable to initialize the payment system at this moment.
            Please ensure the PayFast credentials are configured and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-neutral-900 text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PayFastCheckout
      items={items}
      total={total}
      onClearCart={onClearCart}
    />
  );
};

// ─── PayFast Checkout ────────────────────────────────────────────
const PayFastCheckout = ({
  items,
  total,
  onClearCart,
}: {
  items: any[];
  total: number;
  onClearCart: () => void;
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStep1Valid =
    formData.firstName.trim() !== '' && formData.lastName.trim() !== '' &&
    formData.email.trim() !== '' && formData.address.trim() !== '' &&
    formData.city.trim() !== '' && formData.postalCode.trim() !== '';

  const handlePayFastSubmit = async () => {
    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/thank-you?payfast=1`;
      const cancelUrl = `${window.location.origin}/checkout`;

      const res = await fetch('/api/payfast/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ items, total, customerInfo: formData, returnUrl, cancelUrl }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to initialize PayFast payment');
      }

      const { orderId, paymentUrl, formData: pfFormData } = await res.json();
      localStorage.setItem('bi_payfast_order', orderId);
      onClearCart();

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;
      Object.entries(pfFormData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      console.error('PayFast checkout error:', error);
      toast.error(error.message || 'Failed to redirect to PayFast.');
      setLoading(false);
    }
  };

  const inputClasses =
    'w-full bg-transparent border-b border-neutral-200 py-4 text-sm font-light focus:border-neutral-900 outline-none transition-all duration-500 placeholder:text-neutral-300';

  return (
    <div className="pt-28 md:pt-36 pb-24 min-h-screen bg-[#fcfcfc]">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 hover:text-neutral-900 mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {step > 1 ? 'Previous Step' : 'Return to Studio'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          <div className="lg:col-span-7">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif text-neutral-900 mb-4 tracking-tight"
            >
              Secure Checkout
            </motion.h1>
            <p className="text-sm text-neutral-400 font-light mb-8">Your collection is reserved for the next 15 minutes.</p>

            <StepIndicator currentStep={step} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="pf-step-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral-900">Delivery Information</h2>
                  </div>
                  <div className="space-y-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      <div><label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">First Name</label><input type="text" name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleInputChange} className={inputClasses} /></div>
                      <div><label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Last Name</label><input type="text" name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleInputChange} className={inputClasses} /></div>
                    </div>
                    <div className="md:col-span-2"><label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Email Address</label><input type="email" name="email" placeholder="you@email.com" value={formData.email} onChange={handleInputChange} className={inputClasses} /></div>
                    <div><label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Phone (Optional)</label><input type="tel" name="phone" placeholder="+27..." value={formData.phone} onChange={handleInputChange} className={inputClasses} /></div>
                    <div><label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Street Address</label><input type="text" name="address" placeholder="35 Radio Street" value={formData.address} onChange={handleInputChange} className={inputClasses} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      <div><label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">City</label><input type="text" name="city" placeholder="Alberton" value={formData.city} onChange={handleInputChange} className={inputClasses} /></div>
                      <div><label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Postal Code</label><input type="text" name="postalCode" placeholder="1449" value={formData.postalCode} onChange={handleInputChange} className={inputClasses} /></div>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.98 }} disabled={!isStep1Valid} onClick={() => setStep(2)} className="mt-12 w-full bg-neutral-900 text-white py-5 font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 disabled:bg-neutral-300 disabled:cursor-not-allowed">
                    Continue to Payment <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="pf-step-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral-900">Payment Method</h2>
                  </div>
                  <div className="bg-white p-8 md:p-10 rounded-2xl border border-neutral-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00457C] to-[#00A4EF] flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">PayFast Secure Checkout</h3>
                        <p className="text-[11px] text-neutral-400">South Africa's trusted payment gateway</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"><div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" /><span className="text-xs text-neutral-600">Instant EFT from all major SA banks</span></div>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"><div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" /><span className="text-xs text-neutral-600">Credit & Debit Card (Visa, Mastercard, Amex)</span></div>
                      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl"><div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" /><span className="text-xs text-neutral-600">SnapScan, Mobicred, Samsung Pay & more</span></div>
                    </div>
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-blue-700 leading-relaxed">You will be securely redirected to PayFast to complete your payment.</p>
                      </div>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(3)} className="mt-10 w-full bg-neutral-900 text-white py-5 font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all flex items-center justify-center gap-3">
                    Review Order <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                  </motion.button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="pf-step-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral-900">Review & Pay</h2>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">Shipping To</h3>
                      <button onClick={() => setStep(1)} className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Edit</button>
                    </div>
                    <p className="text-sm text-neutral-900">{formData.firstName} {formData.lastName}</p>
                    <p className="text-sm text-neutral-500 font-light">{formData.address}, {formData.city}, {formData.postalCode}</p>
                    <p className="text-sm text-neutral-500 font-light">{formData.email}</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm mb-6">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 mb-4">Payment</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-gradient-to-r from-[#00457C] to-[#00A4EF] rounded-md flex items-center justify-center"><Wallet className="w-4 h-4 text-white" /></div>
                      <span className="text-sm text-neutral-700 font-light">PayFast <span className="text-[10px] text-neutral-400">(redirect)</span></span>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm mb-8">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400 mb-6">Your Collection</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" /></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">{item.name}</h4>
                            <p className="text-[10px] text-neutral-400">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-serif italic font-bold whitespace-nowrap">R {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.98 }} disabled={loading} onClick={handlePayFastSubmit} className="w-full bg-neutral-900 text-white py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] shadow-2xl shadow-neutral-900/20 hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 disabled:bg-neutral-400 relative overflow-hidden group">
                    {loading ? (
                      <div className="flex items-center gap-4">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                        <span>Redirecting to PayFast...</span>
                      </div>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        Pay R {total.toLocaleString()} via PayFast
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </>
                    )}
                  </motion.button>
                  <p className="text-center text-[10px] text-neutral-300 mt-6 uppercase tracking-widest">By authorizing, you agree to our Terms of Service</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-neutral-100 shadow-sm sticky top-28">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral-900 mb-8 pb-4 border-b border-neutral-50">Collection Summary</h3>
              <div className="space-y-5 mb-8 max-h-[320px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-50 flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" /></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 truncate">{item.name}</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{item.material && `${item.material} · `}Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">R {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-6 border-t border-neutral-100">
                <div className="flex justify-between text-xs text-neutral-500"><span>Subtotal</span><span>R {total.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-neutral-500"><span>White-Glove Delivery</span><span className="text-emerald-600 font-bold">Complimentary</span></div>
                <div className="flex justify-between items-baseline text-lg font-serif pt-4 border-t border-neutral-100"><span>Investment Total</span><span className="font-bold">R {total.toLocaleString()}</span></div>
              </div>
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-widest"><div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-4 h-4 text-neutral-700" /></div>Bespoke Studio Warranty</div>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-widest"><div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0"><Truck className="w-4 h-4 text-neutral-700" /></div>National White-Glove Logistics</div>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-widest"><div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0"><Lock className="w-4 h-4 text-neutral-700" /></div>PayFast Secure Payments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

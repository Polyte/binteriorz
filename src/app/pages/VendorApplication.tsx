import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ArrowRight, Upload, Store, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const VendorApplication = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    category: 'Furniture',
    description: '',
    email: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {

      const res = await fetch(`/api/vendors/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Submission failed');

      setStep(3);
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-neutral-50">
      <div className="max-w-[1480px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Content */}
          <div className="space-y-12">
            <div>
              <span className="text-xs uppercase tracking-[0.5em] text-neutral-400 mb-6 block font-bold">Partnerships</span>
              <h1 className="text-5xl md:text-7xl font-serif text-neutral-900 leading-tight mb-8">
                Join the <br />B Interior Designz Guild
              </h1>
              <p className="text-xl text-neutral-600 max-w-lg leading-relaxed">
                We are looking for elite artisans, curators, and brands who share our commitment to quiet luxury and uncompromising quality.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: Store, title: "Bespoke Digital Store", desc: "A sophisticated, high-conversion interface for your collections." },
                { icon: ShieldCheck, title: "Artisan Verification", desc: "Gain the 'Artisan Verified' seal of quality for your brand." },
                { icon: Zap, title: "Global Logistics", desc: "Access our premium white-glove delivery network." },
                { icon: CheckCircle, title: "Inventory Management", desc: "A streamlined dashboard to manage stock and commissions." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100">
                    <item.icon className="w-6 h-6 text-neutral-900" />
                  </div>
                  <h3 className="font-serif text-xl text-neutral-900">{item.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Form Card */}
          <div className="bg-white border border-neutral-200 p-8 md:p-12 shadow-2xl relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-serif mb-8 text-neutral-900">Application Entry</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Business Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-neutral-50 border-b border-neutral-200 py-4 px-2 focus:border-neutral-900 outline-none transition-colors"
                        placeholder="e.g. Studio Alberton"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Portfolio or Website</label>
                      <input 
                        type="url" 
                        className="w-full bg-neutral-50 border-b border-neutral-200 py-4 px-2 focus:border-neutral-900 outline-none transition-colors"
                        placeholder="https://..."
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                    <button 
                      onClick={() => setStep(2)}
                      className="w-full py-6 bg-neutral-900 text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-neutral-800 transition-all flex items-center justify-center gap-4"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-serif mb-8 text-neutral-900">Brand Identity</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Category</label>
                        <select 
                          className="w-full bg-neutral-50 border-b border-neutral-200 py-4 px-2 focus:border-neutral-900 outline-none transition-colors"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                          <option>Furniture</option>
                          <option>Lighting</option>
                          <option>Art</option>
                          <option>Textiles</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Base Location</label>
                        <input 
                          type="text" 
                          className="w-full bg-neutral-50 border-b border-neutral-200 py-4 px-2 focus:border-neutral-900 outline-none transition-colors"
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Contact Email</label>
                      <input 
                        type="email" 
                        className="w-full bg-neutral-50 border-b border-neutral-200 py-4 px-2 focus:border-neutral-900 outline-none transition-colors"
                        placeholder="studio@business.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2 block">Brand Story (Brief)</label>
                      <textarea 
                        className="w-full bg-neutral-50 border-b border-neutral-200 py-4 px-2 focus:border-neutral-900 outline-none transition-colors h-32 resize-none"
                        placeholder="Describe your design philosophy..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-6 border border-neutral-200 text-neutral-900 font-bold uppercase tracking-[0.3em] text-xs hover:bg-neutral-50 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-6 bg-neutral-900 text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-neutral-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Send Application'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-4xl font-serif mb-6 text-neutral-900">Application Received</h2>
                  <p className="text-neutral-500 max-w-sm mx-auto leading-relaxed mb-10">
                    Our curation team will review your portfolio. You will receive an invitation to create your artisan account within 3-5 business days.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="text-xs uppercase tracking-widest font-bold border-b-2 border-neutral-900 pb-2"
                  >
                    Return to Studio
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

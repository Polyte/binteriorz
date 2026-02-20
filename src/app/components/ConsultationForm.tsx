import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Send, ArrowRight } from 'lucide-react';

export const ConsultationForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'Residential Decor',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-710d82e2/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to send inquiry');

      toast.success('Inquiry received. Our concierge will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: 'Residential Decor',
        message: ''
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to connect with the studio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-transparent border-b border-neutral-200 py-4 text-sm font-light focus:border-neutral-900 outline-none transition-all duration-500 placeholder:text-neutral-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group">
            <input
              required
              type="text"
              placeholder="Full Name"
              className={inputClasses}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 group-focus-within:w-full transition-all duration-700" />
          </div>
          <div className="relative group">
            <input
              required
              type="email"
              placeholder="Email Address"
              className={inputClasses}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 group-focus-within:w-full transition-all duration-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group">
            <input
              type="tel"
              placeholder="Contact Number"
              className={inputClasses}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 group-focus-within:w-full transition-all duration-700" />
          </div>
          <div className="relative group">
            <select
              className={inputClasses + " cursor-pointer appearance-none"}
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            >
              <option>Residential Decor</option>
              <option>Corporate Office Fit-out</option>
              <option>Custom Furniture Commission</option>
              <option>Space Planning</option>
            </select>
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 group-focus-within:w-full transition-all duration-700" />
          </div>
        </div>

        <div className="relative group">
          <textarea
            required
            rows={3}
            placeholder="How can we assist with your space?"
            className={inputClasses + " resize-none"}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>
          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 group-focus-within:w-full transition-all duration-700" />
        </div>
      </div>

      <motion.button
        whileHover={{ x: 10 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-900 disabled:opacity-30 group"
      >
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 border border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            Transmitting...
          </div>
        ) : (
          <>
            Send Message 
            <div className="w-12 h-px bg-neutral-200 group-hover:bg-neutral-900 group-hover:w-20 transition-all duration-500" />
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </form>
  );
};

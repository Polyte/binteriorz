import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface NewsletterParallaxProps {
  image: string;
  imageAlt?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export const NewsletterParallax = ({
  image,
  imageAlt = 'Newsletter background',
  eyebrow = 'The Inner Circle',
  title = 'Stay Inspired with B-Interiors',
  description = 'Be the first to receive exclusive previews of our new collections, artisan stories, and bespoke interior inspiration.',
}: NewsletterParallaxProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/newsletter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Subscription failed');
      }

      const data = await res.json();
      if (data.message === 'Already subscribed') {
        toast.info('You are already part of the inner circle.');
      } else {
        toast.success('Welcome to the B-Interiors circle.');
      }
      setSubscribed(true);
      setEmail('');
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="relative" style={{ position: 'relative' }}>
      <section
        className="relative h-[60vh] min-h-[480px] overflow-hidden flex items-center justify-center bg-neutral-900"
        style={{ position: 'relative' }}
      >
        <motion.div
          style={{ y, scale }}
          className="absolute inset-0 w-full h-[130%]"
        >
          <ImageWithFallback
            src={image}
            className="w-full h-full object-cover opacity-50 grayscale-[30%]"
            alt={imageAlt}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </motion.div>

        {/* Decorative borders */}
        <div className="absolute inset-8 md:inset-16 border border-white/[0.05] pointer-events-none z-10" />

        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-4 max-w-2xl"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="w-12 h-px bg-white/20" />
            <span
              className="text-[9px] uppercase tracking-[0.6em] text-white/50 font-bold"
              style={{ fontFamily: 'var(--font-josefin)' }}
            >
              {eyebrow}
            </span>
            <div className="w-12 h-px bg-white/20" />
          </div>
          <h2
            className="text-4xl md:text-6xl lg:text-7xl text-white mb-5 leading-[1.05] tracking-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {title}
          </h2>
          <p
            className="text-white/40 mb-8 text-lg md:text-xl font-light leading-relaxed max-w-md mx-auto"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {description}
          </p>

          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={handleSubscribe}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 px-6 py-4 text-white placeholder:text-neutral-400 focus:outline-none focus:bg-white/20 focus:border-white transition-all backdrop-blur-sm"
                  required
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-white text-neutral-900 px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 max-w-md mx-auto py-4"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-sm font-light">
                  You're in. Expect curated inspiration soon.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-4 text-[10px] text-neutral-500 uppercase tracking-widest">
            By subscribing, you agree to our privacy policy.
          </p>
        </motion.div>
      </section>
    </div>
  );
};

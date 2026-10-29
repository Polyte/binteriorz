import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Check, CheckCircle2, Loader2, Mail, X } from 'lucide-react';
import { toast } from 'sonner';

const API = `/api`;
const SESSION_KEY = 'bi_catalogue_signup_prompt_seen';

type Preference = 'monthly-newsletter' | 'catalogue-updates';

const options: Array<{ id: Preference; title: string; detail: string; icon: typeof Mail }> = [
  {
    id: 'monthly-newsletter',
    title: 'Monthly newsletter',
    detail: 'A considered edit of interiors, makers, and ideas.',
    icon: Mail,
  },
  {
    id: 'catalogue-updates',
    title: 'Catalogue updates',
    detail: 'New arrivals, limited pieces, and collection releases.',
    icon: BookOpen,
  },
];

export const NewsletterPopup = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<Preference[]>([
    'monthly-newsletter',
    'catalogue-updates',
  ]);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const catalogue = document.getElementById('catalogue');
    if (!catalogue) return;

    let showTimer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      showTimer = window.setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, '1');
        setOpen(true);
      }, 650);
    }, { threshold: 0.28 });

    observer.observe(catalogue);
    return () => {
      observer.disconnect();
      window.clearTimeout(showTimer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => emailRef.current?.focus(), 350);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const togglePreference = (preference: Preference) => {
    setPreferences((current) => current.includes(preference)
      ? current.filter((item) => item !== preference)
      : [...current, preference]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || preferences.length === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API}/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), preferences }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Subscription failed');

      setSubscribed(true);
      toast.success(result.message === 'Already subscribed'
        ? 'Your subscription preferences are up to date.'
        : 'Welcome to the B Interior Designz edit.');
      window.setTimeout(() => setOpen(false), 1800);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('We could not save your subscription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          data-no-scroll-trigger
          role="dialog"
          aria-modal="false"
          aria-labelledby="newsletter-popup-title"
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-20 z-[75] overflow-hidden border border-white/10 bg-[#151411] text-white shadow-[0_28px_90px_rgba(0,0,0,.4)] sm:inset-x-auto sm:bottom-8 sm:right-8 sm:w-[430px]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,.1)_0.5px,transparent_0.5px)] [background-size:8px_8px]" />
          <div className="relative p-6 sm:p-7">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close subscription prompt"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7b96a]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-3 pr-10">
              <span className="h-px w-8 bg-[#d7b96a]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-[#d7b96a]">
                The B Interior Designz Edit
              </span>
            </div>

            {subscribed ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-[#d7b96a]" strokeWidth={1.4} />
                <h2 id="newsletter-popup-title" className="mb-2 text-3xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                  You’re on the list.
                </h2>
                <p className="text-sm text-white/50">Your selected updates will arrive in your inbox.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 id="newsletter-popup-title" className="mb-2 pr-8 text-3xl leading-tight sm:text-4xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Keep the catalogue close.
                </h2>
                <p className="mb-5 text-sm leading-relaxed text-white/50">
                  Choose what you would like to receive. Thoughtful updates, never inbox clutter.
                </p>

                <div className="mb-5 grid gap-2">
                  {options.map((option) => {
                    const selected = preferences.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        onClick={() => togglePreference(option.id)}
                        className={`flex items-center gap-3 border p-3 text-left transition-colors ${selected ? 'border-[#d7b96a]/55 bg-[#d7b96a]/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}
                      >
                        <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full ${selected ? 'bg-[#d7b96a] text-[#17140d]' : 'bg-white/[0.06] text-white/50'}`}>
                          {selected ? <Check className="h-4 w-4" /> : <option.icon className="h-4 w-4" />}
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-white/90">{option.title}</span>
                          <span className="mt-0.5 block text-xs text-white/40">{option.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <label htmlFor="catalogue-subscription-email" className="sr-only">Email address</label>
                  <input
                    ref={emailRef}
                    id="catalogue-subscription-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                    required
                    className="min-w-0 flex-1 border border-white/15 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#d7b96a]"
                  />
                  <button
                    type="submit"
                    disabled={submitting || preferences.length === 0}
                    className="min-w-24 bg-[#d7b96a] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#17140d] transition-colors hover:bg-[#ead28f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'Subscribe'}
                  </button>
                </div>
                {preferences.length === 0 && <p className="mt-2 text-xs text-[#e7c977]">Choose at least one update type.</p>}
              </form>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

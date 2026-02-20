import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-710d82e2`;
const hdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}`, apikey: publicAnonKey };

interface Review { id: string; productId: string; name: string; rating: number; comment: string; createdAt: string; }

const StarRating = ({ rating, onChange, size = 'md' }: { rating: number; onChange?: (r: number) => void; size?: 'sm' | 'md' }) => {
  const [hover, setHover] = useState(0);
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star className={`${dim} transition-colors ${(hover || rating) >= i ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />
        </button>
      ))}
    </div>
  );
};

export const ProductReviews = ({ productId }: { productId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 0, comment: '' });

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API}/reviews/${productId}`, { headers: hdrs });
      if (res.ok) setReviews(await res.json());
    } catch (e) { console.error('Fetch reviews error:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0;
  const ratingDist = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: reviews.filter(r => r.rating === s).length }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rating) { toast.error('Please provide your name and a rating.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/reviews`, { method: 'POST', headers: hdrs, body: JSON.stringify({ productId, ...form }) });
      if (!res.ok) throw new Error();
      const newReview = await res.json();
      setReviews(prev => [...prev, newReview]);
      setForm({ name: '', rating: 0, comment: '' });
      setShowForm(false);
      toast.success('Your review has been recorded.');
    } catch { toast.error('Failed to submit review.'); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="mt-32 pt-24 border-t border-neutral-100">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold block mb-4">Client Reflections</span>
          <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 tracking-tighter">Reviews & Impressions</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="self-start bg-neutral-900 text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-colors"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        <div className="md:col-span-4 flex flex-col items-center justify-center bg-white border border-neutral-100 p-10 rounded-2xl">
          <p className="text-6xl font-serif text-neutral-900 mb-2">{avgRating.toFixed(1)}</p>
          <StarRating rating={Math.round(avgRating)} />
          <p className="text-xs text-neutral-400 mt-3 font-light">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="md:col-span-8 flex flex-col justify-center space-y-3">
          {ratingDist.map(d => (
            <div key={d.stars} className="flex items-center gap-4">
              <span className="text-xs text-neutral-400 w-8 text-right font-bold">{d.stars}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: reviews.length ? `${(d.count / reviews.length) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-neutral-900 rounded-full"
                />
              </div>
              <span className="text-xs text-neutral-300 w-8 font-light">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-white border border-neutral-100 p-8 md:p-10 rounded-2xl mb-16 overflow-hidden"
          >
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral-900 mb-8">Share Your Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-2 block">Your Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Sarah M."
                  className="w-full bg-transparent border-b border-neutral-200 py-3 text-sm focus:border-neutral-900 outline-none transition-colors placeholder:text-neutral-300"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-2 block">Rating</label>
                <div className="pt-2">
                  <StarRating rating={form.rating} onChange={r => setForm(p => ({ ...p, rating: r }))} />
                </div>
              </div>
            </div>
            <div className="mb-8">
              <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold mb-2 block">Your Impressions</label>
              <textarea
                rows={3}
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                placeholder="Tell us about your experience with this piece..."
                className="w-full bg-transparent border-b border-neutral-200 py-3 text-sm focus:border-neutral-900 outline-none transition-colors resize-none placeholder:text-neutral-300"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-neutral-900 text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Review
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
          <p className="text-neutral-400 font-serif text-lg">No reviews yet. Be the first to share your impressions.</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-neutral-100">
          {reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="py-8 first:pt-0"
            >
              <div className="flex items-start gap-5">
                <div className="w-11 h-11 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-4">
                      <h4 className="text-sm font-bold text-neutral-900">{review.name}</h4>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-[10px] text-neutral-300 font-light whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-neutral-500 font-light leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Star, Trash2 } from 'lucide-react';
import { useAdmin, timeAgo } from './AdminContext';

export const ReviewsTab = () => {
  const {
    products, reviews, searchQuery, canDelete, avgRating,
    handleDeleteReview,
  } = useAdmin();

  return (
    <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div>
        <h2 className="text-2xl font-serif text-neutral-900">Reviews</h2>
        <p className="text-xs text-neutral-500 mt-0.5">{reviews.length} total reviews &bull; {avgRating.toFixed(1)} avg rating</p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-5">
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <p className="text-4xl font-serif text-neutral-900">{avgRating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-200'}`} />
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter((r: any) => r.rating === stars).length;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-500 w-3 text-right">{stars}</span>
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] text-neutral-400 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="divide-y divide-neutral-50">
          {reviews.filter(r => !searchQuery || r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.comment?.toLowerCase().includes(searchQuery.toLowerCase())).map((review: any) => {
            const product = products.find((p: any) => p.id === review.productId);
            return (
              <div key={review.id} className="p-4 hover:bg-neutral-50 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 text-[10px] font-bold uppercase">
                      {review.name?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-900">{review.name}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-400">{timeAgo(review.createdAt)}</p>
                      {product && <p className="text-[10px] text-neutral-500 font-medium mt-0.5">{product.name}</p>}
                    </div>
                    {canDelete && <button onClick={() => handleDeleteReview(review.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-all" title="Delete review"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
                {review.comment && <p className="text-xs text-neutral-600 ml-11">{review.comment}</p>}
              </div>
            );
          })}
          {reviews.length === 0 && (
            <div className="py-16 text-center">
              <Star className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">No reviews yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

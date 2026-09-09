'use client';

import React, { useState } from 'react';
import { Star, Loader2, Send } from 'lucide-react';
import { submitTechnicianReview } from './reviewActions';

interface ReviewProps {
  jobId: string;
  techName: string;
}

export default function ReviewTechnicianClient({ jobId, techName }: ReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a star rating.');
    
    setIsSubmitting(true);
    
    const res = await submitTechnicianReview(jobId, rating, feedback);
    
    if (res.success) {
      setIsComplete(true);
    } else {
      alert(res.error);
    }
    
    setIsSubmitting(false);
  };

  if (isComplete) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center space-y-2 mt-4">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Star size={20} className="fill-emerald-600" />
        </div>
        <p className="text-xs font-bold text-emerald-800">Review Submitted!</p>
        <p className="text-[10px] text-emerald-600">Thank you for rating {techName}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm mt-4 space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-bold text-neutral-900">Rate your service</h3>
        <p className="text-[11px] text-neutral-500 mt-0.5">How did {techName} do today?</p>
      </div>

      {/* Interactive Stars */}
      <div className="flex justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={`transition-colors ${
                (hoverRating || rating) >= star 
                  ? 'text-amber-400 fill-amber-400' 
                  : 'text-neutral-200'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        rows={2}
        placeholder="Add optional feedback..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-medium text-neutral-800 focus:outline-none focus:border-neutral-900 resize-none"
      />

      <button
        type="submit"
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-neutral-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <>
            <Send size={14} /> Submit Review
          </>
        )}
      </button>
    </form>
  );
}
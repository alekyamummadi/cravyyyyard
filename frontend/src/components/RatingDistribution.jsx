import React from 'react';
import { Star } from 'lucide-react';
import StarRating from './StarRating';

export const RatingDistribution = ({ averageRating, totalReviews, distribution = [] }) => {
  return (
    <div className="rating-distribution-card">
      <div className="rating-distribution-summary">
        <div className="overall-score">
          <span className="score-big">{averageRating !== null && averageRating !== undefined ? Number(averageRating).toFixed(1) : '—'}</span>
          <span className="score-out-of">/ 5</span>
        </div>
        <StarRating rating={averageRating || 0} size={22} />
        <p className="total-reviews-count">
          {totalReviews > 0 ? `Based on ${totalReviews} customer review${totalReviews > 1 ? 's' : ''}` : 'No customer reviews yet'}
        </p>
      </div>

      <div className="distribution-bars">
        {distribution.map(({ star, count, percentage }) => (
          <div key={star} className="distribution-row">
            <div className="star-label">
              <span>{star}</span>
              <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
            </div>

            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${percentage}%`,
                  backgroundColor:
                    star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            <div className="bar-count">
              <span>{count}</span>
              <span className="bar-pct">({percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingDistribution;

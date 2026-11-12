import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  size = 18,
  interactive = false,
  onChange = () => {},
  showNumber = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="star-rating-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(maxStars)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.round(displayRating);

          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '1px',
                cursor: interactive ? 'pointer' : 'default',
                display: 'inline-flex',
                color: isFilled ? '#f59e0b' : '#d1d5db',
                transition: 'transform 0.15s ease, color 0.15s ease',
                transform: interactive && hoverRating === starValue ? 'scale(1.2)' : 'none',
              }}
              title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} stars`}
            >
              <Star
                size={size}
                fill={isFilled ? '#f59e0b' : 'none'}
                stroke={isFilled ? '#f59e0b' : '#9ca3af'}
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span style={{ fontWeight: 600, fontSize: `${size * 0.9}px`, color: '#1f2937', marginLeft: '4px' }}>
          {rating ? Number(rating).toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;

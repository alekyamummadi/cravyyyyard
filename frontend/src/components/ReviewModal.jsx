import React, { useState, useEffect } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';

export const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  restaurantName = '',
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 5);
      setComment(initialData.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    try {
      setSubmitting(true);
      const shouldClose = await onSubmit({ rating: Number(rating), comment });
      if (shouldClose === false) {
        setError('Your existing review is loaded. You can edit it below.');
        return;
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{initialData ? 'Edit Your Review' : 'Write a Review'}</h3>
            <p className="modal-subtitle">{restaurantName}</p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'center', margin: '20px 0' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Your Rating (1 to 5 Stars) *
            </label>
            <div style={{ display: 'inline-block', padding: '8px 16px', background: '#f9fafb', borderRadius: '12px' }}>
              <StarRating rating={rating} size={32} interactive onChange={setRating} />
            </div>
            <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>
              {rating === 5 && '★★★★★ Exceptional!'}
              {rating === 4 && '★★★★☆ Very Good'}
              {rating === 3 && '★★★☆☆ Average'}
              {rating === 2 && '★★☆☆☆ Below Average'}
              {rating === 1 && '★☆☆☆☆ Poor'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Review (Optional)</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Tell others about your dining experience, favorite dishes, ambiance, or service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
            />
            <span className="char-count">{comment.length} / 1000</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

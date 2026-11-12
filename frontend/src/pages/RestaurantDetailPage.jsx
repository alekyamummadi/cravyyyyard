import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Utensils,
  Star,
  Edit2,
  Trash2,
  MessageSquarePlus,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { restaurantApi, reviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import RatingDistribution from '../components/RatingDistribution';
import ReviewModal from '../components/ReviewModal';

export const RestaurantDetailPage = ({ restaurantId, onBack, onNavigateLogin }) => {
  const { user, isAuthenticated, isCustomer, isAdmin } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const [restRes, revRes] = await Promise.all([
        restaurantApi.getById(restaurantId),
        restaurantApi.getReviews(restaurantId),
      ]);

      if (restRes.success) {
        setRestaurant(restRes.data);
      }
      if (revRes.success) {
        setReviews(revRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchDetails();
    }
  }, [restaurantId]);

  // Handle Create or Update Review
  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        // Update existing review
        await reviewApi.update(editingReview._id || editingReview.id, reviewData);
        setSuccessMsg('Your review has been successfully updated!');
      } else {
        // Create new review
        await restaurantApi.createReview(restaurantId, reviewData);
        setSuccessMsg('Thank you! Your review has been submitted.');
      }
      await fetchDetails();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      if (!editingReview && err.status === 409 && err.data?.reviewId) {
        const reviewsResponse = await restaurantApi.getReviews(restaurantId);
        const existingReview = reviewsResponse.data.find(
          (review) => review._id.toString() === err.data.reviewId.toString()
        );

        if (existingReview) {
          setReviews(reviewsResponse.data);
          setEditingReview(existingReview);
          return false;
        }
      }
      throw err;
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewApi.delete(reviewId);
      setSuccessMsg('Review deleted successfully.');
      await fetchDetails();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading restaurant experience...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Listings
        </button>
        <div className="alert alert-error">
          <span>{error || 'Restaurant not found.'}</span>
        </div>
      </div>
    );
  }

  // Find user's existing review (if customer)
  const userExistingReview = reviews.find(
    (r) => r.customer && user && r.customer._id?.toString() === user.id?.toString()
  );

  return (
    <div className="detail-container">
      {/* Top Navigation */}
      <div className="detail-top-nav">
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Listings
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="restaurant-hero-card">
        <div className="restaurant-hero-image-wrap">
          <img
            src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80'}
            alt={restaurant.name}
            className="restaurant-hero-image"
          />
          <div className="hero-gradient-overlay" />
          <div className="hero-text-overlay">
            <span className="hero-cuisine-tag">{restaurant.cuisine}</span>
            <h1 className="hero-title-text">{restaurant.name}</h1>
            <div className="hero-location-line">
              <MapPin size={16} />
              <span>{restaurant.location}</span>
              {restaurant.address && <span>• {restaurant.address}</span>}
            </div>
          </div>
        </div>

        <div className="restaurant-meta-bar">
          <div className="meta-item">
            <Clock size={16} />
            <div>
              <span className="meta-label">Hours</span>
              <span className="meta-val">{restaurant.openingHours || '9:00 AM - 10:00 PM'}</span>
            </div>
          </div>

          <div className="meta-item">
            <Phone size={16} />
            <div>
              <span className="meta-label">Phone</span>
              <span className="meta-val">{restaurant.phone || '+1 (555) 000-0000'}</span>
            </div>
          </div>

          <div className="meta-item">
            <Utensils size={16} />
            <div>
              <span className="meta-label">Cuisine</span>
              <span className="meta-val">{restaurant.cuisine}</span>
            </div>
          </div>

          <div className="meta-item action-meta">
            {isAuthenticated ? (
              isCustomer ? (
                userExistingReview ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingReview(userExistingReview);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} /> Edit Your Review
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingReview(null);
                      setIsModalOpen(true);
                    }}
                  >
                    <MessageSquarePlus size={16} /> Write a Review
                  </button>
                )
              ) : null
            ) : (
              <button className="btn btn-primary" onClick={onNavigateLogin}>
                Sign In to Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Description & Rating Distribution */}
      <div className="detail-grid">
        <div className="detail-left-col">
          {/* About Section */}
          <div className="content-card">
            <h2 className="section-title">About {restaurant.name}</h2>
            <p className="description-text">
              {restaurant.description ||
                'Welcome to ' + restaurant.name + '. We are dedicated to providing an unforgettable culinary journey using hand-selected ingredients, traditional recipes, and warm, attentive service.'}
            </p>
          </div>

          {/* User's Submitted Review Highlight */}
          {userExistingReview && (
            <div className="user-review-highlight-card">
              <div className="highlight-header">
                <div>
                  <span className="highlight-badge">Your Submitted Review</span>
                  <div style={{ marginTop: '8px' }}>
                    <StarRating rating={userExistingReview.rating} size={20} showNumber />
                  </div>
                </div>
                <div className="highlight-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setEditingReview(userExistingReview);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteReview(userExistingReview._id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
              <p className="user-review-comment">
                "{userExistingReview.comment || 'No written comment provided.'}"
              </p>
              <span className="user-review-date">
                Submitted on {new Date(userExistingReview.createdAt).toLocaleDateString()}
                {userExistingReview.updatedAt !== userExistingReview.createdAt && ' (edited)'}
              </span>
            </div>
          )}

          {/* Customer Reviews List */}
          <div className="content-card reviews-list-card">
            <div className="reviews-header">
              <h3>Community Reviews ({reviews.length})</h3>
              {isCustomer && !userExistingReview && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setEditingReview(null);
                    setIsModalOpen(true);
                  }}
                >
                  <MessageSquarePlus size={14} /> Add Your Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="empty-reviews">
                <Star size={36} color="#d1d5db" />
                <p>No ratings yet. Be the first customer to share your thoughts!</p>
              </div>
            ) : (
              <div className="reviews-stack">
                {reviews.map((rev) => {
                  const isAuthor = user && rev.customer?._id?.toString() === user.id?.toString();
                  return (
                    <div key={rev._id} className="review-card-item">
                      <div className="review-item-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {rev.customer?.name ? rev.customer.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="reviewer-name">
                              {rev.customer?.name || 'Verified Customer'}
                              {isAuthor && <span className="author-tag"> (You)</span>}
                            </span>
                            <div className="review-date">
                              <Calendar size={12} />
                              <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="review-rating-actions">
                          <StarRating rating={rev.rating} size={16} />
                          {/* Permissions: author can edit/delete, Admin can moderate/delete */}
                          {isAuthor && (
                            <div className="author-actions">
                              <button
                                className="icon-action-btn"
                                title="Edit review"
                                onClick={() => {
                                  setEditingReview(rev);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="icon-action-btn delete"
                                title="Delete review"
                                onClick={() => handleDeleteReview(rev._id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          {!isAuthor && isAdmin && (
                            <button
                              className="btn btn-xs btn-outline-danger"
                              title="Administrator review moderation"
                              onClick={() => handleDeleteReview(rev._id)}
                            >
                              <ShieldAlert size={14} /> Remove (Admin)
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="review-comment-text">
                        {rev.comment || <em style={{ color: '#9ca3af' }}>No written feedback provided.</em>}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Rating Distribution Card */}
        <div className="detail-right-col">
          <div className="sticky-sidebar">
            <h3 className="sidebar-title">Rating Summary & Distribution</h3>
            <p className="sidebar-subtitle">
              Calculated dynamically via MongoDB aggregation pipeline.
            </p>

            <RatingDistribution
              averageRating={restaurant.averageRating}
              totalReviews={restaurant.totalReviews}
              distribution={restaurant.ratingDistribution || []}
            />

            <div className="review-policy-box">
              <h4>Review Guidelines</h4>
              <ul>
                <li>Whole number ratings from 1 to 5 stars only.</li>
                <li>One review per customer per restaurant.</li>
                <li>You can update or delete your review anytime.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReviewSubmit}
        initialData={editingReview}
        restaurantName={restaurant.name}
      />
    </div>
  );
};

export default RestaurantDetailPage;

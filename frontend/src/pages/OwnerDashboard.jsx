import React, { useState, useEffect } from 'react';
import { Store, Star, Save, AlertCircle, CheckCircle, MessageSquare, User, Calendar, MapPin, Phone, Clock } from 'lucide-react';
import { restaurantApi } from '../services/api';
import StarRating from '../components/StarRating';
import RatingDistribution from '../components/RatingDistribution';

export const OwnerDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form editable fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    location: '',
    address: '',
    phone: '',
    openingHours: '',
    imageUrl: '',
  });

  const fetchOwnerRestaurant = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await restaurantApi.getMyRestaurant();
      if (res.success && res.data) {
        setRestaurant(res.data);
        setFormData({
          name: res.data.name || '',
          description: res.data.description || '',
          cuisine: res.data.cuisine || '',
          location: res.data.location || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          openingHours: res.data.openingHours || '',
          imageUrl: res.data.imageUrl || '',
        });
      }
    } catch (err) {
      setError(err.message || 'No restaurant currently assigned to your owner account.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerRestaurant();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!restaurant) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await restaurantApi.update(restaurant._id, formData);
      if (res.success) {
        setSuccess('Restaurant details updated successfully!');
        setRestaurant((prev) => ({ ...prev, ...res.data }));
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update restaurant details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your restaurant portal...</p>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <p style={{ marginTop: '12px', color: '#6b7280' }}>
          Please contact the platform administrator to assign a restaurant to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <span className="portal-badge">Restaurant Owner Portal</span>
          <h1 className="dashboard-title">{restaurant.name}</h1>
          <p className="dashboard-subtitle">
            Manage your store profile, observe guest ratings, and review customer feedback in real-time.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Average Rating</span>
          <div className="metric-value-row">
            <span className="metric-number">
              {restaurant.averageRating !== null ? restaurant.averageRating.toFixed(1) : '—'}
            </span>
            <StarRating rating={restaurant.averageRating || 0} size={18} />
          </div>
          <span className="metric-hint">Calculated across all customer reviews</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Reviews</span>
          <span className="metric-number">{restaurant.totalReviews}</span>
          <span className="metric-hint">Verified customer submissions</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Cuisine Category</span>
          <span className="metric-number-text">{restaurant.cuisine}</span>
          <span className="metric-hint">{restaurant.location}</span>
        </div>
      </div>

      <div className="owner-layout-grid">
        {/* Left Column: Edit Details Form */}
        <div className="owner-form-card">
          <div className="card-header-styled">
            <Store size={20} className="header-icon" />
            <div>
              <h3>Update Restaurant Profile</h3>
              <p>Changes will be instantly reflected on public listings</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="styled-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">Restaurant Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Cuisine Type *</label>
                <input
                  type="text"
                  name="cuisine"
                  className="form-control"
                  value={formData.cuisine}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">City / Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Street Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operating Hours</label>
              <input
                type="text"
                name="openingHours"
                className="form-control"
                placeholder="e.g. 11:30 AM - 10:30 PM"
                value={formData.openingHours}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input
                type="url"
                name="imageUrl"
                className="form-control"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">About / Description</label>
              <textarea
                name="description"
                rows={4}
                className="form-control"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving changes...' : 'Save Permitted Details'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Rating Distribution & Reviews by Customer */}
        <div className="owner-reviews-column">
          <div className="content-card">
            <h3>Rating Distribution</h3>
            <p className="card-subtitle-small">Live aggregation metrics</p>
            <RatingDistribution
              averageRating={restaurant.averageRating}
              totalReviews={restaurant.totalReviews}
              distribution={restaurant.ratingDistribution || []}
            />
          </div>

          <div className="content-card" style={{ marginTop: '24px' }}>
            <div className="reviews-header">
              <h3>Customer Reviews ({restaurant.reviews?.length || 0})</h3>
            </div>

            {!restaurant.reviews || restaurant.reviews.length === 0 ? (
              <p className="empty-reviews-text">No customer reviews recorded yet.</p>
            ) : (
              <div className="reviews-stack">
                {restaurant.reviews.map((rev) => (
                  <div key={rev._id} className="review-card-item">
                    <div className="review-item-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {rev.customer?.name ? rev.customer.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <span className="reviewer-name">{rev.customer?.name || 'Customer'}</span>
                          <span className="reviewer-email">{rev.customer?.email}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StarRating rating={rev.rating} size={15} />
                        <span className="review-date-block">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="review-comment-text">
                      {rev.comment ? `"${rev.comment}"` : <em style={{ color: '#9ca3af' }}>No comment provided</em>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

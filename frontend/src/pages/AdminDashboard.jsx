import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Store,
  MessageSquare,
  Star,
  UserPlus,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Edit2,
  X,
} from 'lucide-react';
import { adminApi, restaurantApi, reviewApi } from '../services/api';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'restaurants' | 'reviews' | 'create-owner'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Restaurant search
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [restaurantLocation, setRestaurantLocation] = useState('');
  const [restaurantCuisine, setRestaurantCuisine] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserForm, setEditingUserForm] = useState({ name: '', email: '', role: 'customer' });

  // Create Owner Form State
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    password: '',
    restaurantId: '',
  });

  // Create Restaurant Form State
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    cuisine: '',
    location: '',
    address: '',
    phone: '',
    description: '',
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes, restRes, revRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        restaurantApi.getAll(),
        adminApi.getAllReviews(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (restRes.success) setRestaurants(restRes.data);
      if (revRes.success) setReviews(revRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load administrator portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter users
  const handleUserSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApi.getUsers({ search: userSearch, role: userRoleFilter });
      if (res.success) setUsers(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestaurantSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await restaurantApi.getAll({
        name: restaurantSearch,
        location: restaurantLocation,
        cuisine: restaurantCuisine,
      });
      if (res.success) setRestaurants(res.data);
    } catch (err) {
      setError(err.message || 'Failed to search restaurants');
    }
  };

  const clearRestaurantSearch = async () => {
    setRestaurantSearch('');
    setRestaurantLocation('');
    setRestaurantCuisine('');
    try {
      const res = await restaurantApi.getAll();
      if (res.success) setRestaurants(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load restaurants');
    }
  };

  const startEditingUser = (user) => {
    setEditingUserId(user._id);
    setEditingUserForm({ name: user.name, email: user.email, role: user.role });
  };

  const cancelEditingUser = () => {
    setEditingUserId(null);
    setEditingUserForm({ name: '', email: '', role: 'customer' });
  };

  const handleUpdateUser = async (userId) => {
    setError('');
    setSuccess('');
    try {
      await adminApi.updateUser(userId, editingUserForm);
      cancelEditingUser();
      await fetchDashboardData();
      setSuccess('User updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? Their reviews will be removed and restaurant assignments cleared.`)) return;
    setError('');
    setSuccess('');
    try {
      await adminApi.deleteUser(user._id);
      if (editingUserId === user._id) cancelEditingUser();
      await fetchDashboardData();
      setSuccess('User deleted successfully.');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  // Create Owner submit
  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await adminApi.createOwner(ownerForm);
      if (res.success) {
        setSuccess('Restaurant Owner account created successfully!');
        setOwnerForm({ name: '', email: '', password: '', restaurantId: '' });
        fetchDashboardData();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create owner');
    }
  };

  // Create New Restaurant submit
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await restaurantApi.create(newRestaurant);
      if (res.success) {
        setSuccess('Restaurant added successfully!');
        setNewRestaurant({ name: '', cuisine: '', location: '', address: '', phone: '', description: '' });
        fetchDashboardData();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add restaurant');
    }
  };

  // Assign Owner to Restaurant
  const handleAssignOwner = async (restaurantId, ownerId) => {
    try {
      setError('');
      setSuccess('');
      const res = await adminApi.assignOwner(restaurantId, ownerId || null);
      if (res.success) {
        setSuccess(res.message);
        fetchDashboardData();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to assign owner');
    }
  };

  // Delete Restaurant
  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant and all its reviews?')) return;
    try {
      await restaurantApi.delete(restaurantId);
      setSuccess('Restaurant deleted.');
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove Inappropriate Review (Admin moderation)
  const handleModerateReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review as inappropriate?')) return;
    try {
      await reviewApi.delete(reviewId);
      setSuccess('Inappropriate review removed from platform.');
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Available owners list for assigning
  const availableOwners = users.filter((u) => u.role === 'owner' || u.role === 'customer');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <span className="portal-badge badge-admin">Master Control Panel</span>
          <h1 className="dashboard-title">Platform Administration</h1>
          <p className="dashboard-subtitle">
            System overview, role management, restaurant assignments, and content moderation.
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

      {/* Admin KPI Metric Cards (Mandatory Dashboard Requirements) */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <span className="metric-label">Total Users</span>
          <span className="metric-number">{stats?.totalUsers ?? '—'}</span>
          <span className="metric-hint">
            {stats?.roleBreakdown?.customer || 0} Customers • {stats?.roleBreakdown?.owner || 0} Owners • {stats?.roleBreakdown?.admin || 0} Admins
          </span>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Store size={24} />
          </div>
          <span className="metric-label">Total Restaurants</span>
          <span className="metric-number">{stats?.totalRestaurants ?? '—'}</span>
          <span className="metric-hint">Across all supported cities</span>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <MessageSquare size={24} />
          </div>
          <span className="metric-label">Total Reviews</span>
          <span className="metric-number">{stats?.totalReviews ?? '—'}</span>
          <span className="metric-hint">Authentic user ratings</span>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ backgroundColor: '#fdf2f8', color: '#db2777' }}>
            <Star size={24} />
          </div>
          <span className="metric-label">Average Platform Rating</span>
          <div className="metric-value-row">
            <span className="metric-number">
              {stats?.averagePlatformRating ? stats.averagePlatformRating.toFixed(2) : '0.00'}
            </span>
            <span className="score-out-of">/ 5.0</span>
          </div>
          <span className="metric-hint">Calculated via MongoDB aggregation</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Quick Actions
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'restaurants' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          Restaurants & Owners ({restaurants.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'create-owner' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('create-owner')}
        >
          + Create Restaurant Owner
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Review Moderation ({reviews.length})
        </button>
      </div>

      {/* TAB CONTENT: Overview / Quick Actions */}
      {activeTab === 'overview' && (
        <div className="admin-tab-pane">
          <div className="grid-2-col">
            <div className="content-card">
              <h3>Add New Restaurant</h3>
              <p className="card-subtitle-small">Register a new dining establishment on the platform</p>
              <form onSubmit={handleCreateRestaurant} className="styled-form">
                <div className="form-group">
                  <label className="form-label">Restaurant Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Cuisine *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Italian, Japanese"
                      value={newRestaurant.cuisine}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Location / City *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. New York, Chicago"
                      value={newRestaurant.location}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newRestaurant.address}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Create Restaurant
                </button>
              </form>
            </div>

            <div className="content-card">
              <h3>Platform Health & Policies</h3>
              <div className="info-list" style={{ marginTop: '16px' }}>
                <div className="info-list-item">
                  <strong>Unique Reviews Rule:</strong>
                  <span>Enforced at MongoDB schema level via compound index `(customer + restaurant)`.</span>
                </div>
                <div className="info-list-item">
                  <strong>Rating Strictness:</strong>
                  <span>Only whole integers between 1 and 5 accepted. Decimals and invalid numbers rejected with 400 Bad Request.</span>
                </div>
                <div className="info-list-item">
                  <strong>Access Control (RBAC):</strong>
                  <span>Enforced via JWT Bearer tokens and Express authorization middleware. Non-admin and unauthorized access return 401 or 403.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: User Management */}
      {activeTab === 'users' && (
        <div className="admin-tab-pane">
          <div className="content-card">
            <div className="table-filter-bar">
              <form onSubmit={handleUserSearch} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <div className="search-input-group" style={{ flex: 1 }}>
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <select
                  className="form-control"
                  style={{ width: '150px' }}
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="owner">Restaurant Owner</option>
                  <option value="admin">Administrator</option>
                </select>
                <button type="submit" className="btn btn-secondary">
                  Filter
                </button>
              </form>
            </div>

            <div className="styled-table-wrap">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Assigned Role</th>
                    <th>Registered Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isEditing = editingUserId === u._id;
                    const isCurrentUser = currentUser?.id === u._id;
                    return (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>
                          {isEditing ? (
                            <input
                              className="form-control"
                              value={editingUserForm.name}
                              onChange={(e) => setEditingUserForm({ ...editingUserForm, name: e.target.value })}
                              aria-label="User name"
                            />
                          ) : u.name}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              className="form-control"
                              type="email"
                              value={editingUserForm.email}
                              onChange={(e) => setEditingUserForm({ ...editingUserForm, email: e.target.value })}
                              aria-label="User email"
                            />
                          ) : u.email}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              className="form-control"
                              value={editingUserForm.role}
                              onChange={(e) => setEditingUserForm({ ...editingUserForm, role: e.target.value })}
                              disabled={isCurrentUser}
                              aria-label="User role"
                            >
                              <option value="customer">Customer</option>
                              <option value="owner">Restaurant Owner</option>
                              <option value="admin">Administrator</option>
                            </select>
                          ) : (
                            <span className={`role-pill role-${u.role}`}>{u.role}</span>
                          )}
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-xs btn-primary" onClick={() => handleUpdateUser(u._id)}>
                                Save
                              </button>
                              <button className="btn btn-xs btn-secondary" onClick={cancelEditingUser}>
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-xs btn-secondary" onClick={() => startEditingUser(u)}>
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                className="btn btn-xs btn-outline-danger"
                                onClick={() => handleDeleteUser(u)}
                                disabled={isCurrentUser}
                                title={isCurrentUser ? 'You cannot delete your own account' : 'Delete user'}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Restaurants & Owner Assignment */}
      {activeTab === 'restaurants' && (
        <div className="admin-tab-pane">
          <div className="content-card">
            <h3>Manage Restaurants & Owner Assignments</h3>
            <p className="card-subtitle-small">
              Assign or change the Restaurant Owner for each dining establishment
            </p>

            <form
              onSubmit={handleRestaurantSearch}
              className="table-filter-bar"
              style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '16px' }}
            >
              <input
                className="form-control"
                placeholder="Restaurant name"
                value={restaurantSearch}
                onChange={(e) => setRestaurantSearch(e.target.value)}
                aria-label="Search restaurant name"
              />
              <input
                className="form-control"
                placeholder="Location"
                value={restaurantLocation}
                onChange={(e) => setRestaurantLocation(e.target.value)}
                aria-label="Filter restaurant location"
              />
              <input
                className="form-control"
                placeholder="Cuisine"
                value={restaurantCuisine}
                onChange={(e) => setRestaurantCuisine(e.target.value)}
                aria-label="Filter restaurant cuisine"
              />
              <button type="submit" className="btn btn-secondary">Search</button>
              <button type="button" className="btn btn-secondary" onClick={clearRestaurantSearch}>Clear</button>
            </form>

            <div className="styled-table-wrap">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Restaurant</th>
                    <th>Cuisine & Location</th>
                    <th>Average Rating</th>
                    <th>Assigned Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((rest) => (
                    <tr key={rest._id}>
                      <td style={{ fontWeight: 600 }}>{rest.name}</td>
                      <td>
                        {rest.cuisine} • {rest.location}
                      </td>
                      <td>
                        {rest.totalReviews > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                            <span>{rest.averageRating.toFixed(1)} ({rest.totalReviews})</span>
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>No ratings yet</span>
                        )}
                      </td>
                      <td>
                        <select
                          className="form-control select-owner"
                          value={rest.owner?._id || rest.owner || ''}
                          onChange={(e) => handleAssignOwner(rest._id, e.target.value)}
                        >
                          <option value="">-- Unassigned --</option>
                          {availableOwners.map((owner) => (
                            <option key={owner._id} value={owner._id}>
                              {owner.name} ({owner.email}) - {owner.role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-xs btn-outline-danger"
                          onClick={() => handleDeleteRestaurant(rest._id)}
                          title="Delete restaurant"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Create Owner Account */}
      {activeTab === 'create-owner' && (
        <div className="admin-tab-pane">
          <div className="content-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="card-header-styled">
              <UserPlus size={22} className="header-icon" />
              <div>
                <h3>Create Restaurant Owner Account</h3>
                <p>Register a new owner and optionally assign them to a restaurant immediately</p>
              </div>
            </div>

            <form onSubmit={handleCreateOwner} className="styled-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Giovanni Rossi"
                  value={ownerForm.name}
                  onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="owner@restaurant.com"
                  value={ownerForm.email}
                  onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password * (8-16 chars, Uppercase, Lowercase, Number, Symbol)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Owner@1234"
                  value={ownerForm.password}
                  onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign to Restaurant (Optional)</label>
                <select
                  className="form-control"
                  value={ownerForm.restaurantId}
                  onChange={(e) => setOwnerForm({ ...ownerForm, restaurantId: e.target.value })}
                >
                  <option value="">-- Assign Later --</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.location})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Owner Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Review Moderation */}
      {activeTab === 'reviews' && (
        <div className="admin-tab-pane">
          <div className="content-card">
            <h3>Content Moderation: All Community Reviews</h3>
            <p className="card-subtitle-small">
              Review flagged or inappropriate feedback and remove from the public platform
            </p>

            <div className="reviews-stack" style={{ marginTop: '20px' }}>
              {reviews.map((rev) => (
                <div key={rev._id} className="review-card-item">
                  <div className="review-item-header">
                    <div>
                      <span className="reviewer-name">{rev.customer?.name || 'Customer'}</span>
                      <span className="review-restaurant-label">
                        reviewed <strong>{rev.restaurant?.name || 'Restaurant'}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <StarRating rating={rev.rating} size={16} />
                      <button
                        className="btn btn-xs btn-outline-danger"
                        onClick={() => handleModerateReview(rev._id)}
                      >
                        <Trash2 size={14} /> Remove Inappropriate Review
                      </button>
                    </div>
                  </div>

                  <p className="review-comment-text">
                    {rev.comment ? `"${rev.comment}"` : <em style={{ color: '#9ca3af' }}>No written text</em>}
                  </p>
                  <span className="review-date-block">
                    Submitted on {new Date(rev.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

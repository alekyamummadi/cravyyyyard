const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Auth API
export const authApi = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => apiRequest('/auth/me'),
};

// Restaurant API
export const restaurantApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.name) query.append('name', params.name);
    if (params.location) query.append('location', params.location);
    if (params.cuisine) query.append('cuisine', params.cuisine);
    if (params.sort) query.append('sort', params.sort);
    const qs = query.toString();
    return apiRequest(`/restaurants${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiRequest(`/restaurants/${id}`),
  create: (data) =>
    apiRequest('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    apiRequest(`/restaurants/${id}`, {
      method: 'DELETE',
    }),
  getMyRestaurant: () => apiRequest('/restaurants/owner/my-restaurant'),
  getReviews: (id) => apiRequest(`/restaurants/${id}/reviews`),
  createReview: (id, reviewData) =>
    apiRequest(`/restaurants/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};

// Review API
export const reviewApi = {
  update: (id, reviewData) =>
    apiRequest(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    }),
  delete: (id) =>
    apiRequest(`/reviews/${id}`, {
      method: 'DELETE',
    }),
};

// Admin API
export const adminApi = {
  getStats: () => apiRequest('/admin/dashboard'),
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    const qs = query.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  updateUser: (id, userData) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  deleteUser: (id) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
  createOwner: (ownerData) =>
    apiRequest('/admin/owners', {
      method: 'POST',
      body: JSON.stringify(ownerData),
    }),
  assignOwner: (restaurantId, ownerId) =>
    apiRequest(`/admin/restaurants/${restaurantId}/assign-owner`, {
      method: 'PUT',
      body: JSON.stringify({ ownerId }),
    }),
  getAllReviews: () => apiRequest('/admin/reviews'),
};

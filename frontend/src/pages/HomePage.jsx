import React, { useState, useEffect } from 'react';
import { Search, MapPin, Utensils, Star, SlidersHorizontal, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { restaurantApi } from '../services/api';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

export const HomePage = ({ onSelectRestaurant }) => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sort, setSort] = useState('');

  const cuisinesList = ['All', 'South Indian'];

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (name) params.name = name;
      if (location) params.location = location;
      if (cuisine && cuisine !== 'All') params.cuisine = cuisine;
      if (sort) params.sort = sort;

      const res = await restaurantApi.getAll(params);
      if (res.success) {
        setRestaurants(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [cuisine, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleClearFilters = () => {
    setName('');
    setLocation('');
    setCuisine('All');
    setSort('');
    restaurantApi.getAll().then((res) => {
      if (res.success) setRestaurants(res.data);
    });
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-kicker"><Sparkles size={15} /> SOUTH INDIAN COMFORT, SERVED DAILY</div>
          <h1 className="hero-title">Find your<br /><span>favorite tiffin.</span></h1>
          <p className="hero-subtitle">
            From crisp masala dosa and soft idli to Kerala appam and freshly poured filter coffee, discover local spots serving the flavors you love.
          </p>

          <form className="search-bar-card" onSubmit={handleSearchSubmit}>
            <div className="search-input-group">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search restaurant name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="search-divider" />

            <div className="search-input-group">
              <MapPin size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="City or neighborhood"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary search-submit-btn">
              Explore restaurants
            </button>
          </form>
        </div>
      </section>

      {/* Filter Chips & Sorting */}
      <div className="filter-bar">
        <div className="cuisine-chips">
          <span className="filter-label">Explore by cuisine:</span>
          {cuisinesList.map((c) => (
            <button
              key={c}
              className={`chip ${cuisine === c || (!cuisine && c === 'All') ? 'chip-active' : ''}`}
              onClick={() => setCuisine(c === 'All' ? '' : c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="sort-controls">
          <SlidersHorizontal size={16} />
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort: Featured</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="reviews_desc">Most Reviewed</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>

          {(name || location || cuisine || sort) && (
            <button className="btn-link" onClick={handleClearFilters}>
              <RefreshCw size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Restaurant Listings */}
      <div className="listings-section">
        <div className="listings-header">
          <div>
            <span className="listings-eyebrow">SOUTH INDIAN FAVORITES & MORE</span>
            <h2>Find a table to love</h2>
          </div>
          <span className="listings-count">{restaurants.length} restaurant{restaurants.length === 1 ? '' : 's'} to explore</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Finding delicious places for you...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="empty-state">
            <Utensils size={48} className="empty-icon" />
            <h3>No restaurants match those filters</h3>
            <p>Try another restaurant name or city, or clear the filters to see all available spots.</p>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="restaurants-grid">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="restaurant-card"
                onClick={() => onSelectRestaurant(restaurant._id)}
              >
                <div className="card-image-wrap">
                  <img
                    src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'}
                    alt={restaurant.name}
                    className="card-image"
                    loading="lazy"
                  />
                  <span className="card-cuisine-badge">{restaurant.cuisine}</span>
                  {restaurant.customerRating && (
                    <div className="customer-rated-tag" title="Your submitted rating">
                      <CheckCircle2 size={14} />
                      <span>You rated: {restaurant.customerRating}★</span>
                    </div>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="card-title">{restaurant.name}</h3>

                  <div className="card-location">
                    <MapPin size={14} />
                    <span>{restaurant.location}</span>
                    {restaurant.address && <span className="address-sub">• {restaurant.address}</span>}
                  </div>

                  <p className="card-description">
                    {restaurant.description || 'Discover welcoming local dining and regional favorites, from savory tiffin to freshly brewed filter coffee.'}
                  </p>

                  <div className="card-footer">
                    <div className="rating-block">
                      {restaurant.totalReviews > 0 ? (
                        <>
                          <div className="rating-badge">
                            <Star size={14} fill="#ffffff" stroke="#ffffff" />
                            <span>{restaurant.averageRating.toFixed(1)}</span>
                          </div>
                          <span className="reviews-text">
                            ({restaurant.totalReviews} review{restaurant.totalReviews > 1 ? 's' : ''})
                          </span>
                        </>
                      ) : (
                        <span className="no-ratings-text">No ratings yet</span>
                      )}
                    </div>

                    <button className="btn btn-sm btn-outline-primary">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

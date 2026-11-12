import React from 'react';
import { ChefHat, ShieldCheck, Store, UserCheck, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentView, setCurrentView }) => {
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="brand" onClick={() => setCurrentView('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo">
            <ChefHat size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
          <span className="brand-title">Cravy Yard</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${currentView === 'home' || currentView.startsWith('restaurant-') ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            Explore
          </button>

          {isOwner && (
            <button
              className={`nav-btn ${currentView === 'owner' ? 'active' : ''}`}
              onClick={() => setCurrentView('owner')}
            >
              <Store size={16} />
              <span>My Restaurant</span>
            </button>
          )}

          {isAdmin && (
            <button
              className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              <ShieldCheck size={16} />
              <span>Admin Dashboard</span>
            </button>
          )}
        </nav>

        <div className="nav-auth">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-badge">
                <span className="user-name">{user?.name}</span>
                <span className={`role-pill role-${user?.role}`}>
                  {user?.role === 'admin' && 'Administrator'}
                  {user?.role === 'owner' && 'Restaurant Owner'}
                  {user?.role === 'customer' && 'Customer'}
                </span>
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  logout();
                  setCurrentView('home');
                }}
                title="Log Out"
              >
                <LogOut size={16} />
                <span className="hide-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className={`btn btn-sm btn-outline ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => setCurrentView('login')}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
              <button
                className={`btn btn-sm btn-primary ${currentView === 'register' ? 'active' : ''}`}
                onClick={() => setCurrentView('register')}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

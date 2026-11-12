import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const AppContent = () => {
  const { user, isOwner, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const handleSelectRestaurant = (id) => {
    setSelectedRestaurantId(id);
    setCurrentView(`restaurant-${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (loggedInUser) => {
    if (loggedInUser.role === 'admin') {
      setCurrentView('admin');
    } else if (loggedInUser.role === 'owner') {
      setCurrentView('owner');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <div className="app-layout">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="main-content">
        {currentView === 'home' && (
          <HomePage onSelectRestaurant={handleSelectRestaurant} />
        )}

        {currentView.startsWith('restaurant-') && (
          <RestaurantDetailPage
            restaurantId={selectedRestaurantId}
            onBack={() => setCurrentView('home')}
            onNavigateLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigateRegister={() => setCurrentView('register')}
            onSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onNavigateLogin={() => setCurrentView('login')}
            onSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'owner' && (
          isOwner ? (
            <OwnerDashboard />
          ) : (
            <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <h2>Access Denied</h2>
              <p style={{ color: '#6b7280', margin: '12px 0 20px' }}>
                You must be logged in as a Restaurant Owner to access this portal.
              </p>
              <button className="btn btn-primary" onClick={() => setCurrentView('login')}>
                Sign In as Owner
              </button>
            </div>
          )
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <h2>Access Denied</h2>
              <p style={{ color: '#6b7280', margin: '12px 0 20px' }}>
                Administrator authorization is required to access this dashboard.
              </p>
              <button className="btn btn-primary" onClick={() => setCurrentView('login')}>
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      <footer className="footer">
        <p>© 2026 Cravy Yard — Find a place to love.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '4px', color: '#9ca3af' }}>
          Role-Based Access Control • MongoDB Aggregation Pipelines • Compound Unique Indexing
        </p>
      </footer>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

import React, { useState } from 'react';
import {
  LogIn,
  Key,
  Mail,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Store,
  UserRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onNavigateRegister, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOpen, setDemoOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setDemoOpen(false);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <LogIn size={26} color="#35664b" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your Cravy Yard account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-control with-icon"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Key size={18} className="input-icon" />
              <input
                type="password"
                className="form-control with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <section className="quick-access">
          <button
            type="button"
            className="quick-access-toggle"
            aria-expanded={demoOpen}
            aria-controls="quick-access-panel"
            onClick={() => setDemoOpen((open) => !open)}
          >
            <span className="quick-access-heading">
              <span className="quick-access-mark"><Sparkles size={17} /></span>
              <span>
                <strong>Try a demo account</strong>
                <small>Explore Cravy Yard with a sample role</small>
              </span>
            </span>
            <ChevronDown className={demoOpen ? 'quick-access-chevron is-open' : 'quick-access-chevron'} size={18} />
          </button>

          <div id="quick-access-panel" className="quick-access-panel" hidden={!demoOpen}>
            <p className="quick-access-hint">Choose a role to fill in its demo credentials.</p>
            <div className="quick-account-list">
              <button
                type="button"
                className="quick-account admin"
                disabled={loading}
                onClick={() => handleQuickLogin('admin@platform.com', 'Admin@1234')}
              >
                <span className="quick-account-icon"><ShieldCheck size={17} /></span>
                <span className="quick-account-copy"><strong>Administrator</strong><small>Platform management</small></span>
                <ArrowRight size={16} className="quick-account-arrow" />
              </button>
              <button
                type="button"
                className="quick-account owner"
                disabled={loading}
                onClick={() => handleQuickLogin('owner.mario@platform.com', 'Owner@1234')}
              >
                <span className="quick-account-icon"><Store size={17} /></span>
                <span className="quick-account-copy"><strong>Restaurant owner</strong><small>Manage a restaurant listing</small></span>
                <ArrowRight size={16} className="quick-account-arrow" />
              </button>
              <button
                type="button"
                className="quick-account customer"
                disabled={loading}
                onClick={() => handleQuickLogin('customer.alex@example.com', 'Customer@1234')}
              >
                <span className="quick-account-icon"><UserRound size={17} /></span>
                <span className="quick-account-copy"><strong>Customer</strong><small>Discover and review places</small></span>
                <ArrowRight size={16} className="quick-account-arrow" />
              </button>
            </div>
          </div>
        </section>

        <div className="auth-footer">
          <span>Don't have an account yet?</span>
          <button type="button" className="btn-link" onClick={onNavigateRegister}>
            Register as Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

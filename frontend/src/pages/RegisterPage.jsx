import React, { useState } from 'react';
import { UserPlus, User, Mail, Key, AlertCircle, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = ({ onNavigateLogin, onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password rule tests
  const rules = [
    { label: '8 to 16 characters', met: password.length >= 8 && password.length <= 16 },
    { label: 'At least 1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least 1 lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least 1 number (0-9)', met: /[0-9]/.test(password) },
    { label: 'At least 1 special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const allRulesMet = rules.every((r) => r.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allRulesMet) {
      setError('Please satisfy all password security requirements before proceeding.');
      return;
    }

    setLoading(true);

    try {
      const user = await register({ name, email, password });
      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus size={26} color="#35664b" />
          </div>
          <h2 className="auth-title">Create Customer Account</h2>
          <p className="auth-subtitle">Join Cravy Yard to find and share local favorites</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-control with-icon"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="Create secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Password Security Requirement Checklist */}
            <div className="password-checklist">
              <span className="checklist-heading">Password Requirements:</span>
              <div className="checklist-items">
                {rules.map((rule, idx) => (
                  <div key={idx} className={`checklist-item ${rule.met ? 'item-met' : 'item-unmet'}`}>
                    {rule.met ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !allRulesMet}
          >
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button type="button" className="btn-link" onClick={onNavigateLogin}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

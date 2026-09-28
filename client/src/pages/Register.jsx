import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { TrendingUp, User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import '../login.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password;

    try {
      const response = await api.post('/register', {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword
      });
      toast.success(response.data.message || 'Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response?.data === 'string' && err.response.data.includes('<!DOCTYPE html>')) {
        errorMessage = 'Backend API endpoint not reachable. Please verify VITE_API_BASE_URL is configured in your deployment settings.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to backend server. Make sure the server on port 5000 is running.';
      } else if (err.response?.status === 404 || err.response?.status === 405) {
        errorMessage = 'API endpoint not found. Backend server may not be deployed or connected.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/">
          <div className="brand-icon">
            <TrendingUp size={24} color="#38bdf8" />
          </div>
          <span>Portfolio<span style={{ color: '#38bdf8' }}>Pro</span></span>
        </Link>
      </div>

      <div className="auth-box">
        <div className="auth-header">
          <h2>Create Investor Account</h2>
          <p>Join institutional investors tracking real-time stock portfolios</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="e.g. Warren Buffett" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              placeholder="e.g. warren@berkshire.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Create a strong password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Creating Portfolio...' : 'Create Account & Start Tracking'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>

        <div className="auth-security-badge">
          <ShieldCheck size={14} color="#34d399" />
          <span>Zero Knowledge Data Protection</span>
        </div>
      </div>

      <div className="back-home-link">
        <Link to="/">
          <ArrowLeft size={16} /> Back to Homepage
        </Link>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { TrendingUp, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import '../login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const cleanIdentifier = username.trim();
    const cleanPassword = password;

    try {
      const response = await api.post('/login', {
        email: cleanIdentifier,
        username: cleanIdentifier,
        password: cleanPassword
      });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem(
          'username',
          response.data.user?.name || response.data.user?.username || cleanIdentifier
        );
        toast.success(response.data.message || 'Successfully logged in!');
        navigate('/portfolio');
      } else {
        const errStr = 'Login failed: Authentication token was not returned.';
        setErrorMessage(errStr);
        toast.error(errStr);
      }
    } catch (err) {
      console.error('Login error:', err);
      let message = 'Invalid credentials. Please check your username/email and password.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        message = 'Cannot connect to backend server. Make sure port 5000 is active.';
      }
      setErrorMessage(message);
      toast.error(message);
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
          <h2>Investor Sign In</h2>
          <p>Securely access your institutional-grade portfolio terminal</p>
        </div>

        {/* Inline Error Message Alert */}
        {errorMessage && (
          <div className="auth-alert-error" role="alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input 
              id="username"
              type="text" 
              placeholder="e.g. investor@wealth.com" 
              value={username} 
              onChange={e => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage('');
              }} 
              required 
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your security password" 
                value={password} 
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }} 
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

          <div className="forgot-link-wrapper">
            <a 
              href="#forgot" 
              onClick={(e) => { 
                e.preventDefault(); 
                toast.info("If you forgot your password, please register a new account."); 
              }}
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Authenticating Terminal...' : 'Sign In to Portfolio Terminal'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>New to PortfolioPro? <Link to="/register">Create an account</Link></p>
        </div>

        <div className="auth-security-badge">
          <ShieldCheck size={14} color="#34d399" />
          <span>256-Bit Financial Encryption Active</span>
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

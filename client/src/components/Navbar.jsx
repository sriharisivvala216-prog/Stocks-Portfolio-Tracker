import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  PieChart, 
  Activity, 
  Bookmark, 
  Newspaper, 
  Calculator, 
  Rocket, 
  PlusCircle, 
  LogOut, 
  User, 
  Home,
  Layers,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Real-time market ticker simulation
  const [tickerPrices, setTickerPrices] = useState({
    sp500: { val: 5618.25, chg: 0.78 },
    nasdaq: { val: 17992.10, chg: 1.15 },
    nifty: { val: 25394.80, chg: 0.62 },
    btc: { val: 64280.00, chg: 2.45 }
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) setUsername(savedUser);

    const tickerInterval = setInterval(() => {
      setTickerPrices(prev => ({
        sp500: { val: Number((prev.sp500.val + (Math.random() * 2 - 1)).toFixed(2)), chg: Number((prev.sp500.chg + (Math.random() * 0.1 - 0.05)).toFixed(2)) },
        nasdaq: { val: Number((prev.nasdaq.val + (Math.random() * 5 - 2.5)).toFixed(2)), chg: Number((prev.nasdaq.chg + (Math.random() * 0.1 - 0.05)).toFixed(2)) },
        nifty: { val: Number((prev.nifty.val + (Math.random() * 4 - 2)).toFixed(2)), chg: Number((prev.nifty.chg + (Math.random() * 0.1 - 0.05)).toFixed(2)) },
        btc: { val: Number((prev.btc.val + (Math.random() * 40 - 20)).toFixed(2)), chg: Number((prev.btc.chg + (Math.random() * 0.2 - 0.1)).toFixed(2)) }
      }));
    }, 3000);

    return () => clearInterval(tickerInterval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const navLinks = [
    { path: '/homepage', label: 'Home', icon: Home },
    { path: '/portfolio', label: 'Portfolio', icon: PieChart },
    { path: '/screener', label: 'Screener', icon: Activity },
    { path: '/analytics', label: 'AI Analytics', icon: Layers },
    { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
    { path: '/news', label: 'News & AI', icon: Newspaper },
    { path: '/calculator', label: 'SIP Growth', icon: Calculator },
    { path: '/ipo', label: 'IPO Tracker', icon: Rocket }
  ];

  const isActive = (path) => {
    if (path === '/homepage' && (location.pathname === '/' || location.pathname === '/homepage')) return true;
    return location.pathname === path;
  };

  return (
    <div className="terminal-header-wrapper">
      {/* Live Market Bar */}
      <div className="live-ticker-strip">
        <div className="ticker-badge-live">
          <span className="live-dot-pulse"></span>
          <span>LIVE MARKETS</span>
        </div>
        <div className="ticker-items-scroll">
          <span className="ticker-pill">
            <span className="ticker-name">S&P 500</span>
            <span className="ticker-price">${tickerPrices.sp500.val.toLocaleString()}</span>
            <span className={`ticker-change ${tickerPrices.sp500.chg >= 0 ? 'pos' : 'neg'}`}>
              {tickerPrices.sp500.chg >= 0 ? '+' : ''}{tickerPrices.sp500.chg}%
            </span>
          </span>
          <span className="ticker-pill">
            <span className="ticker-name">NASDAQ</span>
            <span className="ticker-price">${tickerPrices.nasdaq.val.toLocaleString()}</span>
            <span className={`ticker-change ${tickerPrices.nasdaq.chg >= 0 ? 'pos' : 'neg'}`}>
              {tickerPrices.nasdaq.chg >= 0 ? '+' : ''}{tickerPrices.nasdaq.chg}%
            </span>
          </span>
          <span className="ticker-pill">
            <span className="ticker-name">NIFTY 50</span>
            <span className="ticker-price">₹{tickerPrices.nifty.val.toLocaleString()}</span>
            <span className={`ticker-change ${tickerPrices.nifty.chg >= 0 ? 'pos' : 'neg'}`}>
              {tickerPrices.nifty.chg >= 0 ? '+' : ''}{tickerPrices.nifty.chg}%
            </span>
          </span>
          <span className="ticker-pill">
            <span className="ticker-name">BTC/USD</span>
            <span className="ticker-price">${tickerPrices.btc.val.toLocaleString()}</span>
            <span className={`ticker-change ${tickerPrices.btc.chg >= 0 ? 'pos' : 'neg'}`}>
              {tickerPrices.btc.chg >= 0 ? '+' : ''}{tickerPrices.btc.chg}%
            </span>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="terminal-navbar">
        <div className="terminal-nav-left">
          <Link to="/" className="terminal-brand">
            <div className="brand-logo-icon">
              <TrendingUp size={22} color="#38bdf8" />
            </div>
            <span className="brand-text">Portfolio<span className="brand-highlight">Pro</span></span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="terminal-nav-links">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`terminal-nav-item ${active ? 'active' : ''}`}
              >
                <Icon size={16} className="nav-icon" />
                <span>{link.label}</span>
                {active && <span className="active-glow-bar"></span>}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & User Profile */}
        <div className="terminal-nav-right">
          <Link to="/input" className="btn-quick-add">
            <PlusCircle size={16} />
            <span>+ Add Stock</span>
          </Link>

          {username ? (
            <div className="user-profile-widget">
              <div className="user-avatar-badge">
                <User size={15} />
                <span>{username}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout-icon" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login-pill">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`mobile-nav-item ${active ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

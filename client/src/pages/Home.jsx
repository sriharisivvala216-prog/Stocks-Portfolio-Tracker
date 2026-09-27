import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Search, 
  Bookmark, 
  Home as HomeIcon, 
  LogIn, 
  UserPlus, 
  Newspaper, 
  Calculator as CalcIcon, 
  Rocket,
  Menu,
  X
} from 'lucide-react';
import '../intro.css'; 

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="traditional-home">
      {/* Full-Page Fixed 3D Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="full-page-bg-video"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Modern Attractive Navbar */}
      <nav className="navbar">
        <Link to="/" className="logo">
          <div className="logo-badge">
            <TrendingUp size={22} />
          </div>
          <span>PortfolioPro</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          <Link to="/" className="nav-btn-link">
            <HomeIcon size={15} />
            <span>Home</span>
          </Link>
          <Link to="/screener" className="nav-btn-link">
            <Search size={15} />
            <span>Screener</span>
          </Link>
          <Link to="/analytics" className="nav-btn-link">
            <Activity size={15} />
            <span>AI Analytics</span>
          </Link>
          <Link to="/news" className="nav-btn-link">
            <Newspaper size={15} />
            <span>News</span>
          </Link>
          <Link to="/calculator" className="nav-btn-link">
            <CalcIcon size={15} />
            <span>SIP Calculator</span>
          </Link>
          <Link to="/ipo" className="nav-btn-link">
            <Rocket size={15} />
            <span>IPO Tracker</span>
          </Link>
          <Link to="/watchlist" className="nav-btn-link">
            <Bookmark size={15} />
            <span>Watchlist</span>
          </Link>
          <Link to="/login" className="nav-btn-signin">
            <LogIn size={15} />
            <span>Sign In</span>
          </Link>
          <Link to="/register" className="nav-btn-register">
            <UserPlus size={15} />
            <span>Get Started</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="home-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="home-mobile-drawer">
          <Link to="/" className="home-mobile-item" onClick={() => setIsMobileMenuOpen(false)}>
            <HomeIcon size={18} /> <span>Home</span>
          </Link>
          <Link to="/screener" className="home-mobile-item" onClick={() => setIsMobileMenuOpen(false)}>
            <Search size={18} /> <span>Live Screener</span>
          </Link>
          <Link to="/analytics" className="home-mobile-item" onClick={() => setIsMobileMenuOpen(false)}>
            <Activity size={18} /> <span>AI Analytics</span>
          </Link>
          <Link to="/news" className="home-mobile-item" onClick={() => setIsMobileMenuOpen(false)}>
            <Newspaper size={18} /> <span>News & AI Sentiment</span>
          </Link>
          <Link to="/calculator" className="home-mobile-item" onClick={() => setIsMobileMenuOpen(false)}>
            <CalcIcon size={18} /> <span>SIP Compounding</span>
          </Link>
          <Link to="/ipo" className="home-mobile-item" onClick={() => setIsMobileMenuOpen(false)}>
            <Rocket size={18} /> <span>IPO Tracker & GMP</span>
          </Link>
          <Link to="/watchlist" className="home-mobile-item" onClick={() => setIsMobileMenuOpen(false)}>
            <Bookmark size={18} /> <span>Smart Watchlist</span>
          </Link>
          <div className="home-mobile-auth">
            <Link to="/login" className="home-mobile-btn signin" onClick={() => setIsMobileMenuOpen(false)}>
              <LogIn size={16} /> <span>Sign In</span>
            </Link>
            <Link to="/register" className="home-mobile-btn register" onClick={() => setIsMobileMenuOpen(false)}>
              <UserPlus size={16} /> <span>Get Started Free</span>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Your Investments <br />
            <span className="gradient-text">With Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            A comprehensive, real-time stock portfolio tracking and market intelligence terminal. Scan live assets, analyze quantitative risk, model compound growth, and execute transactions seamlessly.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Get Started Free <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link to="/screener" className="btn-secondary">
              Explore Live Screener
            </Link>
          </div>
        </div>
      </section>

      {/* Full Stock Feature Grid Section */}
      <section id="features" className="features-section">
        <div className="features-header">
          <h2>Comprehensive Stock Market Suite</h2>
          <p>Everything you need for quantitative tracking, intelligence, and wealth growth</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-wrapper">
              <Search size={26} />
            </div>
            <h3>Live Market Screener</h3>
            <p>Scan US & Indian equities with live prices, 52-week high/low range meters, P/E ratios, market caps, and instant trade execution.</p>
            <Link to="/screener" className="feature-card-link">
              Launch Screener →
            </Link>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper">
              <Activity size={26} />
            </div>
            <h3>AI Portfolio Health & Risk</h3>
            <p>Evaluate diversification scores (0-100), estimated dividend yields, and test portfolio durability across macroeconomic stress scenarios.</p>
            <Link to="/analytics" className="feature-card-link">
              View Analytics →
            </Link>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper">
              <Newspaper size={26} />
            </div>
            <h3>Live News & Sentiment</h3>
            <p>Real-time financial headlines categorized across Macro, Tech, Banking, and Commodities with algorithmic Bullish/Bearish sentiment badges.</p>
            <Link to="/news" className="feature-card-link">
              Read Market News →
            </Link>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper">
              <CalcIcon size={26} />
            </div>
            <h3>SIP & Wealth Compounding</h3>
            <p>Model monthly SIPs, compound growth projections, multiplier milestones, and visualize invested capital vs wealth created.</p>
            <Link to="/calculator" className="feature-card-link">
              Calculate Growth →
            </Link>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper">
              <Rocket size={26} />
            </div>
            <h3>Live IPO & GMP Tracker</h3>
            <p>Monitor upcoming, open, and recently listed initial public offerings with expected Grey Market Premiums (GMP) and listing performance.</p>
            <Link to="/ipo" className="feature-card-link">
              Track IPOs →
            </Link>
          </div>

          <div className="feature-card">
            <div className="icon-wrapper">
              <Bookmark size={26} />
            </div>
            <h3>Smart Target Watchlists</h3>
            <p>Set custom target buy entry and profit-taking exit thresholds with automated distance-to-target tracking indicators.</p>
            <Link to="/watchlist" className="feature-card-link">
              Open Watchlist →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <TrendingUp size={20} className="mr-2 text-blue-500" /> PortfolioPro Terminal
          </div>
          <p>&copy; 2026 PortfolioPro Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

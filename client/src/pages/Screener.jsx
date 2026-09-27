import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, PlusCircle, Filter, Bookmark, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../portfolio.css';

export default function Screener() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [stocks, setStocks] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 178.45, change: 1.85, changePercent: 1.05, marketCap: '$2.78T', peRatio: 29.4, high52: 199.62, low52: 164.08, volume: '52.4M' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', price: 328.70, change: 3.20, changePercent: 0.98, marketCap: '$2.44T', peRatio: 33.1, high52: 366.78, low52: 275.37, volume: '24.1M' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors', price: 462.15, change: 12.80, changePercent: 2.85, marketCap: '$1.14T', peRatio: 64.8, high52: 502.66, low52: 138.84, volume: '48.9M' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', price: 142.30, change: -0.90, changePercent: -0.63, marketCap: '$1.47T', peRatio: 58.2, high52: 145.86, low52: 81.43, volume: '38.6M' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', price: 136.80, change: 0.45, changePercent: 0.33, marketCap: '$1.72T', peRatio: 24.6, high52: 142.38, low52: 88.58, volume: '22.3M' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', price: 218.90, change: -4.35, changePercent: -1.95, marketCap: '$695B', peRatio: 68.4, high52: 299.29, low52: 152.37, volume: '112.5M' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', price: 312.50, change: 4.80, changePercent: 1.56, marketCap: '$802B', peRatio: 26.7, high52: 326.20, low52: 88.09, volume: '18.7M' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', price: 148.60, change: 0.75, changePercent: 0.51, marketCap: '$431B', peRatio: 9.8, high52: 159.38, low52: 123.11, volume: '11.2M' },
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Conglomerate', price: 2450.00, change: 18.50, changePercent: 0.76, marketCap: '₹16.5T', peRatio: 25.3, high52: 2632.00, low52: 2180.00, volume: '6.4M' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT Services', price: 3580.00, change: -12.40, changePercent: -0.35, marketCap: '₹13.1T', peRatio: 28.9, high52: 3680.00, low52: 3070.00, volume: '2.1M' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Banking', price: 1530.25, change: 8.90, changePercent: 0.59, marketCap: '₹11.6T', peRatio: 18.4, high52: 1757.00, low52: 1460.00, volume: '14.8M' }
  ]);
  const navigate = useNavigate();

  // Real-time live simulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => {
        const delta = (Math.random() * 0.6 - 0.3);
        const newPrice = Math.max(1, stock.price + delta);
        const newChange = stock.change + delta;
        const newChangePercent = (newChange / stock.price) * 100;
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number(newChange.toFixed(2)),
          changePercent: Number(newChangePercent.toFixed(2))
        };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const addToWatchlist = (stock) => {
    const saved = localStorage.getItem('user_watchlist');
    let list = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) {}
    }

    if (list.some(item => item.symbol === stock.symbol)) {
      toast.info(`${stock.symbol} is already in your Watchlist`);
      return;
    }

    const newItem = {
      id: Date.now(),
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: stock.price,
      targetBuy: Number((stock.price * 0.92).toFixed(2)),
      targetSell: Number((stock.price * 1.18).toFixed(2)),
      notes: `Screener addition - ${stock.sector}`
    };

    list.push(newItem);
    localStorage.setItem('user_watchlist', JSON.stringify(list));
    toast.success(`${stock.symbol} added to Watchlist with Smart Targets!`);
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterCategory === 'GAINERS') return matchesSearch && stock.change >= 0;
    if (filterCategory === 'LOSERS') return matchesSearch && stock.change < 0;
    if (filterCategory === 'TECH') return matchesSearch && (stock.sector === 'Technology' || stock.sector === 'Semiconductors' || stock.sector === 'IT Services');
    if (filterCategory === 'FINANCE') return matchesSearch && (stock.sector === 'Financials' || stock.sector === 'Banking');
    return matchesSearch;
  });

  return (
    <div className="portfolio-app">
      <Navbar />

      <main className="dashboard-container">
        {/* Page Header */}
        <div className="dashboard-header">
          <div>
            <h1>Global Market Scanner & Screener</h1>
            <p>Real-time valuation metrics, 52-week price channels, and one-click execution triggers</p>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: '0.82rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.12)', padding: '6px 14px', borderRadius: '8px', fontWeight: '700', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <span className="live-dot-pulse"></span>
              Live Feed Streaming
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="panel-card" style={{ padding: 'clamp(14px, 2vw, 20px)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: 'min(100%, 260px)' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by Ticker, Company, or Sector..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 42px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  minHeight: '44px'
                }}
              />
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Equities' },
                { id: 'TECH', label: 'Tech & AI' },
                { id: 'FINANCE', label: 'Banking' },
                { id: 'GAINERS', label: '🟢 Gainers' },
                { id: 'LOSERS', label: '🔴 Pullbacks' }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setFilterCategory(btn.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: filterCategory === btn.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: filterCategory === btn.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                    color: filterCategory === btn.id ? '#38bdf8' : '#94a3b8',
                    minHeight: '38px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Screener Data Table (Responsive with Touch Scrolling) */}
        <div className="panel-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: '0' }}>
            <table className="traditional-table">
              <thead>
                <tr>
                  <th>Ticker & Name</th>
                  <th>Sector</th>
                  <th>Market Price</th>
                  <th>24h Change</th>
                  <th>52-Week Range Channel</th>
                  <th>Market Cap</th>
                  <th>P/E Ratio</th>
                  <th>Volume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map(stock => {
                  const rangeSpan = stock.high52 - stock.low52;
                  const pricePos = Math.max(0, Math.min(100, ((stock.price - stock.low52) / rangeSpan) * 100));

                  return (
                    <tr key={stock.symbol}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#38bdf8', fontSize: '0.98rem' }}>
                            {stock.symbol}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {stock.name}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '6px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                          {stock.sector}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1rem', color: '#ffffff' }}>
                          ${stock.price.toFixed(2)}
                        </span>
                      </td>

                      <td className={stock.change >= 0 ? 'text-profit' : 'text-loss'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          <span>{stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} ({stock.changePercent}%)</span>
                        </div>
                      </td>

                      <td style={{ minWidth: '160px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          <span>${stock.low52.toFixed(0)}</span>
                          <span style={{ color: '#94a3b8', fontWeight: '700' }}>Current</span>
                          <span>${stock.high52.toFixed(0)}</span>
                        </div>
                        <div className="range-meter-track">
                          <div className="range-meter-fill" style={{ width: `${pricePos}%` }}></div>
                          <div className="range-meter-pin" style={{ left: `${pricePos}%` }}></div>
                        </div>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1', fontWeight: '600', whiteSpace: 'nowrap' }}>{stock.marketCap}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1', whiteSpace: 'nowrap' }}>{stock.peRatio}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8', whiteSpace: 'nowrap' }}>{stock.volume}</td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                          <button
                            onClick={() => addToWatchlist(stock)}
                            style={{
                              background: 'rgba(56, 189, 248, 0.12)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              color: '#38bdf8',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              minHeight: '32px'
                            }}
                            title="Add to Watchlist"
                          >
                            <Bookmark size={13} />
                            Watch
                          </button>
                          <Link
                            to="/input"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: '1px solid #34d399',
                              color: '#ffffff',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              minHeight: '32px'
                            }}
                          >
                            + Buy
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

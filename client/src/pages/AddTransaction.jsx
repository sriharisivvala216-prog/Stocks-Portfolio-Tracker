import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { PlusCircle, ArrowLeft, TrendingUp, DollarSign, Shield, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../portfolio.css';

export default function AddTransaction() {
  const [company, setCompany] = useState('');
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Quick select ticker presets
  const popularPresets = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: '462.15' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: '178.45' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '328.70' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: '218.90' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '142.30' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '136.80' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: '2450.00' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: '3580.00' }
  ];

  const handleSelectPreset = (preset) => {
    setSymbol(preset.symbol);
    setCompany(preset.name);
    setPrice(preset.price);
  };

  const calculatedTotal = (Number(quantity) || 0) * (Number(price) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please log in first');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/portfolio', {
        company_name: company.trim(),
        company_symbol: symbol.toUpperCase().trim(),
        transaction_type: type,
        quantity: Number(quantity),
        price: Number(price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message || 'Transaction executed and saved!');
      navigate('/portfolio');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error recording transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-app">
      <Navbar />

      <main className="dashboard-container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link to="/portfolio" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.88rem', minHeight: '38px' }}>
            <ArrowLeft size={16} /> Back to Portfolio Terminal
          </Link>
        </div>

        <div className="panel-card" style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <div className="panel-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2>Execute & Record Stock Transaction</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                Add equities, ETFs, and bluechip stocks directly into your live valuation ledger
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} /> Instant Sync
            </span>
          </div>

          {/* Quick Preset Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px' }}>
              ⚡ Popular Quick-Fill Tickers
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {popularPresets.map(p => (
                <button
                  key={p.symbol}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    background: symbol === p.symbol ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${symbol === p.symbol ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: symbol === p.symbol ? '#38bdf8' : '#e2e8f0',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    minHeight: '36px'
                  }}
                >
                  {p.symbol} <span style={{ color: '#94a3b8', fontWeight: '400' }}>(${p.price})</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Order Side Selector (BUY vs SELL) */}
            <div className="form-group">
              <label>Order Execution Side</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setType('BUY')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    border: type === 'BUY' ? '2px solid #34d399' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: type === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: type === 'BUY' ? '#34d399' : '#94a3b8',
                    minHeight: '48px'
                  }}
                >
                  🟢 BUY (Long)
                </button>
                <button
                  type="button"
                  onClick={() => setType('SELL')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    border: type === 'SELL' ? '2px solid #f87171' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: type === 'SELL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: type === 'SELL' ? '#f87171' : '#94a3b8',
                    minHeight: '48px'
                  }}
                >
                  🔴 SELL (Exit)
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label htmlFor="company">Company Full Name</label>
                <input 
                  id="company"
                  type="text" 
                  placeholder="e.g. Apple Inc., Microsoft Corp" 
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="symbol">Stock Ticker Symbol</label>
                <input 
                  id="symbol"
                  type="text" 
                  placeholder="e.g. AAPL, NVDA, TSLA" 
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px' }}>
              <div className="form-group">
                <label htmlFor="quantity">Quantity (Shares)</label>
                <input 
                  id="quantity"
                  type="number" 
                  placeholder="e.g. 15" 
                  step="any"
                  min="0.0001"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Execution Price per Share ($ / ₹)</label>
                <input 
                  id="price"
                  type="number" 
                  placeholder="e.g. 178.45" 
                  step="any" 
                  min="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Live Order Value Preview Box */}
            <div style={{
              background: 'rgba(8, 12, 22, 0.75)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '6px'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block' }}>
                  Total Order Value
                </span>
                <span style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: '800', color: type === 'BUY' ? '#34d399' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                  ${calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                <div>Side: <strong>{type} MARKET</strong></div>
                <div>Status: <span style={{ color: '#38bdf8' }}>Ready to Execute</span></div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary-glow" 
              disabled={loading}
              style={{ marginTop: '10px', width: '100%', padding: '14px', fontSize: '1rem', minHeight: '50px' }}
            >
              {loading ? 'Executing Order...' : `Confirm & Execute ${type} Order`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

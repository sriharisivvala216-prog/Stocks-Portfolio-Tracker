import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Bookmark, Plus, Trash2, ArrowUpRight, Bell, Zap, Target, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../portfolio.css';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('user_watchlist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 462.15, targetBuy: 420.00, targetSell: 520.00, notes: 'Wait for pullback before accumulating' },
      { id: 2, symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 178.45, targetBuy: 170.00, targetSell: 200.00, notes: 'Key support level at $170' },
      { id: 3, symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 328.70, targetBuy: 310.00, targetSell: 375.00, notes: 'AI Cloud infrastructure expansion' },
      { id: 4, symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 218.90, targetBuy: 200.00, targetSell: 260.00, notes: 'FSD V13 rollout milestone' }
    ];
  });

  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newTargetBuy, setNewTargetBuy] = useState('');
  const [newTargetSell, setNewTargetSell] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('user_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Live price ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(item => {
        const delta = (Math.random() * 0.5 - 0.25);
        return {
          ...item,
          currentPrice: Number(Math.max(1, item.currentPrice + delta).toFixed(2))
        };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!newSymbol || !newPrice) {
      toast.error("Symbol and current price are required");
      return;
    }

    const newItem = {
      id: Date.now(),
      symbol: newSymbol.toUpperCase().trim(),
      name: newName.trim() || newSymbol.toUpperCase().trim(),
      currentPrice: Number(newPrice),
      targetBuy: Number(newTargetBuy) || Number(newPrice) * 0.9,
      targetSell: Number(newTargetSell) || Number(newPrice) * 1.2,
      notes: 'Custom alert tracking'
    };

    setWatchlist([newItem, ...watchlist]);
    toast.success(`${newItem.symbol} added to Watchlist`);
    setNewSymbol('');
    setNewName('');
    setNewPrice('');
    setNewTargetBuy('');
    setNewTargetSell('');
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
    toast.info("Stock removed from watchlist");
  };

  return (
    <div className="portfolio-app">
      <Navbar />

      <main className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Smart Target Watchlist & Price Alerts</h1>
            <p>Track prospective entries, breakout channels, and automated target distance meters</p>
          </div>
          <div className="header-actions">
            <button onClick={() => setShowAddModal(true)} className="btn-primary-glow">
              <Plus size={16} />
              <span>Add Stock to Watchlist</span>
            </button>
          </div>
        </div>

        {/* Watchlist Grid (Responsive) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(14px, 2vw, 20px)', marginBottom: '32px' }}>
          {watchlist.map(item => {
            const distToBuy = ((item.currentPrice - item.targetBuy) / item.currentPrice) * 100;
            const distToSell = ((item.targetSell - item.currentPrice) / item.currentPrice) * 100;
            const isNearBuy = distToBuy <= 5;
            const isNearSell = distToSell <= 5;

            return (
              <div key={item.id} className="panel-card" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                          {item.symbol}
                        </span>
                        {isNearBuy && (
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                            BUY ZONE
                          </span>
                        )}
                        {isNearSell && (
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(248, 113, 113, 0.4)' }}>
                            SELL TARGET
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '2px' }}>{item.name}</div>
                    </div>

                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', minWidth: '36px', minHeight: '36px' }}
                      title="Remove from Watchlist"
                      aria-label="Remove stock"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Current Market Price</div>
                    <div style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.75rem)', fontWeight: '800', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      ${item.currentPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Targets Breakdown */}
                  <div style={{ background: 'rgba(8, 12, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Target Buy Price:</span>
                      <strong style={{ color: '#34d399', fontFamily: 'var(--font-mono)' }}>${item.targetBuy.toFixed(2)} ({distToBuy.toFixed(1)}% away)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Target Sell Price:</span>
                      <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>${item.targetSell.toFixed(2)} ({distToSell.toFixed(1)}% upside)</strong>
                    </div>
                  </div>

                  {item.notes && (
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '14px' }}>
                      "{item.notes}"
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <Link
                    to="/input"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: '1px solid #34d399',
                      color: '#ffffff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      minHeight: '44px'
                    }}
                  >
                    <Plus size={15} /> Execute Trade
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Modal (Responsive) */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}>
            <div className="panel-card" style={{ maxWidth: '500px', width: '100%', padding: 'clamp(20px, 4vw, 28px)', border: '1px solid var(--border-glass-bright)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="panel-header">
                <h2>Add Stock to Watchlist</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '1.4rem', cursor: 'pointer', padding: '4px' }}>✕</button>
              </div>

              <form onSubmit={handleAddStock} className="auth-form">
                <div className="form-group">
                  <label>Ticker Symbol</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NVDA, AAPL, TSLA" 
                    value={newSymbol}
                    onChange={e => setNewSymbol(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NVIDIA Corporation" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Current Price ($ / ₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 460.00" 
                    step="any"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px' }}>
                  <div className="form-group">
                    <label>Target Buy ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 420.00" 
                      step="any"
                      value={newTargetBuy}
                      onChange={e => setNewTargetBuy(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Sell ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 520.00" 
                      step="any"
                      value={newTargetSell}
                      onChange={e => setNewTargetSell(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary-glow" style={{ marginTop: '8px', minHeight: '48px' }}>
                  Save to Watchlist
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

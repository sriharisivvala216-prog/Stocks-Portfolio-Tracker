import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Rocket, Calendar, TrendingUp, CheckCircle, Clock, ArrowRight, Bookmark, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../portfolio.css';

export default function Ipo() {
  const [activeTab, setActiveTab] = useState('ALL');

  const ipoList = [
    {
      id: 1,
      name: "Tata Technologies Ltd.",
      symbol: "TATATECH",
      status: "LISTED",
      priceBand: "₹475 - ₹500",
      issueSize: "₹3,042 Cr",
      openDate: "Nov 22, 2023",
      closeDate: "Nov 24, 2023",
      listingDate: "Nov 30, 2023",
      subscription: "69.4x",
      gmp: "+₹380 (76%)",
      listingGain: "+140.0%",
      sector: "Engineering & Tech"
    },
    {
      id: 2,
      name: "Nova AgriTech Ltd.",
      symbol: "NOVAAGRI",
      status: "LISTED",
      priceBand: "₹39 - ₹41",
      issueSize: "₹143 Cr",
      openDate: "Jan 22, 2024",
      closeDate: "Jan 24, 2024",
      listingDate: "Jan 31, 2024",
      subscription: "109.3x",
      gmp: "+₹22 (53%)",
      listingGain: "+36.5%",
      sector: "Agrochemicals"
    },
    {
      id: 3,
      name: "Ather Energy Private Ltd.",
      symbol: "ATHER",
      status: "UPCOMING",
      priceBand: "₹320 - ₹340",
      issueSize: "₹4,500 Cr",
      openDate: "Oct 14, 2026",
      closeDate: "Oct 17, 2026",
      listingDate: "Oct 24, 2026",
      subscription: "Open Soon",
      gmp: "+₹115 (34%)",
      listingGain: "Est. +34%",
      sector: "EV & Clean Mobility"
    },
    {
      id: 4,
      name: "Swiggy Limited",
      symbol: "SWIGGY",
      status: "UPCOMING",
      priceBand: "₹370 - ₹390",
      issueSize: "₹10,400 Cr",
      openDate: "Nov 06, 2026",
      closeDate: "Nov 08, 2026",
      listingDate: "Nov 15, 2026",
      subscription: "Upcoming",
      gmp: "+₹85 (22%)",
      listingGain: "Est. +22%",
      sector: "Consumer Tech & Quick Commerce"
    },
    {
      id: 5,
      name: "NTPC Green Energy Ltd.",
      symbol: "NTPCGREEN",
      status: "UPCOMING",
      priceBand: "₹102 - ₹108",
      issueSize: "₹10,000 Cr",
      openDate: "Nov 19, 2026",
      closeDate: "Nov 22, 2026",
      listingDate: "Nov 28, 2026",
      subscription: "Upcoming",
      gmp: "+₹28 (26%)",
      listingGain: "Est. +26%",
      sector: "Renewable Power"
    }
  ];

  const filteredIpos = ipoList.filter(ipo => {
    if (activeTab === 'UPCOMING') return ipo.status === 'UPCOMING';
    if (activeTab === 'LISTED') return ipo.status === 'LISTED';
    return true;
  });

  const handleTrackIPO = (ipo) => {
    const saved = localStorage.getItem('user_watchlist');
    let list = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) {}
    }

    if (list.some(item => item.symbol === ipo.symbol)) {
      toast.info(`${ipo.name} is already being tracked in Watchlist`);
      return;
    }

    const newItem = {
      id: Date.now(),
      symbol: ipo.symbol,
      name: ipo.name,
      currentPrice: 350,
      targetBuy: 300,
      targetSell: 450,
      notes: `IPO Tracking (${ipo.status}) - GMP: ${ipo.gmp}`
    };

    list.push(newItem);
    localStorage.setItem('user_watchlist', JSON.stringify(list));
    toast.success(`${ipo.name} added to Watchlist tracker!`);
  };

  return (
    <div className="portfolio-app">
      <Navbar />

      <main className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Initial Public Offering (IPO) & GMP Intelligence</h1>
            <p>Track primary market issues, real-time Grey Market Premiums (GMP), and institutional subscription multipliers</p>
          </div>
          <div className="header-actions">
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['ALL', 'UPCOMING', 'LISTED'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    background: activeTab === tab ? '#38bdf8' : 'transparent',
                    color: activeTab === tab ? '#070b14' : '#94a3b8',
                    minHeight: '38px',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab === 'ALL' ? 'All Issues' : tab === 'UPCOMING' ? '🚀 Upcoming' : '✨ Listed'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* IPO Cards Grid (Responsive) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 2vw, 20px)' }}>
          {filteredIpos.map(ipo => (
            <div key={ipo.id} className="panel-card" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.2rem)', fontWeight: '800', color: '#ffffff' }}>
                      {ipo.name}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      {ipo.symbol} • {ipo.sector}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: ipo.status === 'LISTED' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.18)',
                    color: ipo.status === 'LISTED' ? '#34d399' : '#38bdf8',
                    border: `1px solid ${ipo.status === 'LISTED' ? '#34d399' : '#38bdf8'}`
                  }}>
                    {ipo.status}
                  </span>
                </div>

                {/* GMP & Key Stats Box */}
                <div style={{ background: 'rgba(8, 12, 22, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Grey Market Premium (GMP):</span>
                    <strong style={{ color: '#34d399', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>{ipo.gmp}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Price Band:</span>
                    <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{ipo.priceBand}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Issue Size:</span>
                    <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{ipo.issueSize}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Subscription:</span>
                    <strong style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{ipo.subscription}</strong>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '6px', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '14px' }}>
                  <div>📅 Open: <strong style={{ color: '#e2e8f0' }}>{ipo.openDate}</strong></div>
                  <div>🔔 Listing: <strong style={{ color: '#e2e8f0' }}>{ipo.listingDate}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={() => handleTrackIPO(ipo)}
                  style={{
                    flex: 1,
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '44px'
                  }}
                >
                  <Bookmark size={15} /> Track
                </button>

                <Link
                  to="/input"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: '1px solid #34d399',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '44px'
                  }}
                >
                  <Zap size={15} /> Bid / Buy
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

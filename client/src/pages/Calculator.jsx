import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator as CalcIcon, DollarSign, TrendingUp, Target, PieChart as PieIcon, ArrowRight, Zap, Award } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import Navbar from '../components/Navbar';
import '../portfolio.css';

export default function Calculator() {
  const [mode, setMode] = useState('SIP'); // 'SIP' or 'LUMPSUM'
  const [monthlyInvestment, setMonthlyInvestment] = useState(15000);
  const [lumpSumAmount, setLumpSumAmount] = useState(200000);
  const [expectedReturn, setExpectedReturn] = useState(14); // 14% p.a.
  const [years, setYears] = useState(10);

  // Calculations
  let investedAmount = 0;
  let futureValue = 0;
  let wealthGain = 0;

  const r = (expectedReturn / 100) / 12;
  const n = years * 12;

  if (mode === 'SIP') {
    investedAmount = monthlyInvestment * n;
    futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    wealthGain = futureValue - investedAmount;
  } else {
    investedAmount = lumpSumAmount;
    futureValue = lumpSumAmount * Math.pow(1 + (expectedReturn / 100), years);
    wealthGain = futureValue - investedAmount;
  }

  const pieData = {
    labels: ['Invested Capital', 'Wealth Gain'],
    datasets: [{
      data: [investedAmount, Math.max(0, wealthGain)],
      backgroundColor: ['#475569', '#38bdf8'],
      borderColor: '#0f172a',
      borderWidth: 2
    }]
  };

  return (
    <div className="portfolio-app">
      <Navbar />

      <main className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Stock SIP & Compound Wealth Engine</h1>
            <p>Model exponential wealth accumulation, calculate inflation-adjusted returns, and plan financial independence</p>
          </div>
          <div className="header-actions">
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setMode('SIP')}
                style={{ 
                  padding: '8px 14px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: '700', 
                  fontSize: '0.84rem', 
                  cursor: 'pointer', 
                  background: mode === 'SIP' ? '#38bdf8' : 'transparent', 
                  color: mode === 'SIP' ? '#070b14' : '#94a3b8',
                  minHeight: '38px',
                  transition: 'all 0.2s ease'
                }}
              >
                Monthly SIP
              </button>
              <button 
                onClick={() => setMode('LUMPSUM')}
                style={{ 
                  padding: '8px 14px', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: '700', 
                  fontSize: '0.84rem', 
                  cursor: 'pointer', 
                  background: mode === 'LUMPSUM' ? '#38bdf8' : 'transparent', 
                  color: mode === 'LUMPSUM' ? '#070b14' : '#94a3b8',
                  minHeight: '38px',
                  transition: 'all 0.2s ease'
                }}
              >
                Lumpsum
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid (Responsive) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Controls Panel */}
          <div className="panel-card">
            <div className="panel-header">
              <h2>Investment Parameters</h2>
              <span style={{ fontSize: '0.78rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
                Annual Compounding (CAGR)
              </span>
            </div>

            {mode === 'SIP' ? (
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1' }}>Monthly SIP Amount</label>
                  <strong style={{ fontSize: '1.15rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>₹{monthlyInvestment.toLocaleString()}</strong>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="200000" 
                  step="1000" 
                  value={monthlyInvestment} 
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1' }}>Initial Capital</label>
                  <strong style={{ fontSize: '1.15rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>₹{lumpSumAmount.toLocaleString()}</strong>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="5000000" 
                  step="10000" 
                  value={lumpSumAmount} 
                  onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                />
              </div>
            )}

            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1' }}>Expected Return Rate (p.a.)</label>
                <strong style={{ fontSize: '1.15rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>{expectedReturn}%</strong>
              </div>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="0.5" 
                value={expectedReturn} 
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#cbd5e1' }}>Duration (Years)</label>
                <strong style={{ fontSize: '1.15rem', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>{years} Years</strong>
              </div>
              <input 
                type="range" 
                min="1" 
                max="35" 
                step="1" 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
              />
            </div>

            {/* Quick Milestones Badge */}
            <div style={{ background: 'rgba(8, 12, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: '700', fontSize: '0.86rem', marginBottom: '4px' }}>
                <Award size={16} />
                <span>Financial Milestone Projection</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.4' }}>
                At ₹{mode === 'SIP' ? monthlyInvestment.toLocaleString() : lumpSumAmount.toLocaleString()} with {expectedReturn}% CAGR, your corpus will reach <strong>₹1 Crore in ~{Math.max(1, Math.round(Math.log(10000000 / (mode === 'SIP' ? monthlyInvestment * 12 : lumpSumAmount)) / Math.log(1 + expectedReturn/100)))} Years</strong>.
              </p>
            </div>
          </div>

          {/* Results & Visual Chart Panel */}
          <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="panel-header">
                <h2>Projected Wealth Breakdown</h2>
              </div>

              {/* Top 3 Result Metrics (Responsive) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 100px), 1fr))', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(8, 12, 22, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Invested</span>
                  <strong style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>₹{investedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                </div>

                <div style={{ background: 'rgba(8, 12, 22, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Wealth Gain</span>
                  <strong style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>₹{wealthGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Final Value</span>
                  <strong style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: '#34d399', fontFamily: 'var(--font-mono)' }}>₹{futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                </div>
              </div>

              {/* Chart */}
              <div className="chart-container" style={{ height: '200px' }}>
                <Pie 
                  data={pieData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 11 } } } } 
                  }} 
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <Link to="/input" className="btn-primary-glow" style={{ width: '100%', textDecoration: 'none', minHeight: '46px' }}>
                Execute Investment Strategy →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

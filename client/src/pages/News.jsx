import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, TrendingUp, TrendingDown, Clock, Tag, ExternalLink, Globe, Sparkles, Filter, Zap, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../portfolio.css';

export default function News() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [fearGreedIndex, setFearGreedIndex] = useState(68); // Greed

  const newsData = [
    {
      id: 1,
      headline: "Federal Reserve Signals Potential Rate Cut As Core Inflation Cools Toward 2% Target",
      source: "Bloomberg Markets",
      time: "15 mins ago",
      category: "MACRO",
      sentiment: "BULLISH",
      confidence: "94%",
      relatedTickers: ["SPY", "QQQ", "AAPL"],
      summary: "Federal Reserve officials highlighted steady progress in disinflation, boosting equity futures as benchmark treasury yields dipped below key resistance levels."
    },
    {
      id: 2,
      headline: "NVIDIA Announces Next-Gen AI Blackwell Ultra Architecture, Boosting Hyperscaler Orders",
      source: "Reuters Tech",
      time: "42 mins ago",
      category: "TECH",
      sentiment: "BULLISH",
      confidence: "98%",
      relatedTickers: ["NVDA", "MSFT", "TSM"],
      summary: "Leading tech giants expanded capital expenditure commitments, forecasting accelerating enterprise demand for accelerated compute clusters."
    },
    {
      id: 3,
      headline: "Oil Prices Retreat Below $78 Amid Global Inventory Build and Seasonal Refining Shifts",
      source: "Financial Times",
      time: "1 hour ago",
      category: "COMMODITIES",
      sentiment: "NEUTRAL",
      confidence: "82%",
      relatedTickers: ["XOM", "CVX", "RELIANCE"],
      summary: "Crude benchmarks traded range-bound as supply forecasts balanced steady consumer consumption and seasonal refinery maintenance schedules."
    },
    {
      id: 4,
      headline: "Indian Equity Indices Nifty & Sensex Hit Record Highs on Sustained Domestic SIP Inflows",
      source: "Economic Times",
      time: "2 hours ago",
      category: "INDIAN_MARKETS",
      sentiment: "BULLISH",
      confidence: "91%",
      relatedTickers: ["RELIANCE", "HDFCBANK", "TCS"],
      summary: "Institutional and retail monthly SIP inflows reached an all-time monthly high of ₹21,000 Crore, driving broad-based index momentum."
    },
    {
      id: 5,
      headline: "Electric Vehicle Market Faces Margin Adjustments Amid Localized Supply Headwinds",
      source: "Wall Street Journal",
      time: "3 hours ago",
      category: "AUTO",
      sentiment: "BEARISH",
      confidence: "88%",
      relatedTickers: ["TSLA", "RIVN", "F"],
      summary: "Auto analysts trimmed near-term delivery guidance as automakers balance localized production ramps and incentives in competitive overseas markets."
    },
    {
      id: 6,
      headline: "Major Global Commercial Lenders Post Resilient Net Interest Margins in Quarterly Review",
      source: "CNBC Finance",
      time: "4 hours ago",
      category: "FINANCIALS",
      sentiment: "BULLISH",
      confidence: "89%",
      relatedTickers: ["JPM", "BAC", "HDFCBANK"],
      summary: "Major commercial lenders reported sound credit quality metrics and robust corporate advisory pipelines throughout the fiscal quarter."
    }
  ];

  const filteredNews = activeCategory === 'ALL' 
    ? newsData 
    : newsData.filter(n => n.category === activeCategory);

  return (
    <div className="portfolio-app">
      <Navbar />

      <main className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Global Financial Intelligence & AI Sentiment</h1>
            <p>Real-time market headlines, sentiment vector analysis, and macroeconomic indicators</p>
          </div>
          <div className="header-actions">
            <span style={{ fontSize: '0.82rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.12)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: '700' }}>
              <Sparkles size={15} /> AI Natural Language Parser Active
            </span>
          </div>
        </div>

        {/* Top Intelligence Row (Fear & Greed Index + Market Status) */}
        <div className="metrics-row" style={{ marginBottom: '24px' }}>
          {/* Fear & Greed Card */}
          <div className="metric-card" style={{ gridColumn: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
              <div className="metric-label">Market Sentiment Indicator (Fear & Greed Index)</div>
              <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                68 / 100 — GREED
              </span>
            </div>

            <div style={{ margin: '10px 0 8px' }}>
              <div className="range-meter-track" style={{ height: '10px', background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 45%, #10b981 100%)' }}>
                <div className="range-meter-pin" style={{ left: '68%', top: '-3px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>
                <span>0 (Fear)</span>
                <span>50 (Neutral)</span>
                <span>100 (Greed)</span>
              </div>
            </div>

            <div className="metric-sub" style={{ marginTop: '8px' }}>
              Signal: <strong>Bullish Momentum across Semiconductor & Financial Equities</strong>
            </div>
          </div>

          {/* AI Sentiment Summary */}
          <div className="metric-card">
            <div className="metric-label">AI Sentiment Ratio</div>
            <div className="metric-value" style={{ color: '#34d399', fontSize: 'clamp(1.5rem, 3.5vw, 1.8rem)' }}>
              78% Bullish
            </div>
            <div className="metric-sub">
              Processed 1,420 Global Articles today
            </div>
          </div>
        </div>

        {/* Category Filters (Scrollable on small mobile) */}
        <div className="panel-card" style={{ padding: 'clamp(12px, 2vw, 16px)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#94a3b8', marginRight: '4px' }}>
              <Filter size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Category:
            </span>
            {[
              { id: 'ALL', label: 'All News' },
              { id: 'MACRO', label: 'Macro' },
              { id: 'TECH', label: 'Tech & AI' },
              { id: 'INDIAN_MARKETS', label: 'Indian Bluechips' },
              { id: 'AUTO', label: 'EV' },
              { id: 'COMMODITIES', label: 'Crude' },
              { id: 'FINANCIALS', label: 'Banking' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: activeCategory === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: activeCategory === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: activeCategory === tab.id ? '#38bdf8' : '#cbd5e1',
                  minHeight: '36px',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* News Cards Grid (Responsive) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 2vw, 20px)' }}>
          {filteredNews.map(item => (
            <div key={item.id} className="panel-card" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={13} /> {item.source} • <Clock size={13} /> {item.time}
                  </span>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    letterSpacing: '0.5px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: item.sentiment === 'BULLISH' ? 'rgba(16, 185, 129, 0.18)' : item.sentiment === 'BEARISH' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.1)',
                    color: item.sentiment === 'BULLISH' ? '#34d399' : item.sentiment === 'BEARISH' ? '#f87171' : '#cbd5e1',
                    border: `1px solid ${item.sentiment === 'BULLISH' ? '#34d399' : item.sentiment === 'BEARISH' ? '#f87171' : '#cbd5e1'}`
                  }}>
                    {item.sentiment === 'BULLISH' ? '🟢 BULLISH' : item.sentiment === 'BEARISH' ? '🔴 BEARISH' : '⚪ NEUTRAL'} ({item.confidence})
                  </span>
                </div>

                <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.12rem)', fontWeight: '800', color: '#ffffff', lineHeight: '1.4', marginBottom: '8px' }}>
                  {item.headline}
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '14px' }}>
                  {item.summary}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Tag size={13} color="#64748b" />
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Tickers:</span>
                  {item.relatedTickers.map(ticker => (
                    <Link
                      key={ticker}
                      to="/screener"
                      style={{
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        color: '#38bdf8',
                        background: 'rgba(56, 189, 248, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textDecoration: 'none'
                      }}
                    >
                      ${ticker}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

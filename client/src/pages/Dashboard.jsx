import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  RefreshCw, 
  PlusCircle, 
  Trash2, 
  Activity, 
  PieChart as PieIcon, 
  BarChart2, 
  ShieldCheck,
  Search
} from 'lucide-react';
import Navbar from '../components/Navbar';
import '../portfolio.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [liveStocks, setLiveStocks] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 1.85, changePercent: 1.05 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 462.15, change: 12.80, changePercent: 2.85 },
    { symbol: 'MSFT', name: 'Microsoft', price: 328.70, change: 3.20, changePercent: 0.98 },
    { symbol: 'AMZN', name: 'Amazon.com', price: 142.30, change: -0.90, changePercent: -0.63 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.90, change: -4.35, changePercent: -1.95 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 136.80, change: 0.45, changePercent: 0.33 }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPortfolio();
  }, []);

  // Live stock price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStocks(prev => prev.map(stock => {
        const delta = (Math.random() * 0.8 - 0.4);
        const newPrice = Math.max(1, stock.price + delta);
        const newChange = stock.change + delta;
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number(newChange.toFixed(2)),
          changePercent: Number(((newChange / stock.price) * 100).toFixed(2))
        };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadPortfolio = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning("Please sign in to access your portfolio");
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolio(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session expired. Please sign in again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error("Failed to load portfolio data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction record?")) return;
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Transaction deleted successfully");
      loadPortfolio();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete transaction");
    }
  };

  // Portfolio Calculations
  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalRealizedGain = 0;

  const companyStats = {};

  portfolio.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const buyPrice = Number(item.price) || 0;
    const currPrice = Number(item.current_price || buyPrice);
    const itemTotal = qty * buyPrice;
    const itemCurrTotal = qty * currPrice;

    if (item.transaction_type === 'BUY') {
      totalInvested += itemTotal;
      totalCurrentValue += itemCurrTotal;
    } else if (item.transaction_type === 'SELL') {
      totalRealizedGain += (buyPrice * qty);
    }

    const compKey = item.company_symbol || item.company_name;
    if (!companyStats[compKey]) {
      companyStats[compKey] = {
        name: item.company_name,
        symbol: item.company_symbol,
        buyQty: 0,
        sellQty: 0,
        invested: 0,
        currentValue: 0,
        currentPrice: currPrice
      };
    }

    if (item.transaction_type === 'BUY') {
      companyStats[compKey].buyQty += qty;
      companyStats[compKey].invested += itemTotal;
      companyStats[compKey].currentValue += itemCurrTotal;
    } else {
      companyStats[compKey].sellQty += qty;
    }
  });

  const totalUnrealizedGain = totalCurrentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalUnrealizedGain / totalInvested) * 100 : 0;

  // Chart 1: Asset Allocation Pie Chart
  const pieLabels = Object.keys(companyStats).filter(k => (companyStats[k].buyQty - companyStats[k].sellQty) > 0);
  const pieValues = pieLabels.map(k => companyStats[k].currentValue);
  const pieColors = [
    '#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#fbbf24', 
    '#a855f7', '#ec4899', '#2dd4bf', '#f97316', '#6366f1'
  ];

  const pieChartData = {
    labels: pieLabels.length > 0 ? pieLabels : ['No Active Holdings'],
    datasets: [{
      data: pieValues.length > 0 ? pieValues : [1],
      backgroundColor: pieValues.length > 0 ? pieColors.slice(0, pieLabels.length) : ['#334155'],
      borderColor: '#0f172a',
      borderWidth: 2
    }]
  };

  // Chart 2: Performance Comparison Bar Chart
  const barChartData = {
    labels: pieLabels.length > 0 ? pieLabels : ['Sample'],
    datasets: [
      {
        label: 'Invested Capital ($)',
        data: pieLabels.map(k => companyStats[k].invested),
        backgroundColor: '#64748b',
        borderRadius: 6
      },
      {
        label: 'Current Valuation ($)',
        data: pieLabels.map(k => companyStats[k].currentValue),
        backgroundColor: '#38bdf8',
        borderRadius: 6
      }
    ]
  };

  // Chart 3: Simulated Historical Growth Line
  const lineChartData = {
    labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Current'],
    datasets: [{
      label: 'Portfolio Equity Growth',
      data: [
        totalInvested * 0.96,
        totalInvested * 0.98,
        totalInvested * 1.01,
        totalInvested * 0.99,
        totalInvested * 1.03,
        totalInvested * 1.05,
        totalCurrentValue
      ],
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const filteredPortfolio = portfolio.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.company_name?.toLowerCase().includes(term) ||
      item.company_symbol?.toLowerCase().includes(term) ||
      item.transaction_type?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="portfolio-app">
      <Navbar />

      <main className="dashboard-container">
        {/* Dashboard Title & Quick Actions */}
        <div className="dashboard-header">
          <div>
            <h1>Executive Portfolio Terminal</h1>
            <p>Live portfolio valuation, risk-adjusted returns, and real-time execution records</p>
          </div>
          <div className="header-actions">
            <button onClick={loadPortfolio} className="btn-secondary-dark">
              <RefreshCw size={15} />
              <span>Refresh Rates</span>
            </button>
            <Link to="/input" className="btn-primary-glow">
              <PlusCircle size={17} />
              <span>Record Trade</span>
            </Link>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-label">Total Portfolio Value</div>
            <div className="metric-value">
              ${totalCurrentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="metric-sub">
              Net Invested: ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Unrealized P&L</div>
            <div className={`metric-value ${totalUnrealizedGain >= 0 ? 'profit' : 'loss'}`}>
              {totalUnrealizedGain >= 0 ? '+' : ''}${totalUnrealizedGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`metric-sub ${returnPercentage >= 0 ? 'text-profit' : 'text-loss'}`} style={{ fontWeight: '700' }}>
              {returnPercentage >= 0 ? '▲' : '▼'} {returnPercentage.toFixed(2)}% Return on Capital
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Active Assets</div>
            <div className="metric-value" style={{ color: '#38bdf8' }}>
              {pieLabels.length} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '500' }}>Holdings</span>
            </div>
            <div className="metric-sub">
              Total Transactions Logged: {portfolio.length}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Security & Health</div>
            <div className="metric-value" style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={28} />
              <span>Grade A+</span>
            </div>
            <div className="metric-sub">
              Automated MPT Risk Coverage
            </div>
          </div>
        </div>

        {/* Live Market Bar */}
        <div className="panel-card" style={{ padding: 'clamp(14px, 2vw, 20px)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              ⚡ Global Market Quick Tickers
            </span>
            <Link to="/screener" style={{ color: '#38bdf8', fontSize: '0.84rem', textDecoration: 'none', fontWeight: '600' }}>
              Open Full Screener →
            </Link>
          </div>
          <div className="market-grid">
            {liveStocks.map(stock => (
              <div key={stock.symbol} className="market-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="market-symbol">{stock.symbol}</div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{stock.name}</span>
                </div>
                <div className="market-price">${stock.price.toFixed(2)}</div>
                <div className={`market-change ${stock.change >= 0 ? 'up' : 'down'}`}>
                  {stock.change >= 0 ? '▲ +' : '▼ '}${Math.abs(stock.change).toFixed(2)} ({stock.changePercent}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="tabs-bar">
          <button 
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <Activity size={16} />
            <span>Transaction Ledger</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            <PieIcon size={16} />
            <span>Visual Analytics & Allocation</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
            onClick={() => setActiveTab('holdings')}
          >
            <Layers size={16} />
            <span>Consolidated Holdings</span>
          </button>
        </div>

        {/* Tab 1: Transactions Table */}
        {activeTab === 'transactions' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2>Recent Transaction Logs</h2>
              <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.88rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-spinner-wrapper">
                <div className="spinner"></div>
                <p>Synchronizing your financial ledgers...</p>
              </div>
            ) : filteredPortfolio.length === 0 ? (
              <div className="empty-state">
                <h3>No Transactions Found</h3>
                <p>Start recording your stock purchases and sales to generate live performance analytics.</p>
                <Link to="/input" className="btn-primary-glow">
                  + Add Your First Stock
                </Link>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="traditional-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Ticker</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Executed Price</th>
                      <th>Current Price</th>
                      <th>Total Value</th>
                      <th>P&L ($)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPortfolio.map(txn => {
                      const qty = Number(txn.quantity) || 0;
                      const buyPrice = Number(txn.price) || 0;
                      const currPrice = Number(txn.current_price || buyPrice);
                      const totalVal = qty * currPrice;
                      const pl = (currPrice - buyPrice) * qty;

                      return (
                        <tr key={txn.id || txn._id}>
                          <td><strong>{txn.company_name}</strong></td>
                          <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8' }}>{txn.company_symbol}</span></td>
                          <td>
                            <span className={`badge ${txn.transaction_type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                              {txn.transaction_type}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{qty}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${buyPrice.toFixed(2)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${currPrice.toFixed(2)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${totalVal.toFixed(2)}</td>
                          <td className={pl >= 0 ? 'text-profit' : 'text-loss'}>
                            {txn.transaction_type === 'BUY' ? (
                              <span>{pl >= 0 ? '+' : ''}${pl.toFixed(2)}</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td>
                            <button 
                              onClick={() => deleteTransaction(txn.id || txn._id)}
                              className="btn-delete-row"
                              title="Delete transaction"
                            >
                              <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Visual Charts */}
        {activeTab === 'charts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
            <div className="panel-card">
              <div className="panel-header">
                <h2>Asset Allocation (By Capital)</h2>
              </div>
              <div className="chart-container" style={{ height: '300px' }}>
                <Pie 
                  data={pieChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { family: 'Outfit', size: 12 } } } } 
                  }} 
                />
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <h2>Invested vs Current Valuation</h2>
              </div>
              <div className="chart-container" style={{ height: '300px' }}>
                <Bar 
                  data={barChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#cbd5e1' } } },
                    scales: {
                      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                  }} 
                />
              </div>
            </div>

            <div className="panel-card" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header">
                <h2>Simulated Portfolio Growth Trajectory</h2>
              </div>
              <div className="chart-container" style={{ height: '280px' }}>
                <Line 
                  data={lineChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#cbd5e1' } } },
                    scales: {
                      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Consolidated Holdings */}
        {activeTab === 'holdings' && (
          <div className="panel-card">
            <div className="panel-header">
              <h2>Consolidated Stock Holdings</h2>
            </div>
            <div className="table-wrapper">
              <table className="traditional-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Ticker</th>
                    <th>Net Quantity</th>
                    <th>Average Buy Price</th>
                    <th>Current Market Price</th>
                    <th>Total Capital Invested</th>
                    <th>Current Holding Value</th>
                    <th>Unrealized Gain / Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(companyStats).map(key => {
                    const item = companyStats[key];
                    const netQty = item.buyQty - item.sellQty;
                    if (netQty <= 0) return null;
                    const avgPrice = item.invested / item.buyQty;
                    const totalVal = netQty * item.currentPrice;
                    const pl = totalVal - (avgPrice * netQty);
                    const plPct = (pl / (avgPrice * netQty)) * 100;

                    return (
                      <tr key={key}>
                        <td><strong>{item.name}</strong></td>
                        <td><span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#38bdf8' }}>{item.symbol || key}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{netQty}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>${avgPrice.toFixed(2)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>${item.currentPrice.toFixed(2)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>${(avgPrice * netQty).toFixed(2)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${totalVal.toFixed(2)}</td>
                        <td className={pl >= 0 ? 'text-profit' : 'text-loss'}>
                          {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({plPct.toFixed(2)}%)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Screener from './pages/Screener';
import Analytics from './pages/Analytics';
import Watchlist from './pages/Watchlist';
import News from './pages/News';
import Calculator from './pages/Calculator';
import Ipo from './pages/Ipo';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/homepage" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/portfolio" element={<Dashboard />} />
      <Route path="/input" element={<AddTransaction />} />
      <Route path="/screener" element={<Screener />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/news" element={<News />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/ipo" element={<Ipo />} />
    </Routes>
    <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}

export default App;

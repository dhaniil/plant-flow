import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HydroponicDashboard from './App';
import Device from './pages/Devices';
import Graphs from './pages/Graphs';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import { AdminProvider } from '../context/AdminContext'; // Import AdminProvider
import Header from './components/Header';
import Jadwal from './pages/Jadwal';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wrap the Router with AdminProvider */}
    <AdminProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/schedule" element={<Jadwal />} />
          <Route path="/" element={<HydroponicDashboard />} />
          <Route path="/devices" element={<Device />} />
          <Route path="/graphs" element={<Graphs />} />

          <Route path="/login" element={<Login />} />
        </Routes>
        <BottomNav/>
      </Router>
    </AdminProvider>
  </StrictMode>
);

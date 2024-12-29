import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HydroponicDashboard from './App';
import Device from './pages/Devices';
import Graphs from './pages/Graphs';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import GrowthTimelapse from './pages/GrowthTimelapse';
import Login from './pages/Login';
import { AdminProvider } from '../context/AdminContext'; // Import AdminProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wrap the Router with AdminProvider */}
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/timelapse" element={<GrowthTimelapse />} />
          <Route path="/" element={<HydroponicDashboard />} />
          <Route path="/devices" element={<Device />} />
          <Route path="/graphs" element={<Graphs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <BottomNav />
      </Router>
    </AdminProvider>
  </StrictMode>
);

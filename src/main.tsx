import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Devices from './pages/Devices.tsx'
import Graphs from './pages/Graphs.tsx'
import Settings from './pages/Settings.tsx'
import BottomNav from './components/BottomNav.tsx'
import Mongo from './pages/mongo.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/mongo" element={<Mongo />} />
        <Route path="/" element={<App />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </Router>
  </StrictMode>
)


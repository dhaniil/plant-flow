import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Device from './pages/Devices'
import Graphs from './pages/Graphs'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
// import MQTT from './pages/MQTT.tsx'

import React from 'react'
// import ChartCard from './components/ChartCard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* <Route path='/chart' element={<ChartCard initialTitle={''} initialTopic={''} />} /> */}
        {/* <Route path="/mqtt" element={<MQTT />} />
        <Route path="/mongo" element={<Mongo />} /> */}
        <Route path="/" element={<App />} />
        <Route path="/devices" element={<Device />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </Router>
  </StrictMode>
)


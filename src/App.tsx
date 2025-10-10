import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import VisionBoard from './pages/VisionBoard'
import Journal from './pages/Journal'
import Playbook from './pages/Playbook'
import Charts from './pages/Charts'
import Wallet from './pages/Wallet'
import DataSettings from './pages/DataSettings'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vision" element={<VisionBoard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/playbook" element={<Playbook />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/settings" element={<DataSettings />} />
        </Routes>
      </div>
    </div>
  )
}

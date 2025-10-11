import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import VisionBoard from './pages/VisionBoard'
import Journal from './pages/Journal'
import JournalOverview from './pages/JournalOverview'
import TradeAnalytics from './pages/TradeAnalytics'
import Playbook from './pages/Playbook'
import Charts from './pages/Charts'
import SnapshotsOverview from './pages/SnapshotsOverview'
import Wallet from './pages/Wallet'
import News from './pages/News'
import DataMarket from './pages/DataMarket'
import DataSettings from './pages/DataSettings'
import Navbar from './components/Navbar'
import { CurrencyProvider } from './context/CurrencyContext'

export default function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-krbg">
        <Navbar />
        {isHomePage ? (
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        ) : (
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/vision" element={<VisionBoard />} />
              <Route path="/news" element={<News />} />
              <Route path="/data-market" element={<DataMarket />} />
              <Route path="/journal" element={<JournalOverview />} />
              <Route path="/journal/entries" element={<Journal />} />
              <Route path="/journal/analytics" element={<TradeAnalytics />} />
              <Route path="/playbook" element={<Playbook />} />
              <Route path="/snapshots" element={<SnapshotsOverview />} />
              <Route path="/snapshots/charts" element={<Charts />} />
              <Route path="/snapshots/pnl" element={<Charts />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/settings" element={<DataSettings />} />
            </Routes>
          </div>
        )}
      </div>
    </CurrencyProvider>
  )
}

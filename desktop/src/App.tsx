import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
import NewsAndData from './pages/NewsAndData'
import DataMarket from './pages/DataMarket'
import DataSettings from './pages/DataSettings'
import Download from './pages/Download'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingSupportButton from './components/FloatingSupportButton'
import AIChatbot from './components/AIChatbot'
import { CurrencyProvider } from './context/CurrencyContext'

export default function App() {
  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-gradient-to-b from-krblack to-krbg flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vision" element={<VisionBoard />} />
          <Route path="/news" element={<News />} />
          <Route path="/news-and-data" element={<NewsAndData />} />
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
          <Route path="/download" element={<Download />} />
        </Routes>
        <Footer />
        <FloatingSupportButton />
        <AIChatbot />
      </div>
    </CurrencyProvider>
  )
}

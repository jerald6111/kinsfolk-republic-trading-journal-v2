import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AppShell from './components/AppShell'
import LockScreen from './components/LockScreen'
import { CurrencyProvider } from './context/CurrencyContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import AuthNotice from './components/AuthNotice'

// Lazy-load the gated app pages so the public homepage loads fast.
const VisionBoard = lazy(() => import('./pages/VisionBoard'))
const Journal = lazy(() => import('./pages/Journal'))
const JournalOverview = lazy(() => import('./pages/JournalOverview'))
const TradeAnalytics = lazy(() => import('./pages/TradeAnalytics'))
const Playbook = lazy(() => import('./pages/Playbook'))
const Charts = lazy(() => import('./pages/Charts'))
const SnapshotsOverview = lazy(() => import('./pages/SnapshotsOverview'))
const Wallet = lazy(() => import('./pages/Wallet'))
const MarketData = lazy(() => import('./pages/MarketData'))
const DataSettings = lazy(() => import('./pages/DataSettings'))
const Download = lazy(() => import('./pages/Download'))
const RiskCalculator = lazy(() => import('./pages/RiskCalculator'))

// Public info pages (no passcode required)
const Documentation = lazy(() => import('./pages/Documentation'))
const Changelog = lazy(() => import('./pages/Changelog'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-32 text-krmuted">
      <div className="h-7 w-7 rounded-full border-2 border-krborder border-t-krgold animate-spin" />
    </div>
  )
}

/** Gate: renders the lock screen until the vault is unlocked, then the app shell. */
function Protected() {
  const { status } = useAuth()
  if (status !== 'unlocked') return <LockScreen />
  return <AppShell />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <CurrencyProvider>
        <AuthNotice />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public marketing homepage */}
          <Route path="/" element={<Home />} />

          {/* Public info pages */}
          <Route path="/docs" element={<Documentation />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<CookiePolicy />} />

          {/* Everything below is gated behind the passcode + rendered in the app shell */}
          <Route element={<Protected />}>
            <Route path="/vision" element={<VisionBoard />} />
            <Route path="/data-market" element={<MarketData />} />
            <Route path="/journal" element={<JournalOverview />} />
            <Route path="/journal/entries" element={<Journal />} />
            <Route path="/journal/analytics" element={<TradeAnalytics />} />
            <Route path="/playbook" element={<Playbook />} />
            <Route path="/calculator" element={<RiskCalculator />} />
            <Route path="/snapshots" element={<SnapshotsOverview />} />
            <Route path="/snapshots/charts" element={<Charts />} />
            <Route path="/snapshots/pnl" element={<Charts />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<DataSettings />} />
            <Route path="/download" element={<Download />} />
          </Route>
        </Routes>
        </Suspense>
      </CurrencyProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

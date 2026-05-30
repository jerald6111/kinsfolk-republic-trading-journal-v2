import React from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Target,
  Wallet,
  TrendingUp,
  Calendar,
  Shield,
  Zap,
  Download,
  Monitor,
  ArrowRight,
} from 'lucide-react'
import { Reveal, TiltCard, CountUp } from '../components/Motion'
import Footer from '../components/Footer'
import FloatingSupportButton from '../components/FloatingSupportButton'
import AIChatbot from '../components/AIChatbot'
import { usePwaInstall } from '../hooks/usePwaInstall'

export default function Home() {
  const { canInstall, installed, promptInstall } = usePwaInstall()
  const features = [
    {
      icon: <BarChart3 size={20} />,
      title: 'Advanced Analytics',
      description:
        'Win rate, profit factor, ROI, risk/reward ratios and objective-based breakdowns — computed automatically.',
    },
    {
      icon: <BookOpen size={20} />,
      title: 'Trading Journal',
      description:
        'Document every trade with entry/exit reasons, chart & PNL screenshots, leverage tracking and automatic P&L.',
    },
    {
      icon: <Target size={20} />,
      title: 'Strategy Playbook',
      description:
        'Build your playbook with markdown, strategy images and collapsible sections. Rules and risk per setup.',
    },
    {
      icon: <TrendingUp size={20} />,
      title: 'Live Market Data',
      description:
        'Top 100/200/300 cryptos with real-time prices, 7-day sparklines, trending coins and an economic calendar.',
    },
    {
      icon: <Calendar size={20} />,
      title: 'Visual Snapshots',
      description:
        'A gallery of trade charts and PNL screenshots with filters — plus missed-opportunity logging for review.',
    },
    {
      icon: <Wallet size={20} />,
      title: 'Wallet Management',
      description:
        'Track deposits and withdrawals locally for accurate ROI. No transfers — just clean record-keeping.',
    },
  ]

  const news = [
    {
      title: 'Windows Desktop App Now Available!',
      date: 'October 14, 2025',
      description:
        'Our professional Windows desktop application is ready for production: enhanced security, offline functionality, auto-updates and native performance.',
    },
    {
      title: 'New Analytics Features Released',
      date: 'October 10, 2025',
      description:
        'Advanced analytics including risk metrics, exposure analysis and drawdown tracking to better understand your performance.',
    },
    {
      title: 'Enhanced Trade Entry System',
      date: 'October 5, 2025',
      description:
        'The journal entry system now supports both Spot and Futures trading with automatic P&L calculations and leverage tracking.',
    },
  ]

  const stats = [
    { to: 12000, suffix: '+', label: 'Trades logged' },
    { to: 100, suffix: '%', label: 'On your device' },
    { to: 7, suffix: '', label: 'Modules' },
    { to: 0, suffix: '', label: 'Subscriptions' },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Public header — single Open App entry point (no section menu) */}
      <header className="sticky top-0 z-40 border-b border-krborder bg-krblack/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center text-krblack font-extrabold shadow-btn">KR</div>
            <span className="text-[15px] font-bold tracking-tight text-krwhite">Kinsfolk Republic</span>
          </Link>
          <div className="flex items-center gap-2.5">
            {canInstall && !installed && (
              <button
                onClick={() => promptInstall()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-krborder bg-krpanel px-4 py-2 text-sm font-semibold text-krwhite hover:border-krgold/50 transition"
              >
                <Download size={15} /> Install
              </button>
            )}
            <Link
              to="/journal"
              className="shine rounded-lg bg-krgold px-5 py-2 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-glow relative">
        <div className="grid-bg" />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center pt-20 pb-24">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-krborder bg-krpanel px-3.5 py-1.5 text-xs font-medium text-krmuted">
                <span className="h-1.5 w-1.5 rounded-full bg-krgold" />
                Professional Trading Journal Platform
              </span>
            </Reveal>

            <Reveal delay={1}>
              <h1 className="mt-7 text-5xl md:text-6xl font-extrabold tracking-tight text-krwhite leading-[1.05]">
                Master your <span className="text-krgold">trading</span> journey
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <p className="mx-auto mt-6 max-w-xl text-base md:text-lg leading-relaxed text-krmuted">
                Track, analyse and improve your performance with precise analytics,
                disciplined journaling and clean visualisations — private and on your device.
              </p>
            </Reveal>

            <Reveal delay={3}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/journal/entries"
                  className="shine rounded-lg bg-krgold px-6 py-3 text-sm font-semibold text-krblack shadow-btn transition hover:bg-kryellow"
                >
                  Start Trading Journal
                </Link>
                <Link
                  to="/journal/analytics"
                  className="lift rounded-lg border border-krborder bg-krpanel px-6 py-3 text-sm font-semibold text-krwhite hover:border-krgold/50"
                >
                  View Analytics
                </Link>
              </div>
              <p className="mt-6 text-xs text-krmuted">Free · client-side · no account required</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y border-krborder bg-krpanel/40">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-krborder">
            {[
              { value: '100%', label: 'Private & encrypted' },
              { value: '0', label: 'Trackers' },
              { value: 'Offline', label: 'Works anywhere' },
              { value: 'Free', label: 'No subscription' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={(i % 4) as 0 | 1 | 2 | 3} className="px-6 py-8 text-center">
                <p className="text-3xl font-extrabold text-krwhite">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-krmuted">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop app highlight */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-krgold/30 bg-krgold/5 px-3 py-1 text-xs font-medium text-krgold">
                <Download size={14} /> Installable App
              </span>
              <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-krwhite">
                Install it. Use it <span className="text-krgold">offline</span>.
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-krmuted">
                Add Kinsfolk Republic to your desktop or phone in one tap — no app store, no
                download page. It runs full-screen, works offline, and your encrypted journal
                stays entirely on your device.
              </p>
              <ul className="mt-7 grid grid-cols-2 gap-y-4 text-sm text-krwhite">
                {[
                  { icon: <Download size={15} />, label: 'One-tap install' },
                  { icon: <Zap size={15} />, label: 'Works offline' },
                  { icon: <Shield size={15} />, label: 'Encrypted on-device' },
                  { icon: <Monitor size={15} />, label: 'Desktop & mobile' },
                ].map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <span className="text-krgold">{f.icon}</span> {f.label}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-4">
                {canInstall && !installed ? (
                  <button
                    onClick={() => promptInstall()}
                    className="shine inline-flex items-center gap-2 rounded-lg bg-krgold px-5 py-2.5 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition"
                  >
                    <Download size={16} /> Install app
                  </button>
                ) : (
                  <Link
                    to="/journal"
                    className="shine inline-flex items-center gap-2 rounded-lg bg-krgold px-5 py-2.5 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition"
                  >
                    Open App
                  </Link>
                )}
                <span className="text-xs text-krmuted">
                  {installed ? 'Installed · runs offline' : 'Works on Windows, macOS, Android & iOS'}
                </span>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <TiltCard float className="rounded-2xl border border-krborder bg-krcard p-3 shadow-card">
                <div className="rounded-xl bg-krblack p-4">
                  <div className="pop-sm mb-4 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-krdanger/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-krgold/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-krsuccess/70" />
                    <span className="ml-auto text-[11px] text-krmuted">Kinsfolk Republic Trading Journal</span>
                  </div>
                  <div className="mb-4 h-2 w-2/3 rounded bg-krborder" />
                  <div className="pop grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-krborder bg-krpanel p-3">
                      <div className="h-1.5 w-10 rounded bg-krgold/60" />
                      <div className="mt-2 h-4 w-12 rounded bg-krborder" />
                    </div>
                    <div className="rounded-lg border border-krborder bg-krpanel p-3">
                      <div className="h-1.5 w-10 rounded bg-krborder" />
                      <div className="mt-2 h-4 w-12 rounded bg-krborder" />
                    </div>
                    <div className="rounded-lg border border-krborder bg-krpanel p-3">
                      <div className="h-1.5 w-10 rounded bg-krborder" />
                      <div className="mt-2 h-4 w-12 rounded bg-krborder" />
                    </div>
                  </div>
                  <svg viewBox="0 0 320 90" className="pop-sm mt-4 w-full">
                    <defs>
                      <linearGradient id="eqHome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8B341" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#E8B341" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,70 L40,66 L80,72 L120,54 L160,60 L200,40 L240,46 L280,24 L320,16 L320,90 L0,90 Z"
                      fill="url(#eqHome)"
                    />
                    <path
                      className="draw in"
                      d="M0,70 L40,66 L80,72 L120,54 L160,60 L200,40 L240,46 L280,24 L320,16"
                      fill="none"
                      stroke="#E8B341"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                    />
                  </svg>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-krwhite">
              Everything you need to <span className="text-krgold">trade better</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-krmuted">
              A focused suite to track, analyse and improve — nothing you don't need.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <Reveal key={index} delay={(index % 3) as 0 | 1 | 2}>
                <TiltCard
                  max={7}
                  className="lift group h-full rounded-xl border border-krborder bg-krcard p-6 shadow-card hover:border-krgold/40"
                >
                  <div className="pop-sm mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krgold">
                    {feature.icon}
                  </div>
                  <h3 className="pop-sm text-lg font-bold text-krwhite">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-krmuted">{feature.description}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-krwhite">
              Latest <span className="text-krgold">updates</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-krmuted">
              Stay informed about new features and improvements.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {news.map((item, index) => (
              <Reveal key={index} delay={(index % 3) as 0 | 1 | 2}>
                <div className="lift h-full rounded-xl border border-krborder bg-krcard p-6 shadow-card hover:border-krgold/40">
                  <div className="text-xs uppercase tracking-[0.14em] text-krgold">{item.date}</div>
                  <h3 className="mt-2 text-lg font-bold text-krwhite">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-krmuted">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-glow relative border-t border-krborder">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center py-24">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-krwhite">
                Ready to transform your trading?
              </h2>
            </Reveal>
            <Reveal delay={1}>
              <p className="mx-auto mt-4 max-w-md text-krmuted">
                No account, no subscription. Your data stays with you.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <Link
                to="/journal/entries"
                className="shine mt-8 inline-flex items-center gap-2 rounded-lg bg-krgold px-7 py-3.5 text-sm font-semibold text-krblack shadow-btn transition hover:bg-kryellow"
              >
                Get Started Now <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />

      {/* Support + AI assistant available on the public homepage too */}
      <FloatingSupportButton />
      <AIChatbot />
    </div>
  )
}

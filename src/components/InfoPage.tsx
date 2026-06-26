import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from './Footer'

/** Public, on-style wrapper for static info pages (docs, changelog, legal…). */
export default function InfoPage({
  title, subtitle, children,
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="relative min-h-screen flex flex-col bg-krblack text-krtext">
      <header className="sticky top-0 z-40 border-b border-krborder bg-krblack/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center text-krblack font-extrabold shadow-btn">KR</div>
            <span className="text-[15px] font-bold tracking-tight text-krwhite">Kinsfolk Republic</span>
          </Link>
          <Link to="/journal" className="shine rounded-lg bg-krgold px-5 py-2 text-sm font-semibold text-krblack shadow-btn hover:bg-kryellow transition">
            Open App
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-krwhite">{title}</h1>
          {subtitle && <p className="mt-3 text-krmuted leading-relaxed">{subtitle}</p>}
          <div className="mt-10 space-y-4 text-krmuted leading-relaxed
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-krwhite [&_h2]:mt-9 [&_h2]:mb-2
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-krtext [&_h3]:mt-5
            [&_a]:text-krgold hover:[&_a]:underline
            [&_strong]:text-krtext
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:marker:text-krgold
            [&_code]:rounded [&_code]:bg-krpanel [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-krgold [&_code]:text-sm">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import React from 'react'
import InfoPage from '../components/InfoPage'

const entries = [
  {
    date: 'June 27, 2026',
    tag: 'New',
    title: 'Optional Cloud Sync',
    points: [
      'Sign in to securely back up and sync your journal across devices.',
      'Private to your account with row-level security; auto-sync is optional.',
      'The app stays local-first by default — no account required.',
    ],
  },
  {
    date: 'October 14, 2025',
    tag: 'New',
    title: 'Windows Desktop App',
    points: [
      'Professional Windows desktop build: enhanced security and native performance.',
      'Full offline functionality and automatic updates.',
    ],
  },
  {
    date: 'October 10, 2025',
    tag: 'Improved',
    title: 'Advanced Analytics',
    points: [
      'Added risk metrics, exposure analysis and drawdown tracking.',
      'Objective-based performance breakdowns.',
    ],
  },
  {
    date: 'October 5, 2025',
    tag: 'Improved',
    title: 'Enhanced Trade Entry',
    points: [
      'Spot and Futures support with automatic P&L calculations.',
      'Leverage tracking and maker/taker fee handling.',
    ],
  },
]

export default function Changelog() {
  return (
    <InfoPage title="Changelog" subtitle="New features, improvements and fixes — newest first.">
      <div className="space-y-5 not-prose">
        {entries.map((e) => (
          <div key={e.date} className="rounded-xl border border-krborder bg-krcard p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.14em] text-krgold">{e.date}</span>
              <span className="rounded-full border border-krborder bg-krpanel px-2 py-0.5 text-[11px] font-medium text-krmuted">{e.tag}</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-krwhite">{e.title}</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1.5 marker:text-krgold">
              {e.points.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </InfoPage>
  )
}

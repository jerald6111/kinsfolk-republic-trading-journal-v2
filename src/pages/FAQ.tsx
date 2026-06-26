import React from 'react'
import InfoPage from '../components/InfoPage'

const faqs = [
  {
    q: 'Is my data private?',
    a: 'Yes. By default your journal is encrypted and stored only on your device, protected by your passcode. Nothing is uploaded unless you opt in to Cloud Sync.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. The app is fully usable with no account — just set a passcode. An account is only needed if you want optional cloud sync across devices.',
  },
  {
    q: 'How much does it cost?',
    a: 'It is free. No subscription and no credit card. Optional donations help keep it running and improving.',
  },
  {
    q: 'How does Cloud Sync work?',
    a: 'If you sign in (Settings → Backup & Data), your journal can be backed up to a secure database that only you can access, and synced to any device you sign in on. It is entirely optional and off by default.',
  },
  {
    q: 'How do I move my data to another device?',
    a: 'Either turn on Cloud Sync and sign in on the other device, or use Export to download a JSON backup and Import it on the other device.',
  },
  {
    q: 'What happens if I forget my passcode?',
    a: 'For your security the passcode is not recoverable — it encrypts your local data. Keep a JSON export (or Cloud Sync) as a backup so you never lose your history.',
  },
  {
    q: 'What markets can I track?',
    a: 'Anything — crypto, forex, futures or stocks. You type the ticker, and choose Spot or Futures with leverage.',
  },
  {
    q: 'Is there a desktop app?',
    a: 'Yes — install it from the homepage in one tap, or download the native Windows build from the Download page. It runs offline.',
  },
]

export default function FAQ() {
  return (
    <InfoPage title="Frequently Asked Questions" subtitle="Quick answers about privacy, accounts, pricing and syncing.">
      <div className="space-y-3 not-prose">
        {faqs.map((f, i) => (
          <details key={i} className="group rounded-xl border border-krborder bg-krcard p-5 shadow-soft open:border-krgold/40 transition-colors">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-krwhite">
              {f.q}
              <span className="ml-4 text-krgold transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-krmuted leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  )
}

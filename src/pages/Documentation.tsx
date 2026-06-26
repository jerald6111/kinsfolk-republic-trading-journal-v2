import React from 'react'
import InfoPage from '../components/InfoPage'

export default function Documentation() {
  return (
    <InfoPage
      title="Documentation"
      subtitle="Everything you need to get the most out of Kinsfolk Republic Trading Journal."
    >
      <h2>Getting started</h2>
      <p>
        Kinsfolk Republic is a private, on-device trading journal. The first time you open the app you'll
        create a <strong>passcode</strong> — this encrypts your journal on your device. There's no recovery,
        so keep it safe. Everything works fully offline; an account is optional.
      </p>

      <h2>Logging trades</h2>
      <p>
        Open the <strong>Journal</strong> and add an entry for each trade: ticker, Spot or Futures, position,
        leverage, entry/exit price and time, fees, and your reasons for entering and exiting. P&amp;L is
        calculated automatically, and you can attach chart and PNL screenshots.
      </p>

      <h2>Analytics</h2>
      <p>
        The <strong>Analytics</strong> view computes win rate, profit factor, ROI, risk/reward and
        objective-based breakdowns from your logged trades — no setup required.
      </p>

      <h2>Playbook, Wallet &amp; Snapshots</h2>
      <ul>
        <li><strong>Playbook</strong> — document your setups with markdown, rules and strategy images.</li>
        <li><strong>Wallet</strong> — record deposits and withdrawals for accurate ROI (record-keeping only; no transfers).</li>
        <li><strong>Snapshots</strong> — a gallery of your chart and PNL screenshots with filters.</li>
      </ul>

      <h2>Risk Calculator</h2>
      <p>
        Size positions before you enter using the <strong>Risk Calculator</strong> — set your risk, stop and
        leverage to see position size and potential outcomes.
      </p>

      <h2>Discord posting</h2>
      <p>
        Add one or more Discord webhooks in <strong>Settings → Integrations</strong>, then post any trade
        straight to your channel as a clean embed.
      </p>

      <h2>Backups &amp; cloud sync</h2>
      <ul>
        <li><strong>Export / Import</strong> — download your journal as a JSON file, or import it on another device.</li>
        <li><strong>Email backup</strong> — optionally email yourself a backup automatically (Settings → Backup &amp; Data).</li>
        <li><strong>Cloud Sync</strong> — optionally sign in to securely back up and sync your journal across devices. It stays 100% optional; the app is fully usable without it.</li>
      </ul>

      <h2>Install as an app</h2>
      <p>
        Add Kinsfolk Republic to your desktop or phone in one tap from the homepage — it runs full-screen,
        works offline, and keeps your encrypted journal on your device. A native Windows desktop build is
        also available on the <a href="/download">Download</a> page.
      </p>

      <p className="text-sm">
        Still stuck? Ask in our <a href="https://discord.gg/xRJEgVBVm" target="_blank" rel="noopener noreferrer">Discord community</a>.
      </p>
    </InfoPage>
  )
}

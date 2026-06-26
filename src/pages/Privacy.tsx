import React from 'react'
import InfoPage from '../components/InfoPage'

export default function Privacy() {
  return (
    <InfoPage title="Privacy Policy" subtitle="Last updated: June 27, 2026">
      <p>
        Kinsfolk Republic Trading Journal is built to be private by default. This policy explains what data the
        app handles and the choices you control.
      </p>

      <h2>Data stored on your device</h2>
      <p>
        Your journal (trades, vision board, playbook, wallet and settings) is stored locally in your browser and
        encrypted with your passcode. By default it never leaves your device, and we cannot read it.
      </p>

      <h2>Optional Cloud Sync</h2>
      <p>
        If you choose to sign in and enable Cloud Sync, a copy of your journal is stored in our database (Supabase)
        so it can sync across your devices. It is protected by row-level security, meaning only your authenticated
        account can read or write your data. We do not sell or share it. You can disable sync or delete your account
        at any time, which removes your cloud copy.
      </p>

      <h2>Optional email backup</h2>
      <p>
        If you enable email backup, the app sends a copy of your journal to the email address you provide via an
        email service (Resend). This only happens when you turn it on.
      </p>

      <h2>What we don't do</h2>
      <ul>
        <li>No advertising and no ad trackers.</li>
        <li>No selling or sharing of your personal or trading data.</li>
        <li>No third-party analytics profiling you across the web.</li>
      </ul>

      <h2>Your controls</h2>
      <ul>
        <li><strong>Export</strong> a full copy of your data at any time.</li>
        <li><strong>Delete all data</strong> from your device in Settings.</li>
        <li><strong>Delete your account</strong> (if you created one) to remove your cloud copy.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Reach us in the <a href="https://discord.gg/xRJEgVBVm" target="_blank" rel="noopener noreferrer">Discord community</a>.
      </p>
    </InfoPage>
  )
}

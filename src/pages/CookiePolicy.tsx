import React from 'react'
import InfoPage from '../components/InfoPage'

export default function CookiePolicy() {
  return (
    <InfoPage title="Cookie Policy" subtitle="Last updated: June 27, 2026">
      <p>
        Kinsfolk Republic Trading Journal keeps things minimal. We do not use advertising or cross-site tracking
        cookies.
      </p>

      <h2>What we use instead</h2>
      <p>
        The app stores data in your browser using <code>localStorage</code> — not tracking cookies — purely so it
        can function:
      </p>
      <ul>
        <li>Your encrypted journal and your app settings (currency, preferences).</li>
        <li>If you enable Cloud Sync, a secure sign-in token so you stay logged in on this device.</li>
      </ul>

      <h2>Third parties</h2>
      <p>
        This data stays on your device unless you opt in to a feature that uses a service — for example Cloud Sync
        (Supabase) or email backup (Resend). Those services may set their own functional storage solely to deliver
        the feature you enabled. See our <a href="/privacy">Privacy Policy</a> for details.
      </p>

      <h2>Your control</h2>
      <p>
        You can clear this storage at any time from your browser settings or by using "Delete All Data" in the app.
        Doing so removes your local data and signs you out.
      </p>
    </InfoPage>
  )
}

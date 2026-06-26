import React from 'react'
import InfoPage from '../components/InfoPage'

export default function Terms() {
  return (
    <InfoPage title="Terms & Conditions" subtitle="Last updated: June 27, 2026">
      <p>By using Kinsfolk Republic Trading Journal ("the app"), you agree to these terms.</p>

      <h2>The service</h2>
      <p>
        The app is a personal trading journal and analytics tool. It is provided free of charge and "as is",
        without warranties of any kind. We may add, change or remove features over time.
      </p>

      <h2>Not financial advice</h2>
      <p>
        The app is a record-keeping and analysis tool only. Nothing in it constitutes financial, investment or
        trading advice. It does not provide trading signals and does not manage funds. Trading involves risk, and
        you are solely responsible for your own decisions. Past performance does not guarantee future results.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Keep your passcode safe — it encrypts your data and cannot be recovered.</li>
        <li>Keep your own backups (Export or Cloud Sync); you are responsible for your data.</li>
        <li>Use the app lawfully and only for your own record-keeping.</li>
      </ul>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any loss or damages arising from your use of
        the app, including any trading losses or loss of data.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the app after changes means you accept the
        updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Reach us in the <a href="https://discord.gg/xRJEgVBVm" target="_blank" rel="noopener noreferrer">Discord community</a>.
      </p>
    </InfoPage>
  )
}

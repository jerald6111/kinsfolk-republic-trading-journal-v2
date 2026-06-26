import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, X, Copy, Check } from 'lucide-react'

const flink = 'text-sm text-krtext/80 hover:text-krgold transition-colors'

function FCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-krmuted mb-4">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  )
}

export default function Footer() {
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const cryptoAddresses = [
    { name: 'BNB (BSC)', address: '0xC7793F54Fc11C41Eb90E9AEE2f3bCAa81cDe7a7b', icon: '🟡' },
    { name: 'USDT (POLYGON)', address: '0xC7793F54Fc11C41Eb90E9AEE2f3bCAa81cDe7a7b', icon: '🟢' },
    { name: 'SOL (SOLANA)', address: 'FxArrcbcGTXw99nt1FjM7v8XQ3YiKodr1SiNyZ6eUY9G', icon: '🟣' },
  ]

  const copyToClipboard = (address: string, name: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(name)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <>
      <footer className="bg-krblack border-t border-krborder mt-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
            {/* Brand + socials + support */}
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-krgold to-kryellow flex items-center justify-center text-krblack font-extrabold shadow-btn">KR</div>
                <span className="text-base font-bold tracking-tight text-krwhite">Kinsfolk Republic</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-krmuted">
                A private, on-device trading journal — track every trade, analyse your edge, and build
                consistency. Free, no subscription.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://x.com/jerald6111"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Follow on X" title="Follow on X"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krmuted hover:text-krgold hover:border-krgold/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://discord.gg/xRJEgVBVm"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Join our Discord" title="Join our Discord"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-krborder bg-krpanel text-krmuted hover:text-krgold hover:border-krgold/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </a>
              </div>
              <button
                onClick={() => setShowDonateModal(true)}
                className="shine mt-6 w-fit bg-krgold text-krblack px-5 py-2.5 rounded-lg font-semibold shadow-btn hover:bg-kryellow transition-all flex items-center gap-2"
              >
                <Wallet size={18} />
                Support This Project
              </button>
            </div>

            {/* Product */}
            <FCol title="Product">
              <li><a href="/#features" className={flink}>Features</a></li>
              <li><Link to="/docs" className={flink}>Documentation</Link></li>
              <li><Link to="/changelog" className={flink}>Changelog</Link></li>
              <li><Link to="/faq" className={flink}>FAQ</Link></li>
            </FCol>

            {/* App */}
            <FCol title="App">
              <li><Link to="/journal" className={flink}>Trading Journal</Link></li>
              <li><Link to="/journal/analytics" className={flink}>Analytics</Link></li>
              <li><Link to="/playbook" className={flink}>Playbook</Link></li>
              <li><Link to="/calculator" className={flink}>Risk Calculator</Link></li>
              <li><Link to="/wallet" className={flink}>Wallet</Link></li>
              <li><Link to="/data-market" className={flink}>Market Data</Link></li>
              <li><Link to="/download" className={flink}>Download</Link></li>
            </FCol>

            {/* Legal */}
            <FCol title="Legal">
              <li><Link to="/privacy" className={flink}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={flink}>Terms &amp; Conditions</Link></li>
              <li><Link to="/cookies" className={flink}>Cookie Policy</Link></li>
            </FCol>
          </div>

          <div className="mt-10 border-t border-krborder pt-6 text-center text-xs text-krmuted">
            &copy; 2025 Created by Jerald L. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Donate Modal */}
      {showDonateModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDonateModal(false)}
        >
          <div
            className="bg-krcard border border-krborder rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-krborder flex items-center justify-between">
              <h2 className="text-2xl font-bold text-krwhite">Support This Project</h2>
              <button
                onClick={() => setShowDonateModal(false)}
                className="p-2 hover:bg-krgold/20 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400 hover:text-krtext" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-300 mb-6">
                To keep this website free and continuously improving, your donations help us maintain and develop new features. Every contribution is greatly appreciated! 🙏
              </p>

              <div className="space-y-4">
                {cryptoAddresses.map((crypto, index) => (
                  <div key={index} className="bg-krblack/30 rounded-lg p-4 border border-krborder">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{crypto.icon}</span>
                        <span className="font-semibold text-krwhite">{crypto.name}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(crypto.address, crypto.name)}
                        className="flex items-center gap-2 bg-krgold/20 hover:bg-krgold/30 text-krgold px-3 py-1 rounded-md transition-colors text-sm font-medium"
                      >
                        {copiedAddress === crypto.name ? (
                          <>
                            <Check size={16} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div
                      className="text-xs text-gray-400 break-all font-mono bg-krblack/50 p-2 rounded cursor-pointer hover:text-krgold transition-colors"
                      onClick={() => copyToClipboard(crypto.address, crypto.name)}
                      title="Click to copy"
                    >
                      {crypto.address}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                Click on any address to copy it to your clipboard
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Notification */}
      {copiedAddress && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <Check size={20} />
          <span>Address copied to clipboard!</span>
        </div>
      )}
    </>
  )
}

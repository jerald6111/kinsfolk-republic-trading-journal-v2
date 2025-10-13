import React, { useState } from 'react'
import { Wallet, X, Copy, Check } from 'lucide-react'

export default function Footer() {
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const cryptoAddresses = [
    {
      name: 'BNB (BSC)',
      address: '0x1607a2dDdbC5FF3F680c9153594d066f890CD685',
      icon: '🟡'
    },
    {
      name: 'USDT (TRON)',
      address: 'TByh1rM1dSMAMBywRZMb1kpFTGhcvKURq2',
      icon: '🟢'
    },
    {
      name: 'SOL (SOLANA)',
      address: '5EbXUm76McqfRGgH79RzsbzDZ3Z7jYu6JnmoM9BPHPAH',
      icon: '🟣'
    }
  ]

  const copyToClipboard = (address: string, name: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(name)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <>
      <footer className="bg-krblack border-t border-krborder py-8 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              &copy; 2025 Created by Jerald L. All rights reserved.
            </div>
            <button
              onClick={() => setShowDonateModal(true)}
              className="bg-gradient-to-r from-krgold to-kryellow text-krblack px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all flex items-center gap-2"
            >
              <Wallet size={18} />
              Support This Project
            </button>
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

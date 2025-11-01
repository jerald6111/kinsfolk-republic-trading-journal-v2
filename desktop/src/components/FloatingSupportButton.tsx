import React, { useState, useEffect } from 'react'
import { Wallet, X, Copy, Check } from 'lucide-react'

export default function FloatingSupportButton() {
  const [showButton, setShowButton] = useState(true)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const cryptoAddresses = [
    {
      name: 'BNB (BSC)',
      address: '0xC7793F54Fc11C41Eb90E9AEE2f3bCAa81cDe7a7b',
      icon: '🟡'
    },
    {
      name: 'USDT (POLYGON)',
      address: '0xC7793F54Fc11C41Eb90E9AEE2f3bCAa81cDe7a7b',
      icon: '🟢'
    },
    {
      name: 'SOL (SOLANA)',
      address: 'FxArrcbcGTXw99nt1FjM7v8XQ3YiKodr1SiNyZ6eUY9G',
      icon: '🟣'
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      // Calculate if user is at the bottom (with 100px threshold)
      const isAtBottom = windowHeight + scrollTop >= documentHeight - 100
      
      setShowButton(!isAtBottom)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const copyToClipboard = (address: string, name: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(name)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={() => setShowDonateModal(true)}
        className={`fixed bottom-6 left-6 bg-gradient-to-r from-krgold to-kryellow text-krblack px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-krgold/50 transition-all flex items-center gap-2 z-40 ${
          showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'
        }`}
        style={{ transition: 'all 0.3s ease-in-out' }}
      >
        <Wallet size={20} />
        <span className="hidden sm:inline">Support This Project</span>
        <span className="sm:hidden">Support</span>
      </button>

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

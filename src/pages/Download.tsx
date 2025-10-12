import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Download as DownloadIcon, 
  Shield, 
  Zap, 
  Monitor,
  Lock,
  Wifi,
  HardDrive,
  Clock,
  CheckCircle,
  ArrowRight,
  Laptop
} from 'lucide-react'

export default function Download() {
  const benefits = [
    {
      icon: <Wifi className="text-krgold" size={24} />,
      title: 'Works Offline',
      description: 'No internet connection required once installed. Trade and analyze anywhere, anytime.'
    },
    {
      icon: <Shield className="text-krgold" size={24} />,
      title: 'Enhanced Security',
      description: 'Your trading data never leaves your computer. Complete privacy and security guaranteed.'
    },
    {
      icon: <Zap className="text-krgold" size={24} />,
      title: 'Lightning Fast',
      description: 'Native desktop performance with instant load times and smooth interactions.'
    },
    {
      icon: <Lock className="text-krgold" size={24} />,
      title: 'Local Data Storage',
      description: 'All your trades, strategies, and analytics stored securely on your device.'
    },
    {
      icon: <HardDrive className="text-krgold" size={24} />,
      title: 'No Cloud Dependencies',
      description: 'Independent of cloud services. Your data, your control, your device.'
    },
    {
      icon: <Clock className="text-krgold" size={24} />,
      title: '24/7 Availability',
      description: 'Access your trading journal anytime without worrying about server downtime.'
    }
  ]

  const features = [
    'Complete trading journal with analytics',
    'Vision board for motivation and goals',
    'Advanced PnL tracking and visualization',
    'Strategy playbook management',
    'Real-time market data integration',
    'AI-powered trading assistant',
    'Dark theme optimized for trading',
    'System tray integration'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-krgold/10 border border-krgold/20 rounded-full px-4 py-2 mb-6">
                <Laptop className="text-krgold" size={16} />
                <span className="text-sm text-krgold font-semibold">Windows Desktop Application</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-krwhite mb-6">
                Take Your Trading <span className="bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Offline</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Want to use KRTJ without internet? No problem! Download our Windows desktop app for the ultimate offline trading journal experience.
              </p>
              
              <div className="bg-krcard/80 backdrop-blur-sm border border-krborder rounded-xl p-8 mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Monitor className="text-krgold" size={32} />
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-krwhite">Kinsfolk Republic Trading Journal</h3>
                    <p className="text-gray-400">Version 1.0.0 • Windows 10/11</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    // Direct download from website hosting
                    const link = document.createElement('a')
                    link.href = '/downloads/KRTJ-Desktop-Setup.exe'
                    link.download = 'KRTJ-Desktop-Setup.exe'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="w-full bg-gradient-to-r from-krgold to-kryellow text-krblack px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all flex items-center justify-center gap-2"
                >
                  <DownloadIcon size={20} />
                  Download for Windows (FREE)
                </button>
                
                <p className="text-sm text-gray-400 mt-3">
                  ~45MB • One-time download • No subscription required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-krblack/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
                Why Go <span className="bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Desktop?</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Experience the power of offline trading analysis with enhanced performance and security
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-krcard/80 backdrop-blur-sm border border-krborder rounded-xl p-6 hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200"
                >
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-krwhite mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
                  Full Feature <span className="bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Parity</span>
                </h2>
                <p className="text-gray-400">
                  Get the complete KRTJ experience with all features available offline
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-krcard/40 backdrop-blur-sm border border-krborder rounded-lg p-4"
                  >
                    <CheckCircle className="text-krgold flex-shrink-0" size={20} />
                    <span className="text-krwhite">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="py-20 bg-krblack/20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-krwhite mb-8">System Requirements</h2>
              
              <div className="bg-krcard/80 backdrop-blur-sm border border-krborder rounded-xl p-8">
                <div className="grid gap-4 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Operating System:</span>
                    <span className="text-krwhite">Windows 10/11 (64-bit)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">RAM:</span>
                    <span className="text-krwhite">4GB minimum, 8GB recommended</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage:</span>
                    <span className="text-krwhite">200MB free space</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Internet:</span>
                    <span className="text-krwhite">Optional (for price data only)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-krgold/10 to-kryellow/10">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Shield className="text-krgold mx-auto mb-6" size={48} />
              <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
                Ready for Offline Trading?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Download KRTJ Desktop and take your trading analysis anywhere
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = '/downloads/KRTJ-Desktop-Setup.exe'
                    link.download = 'KRTJ-Desktop-Setup.exe'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="bg-gradient-to-r from-krgold to-kryellow text-krblack px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all flex items-center gap-2"
                >
                  <DownloadIcon size={20} />
                  Download Now
                </button>
                <Link
                  to="/"
                  className="bg-krcard/80 backdrop-blur-sm border border-krborder text-krwhite px-8 py-3 rounded-xl font-semibold hover:border-krgold hover:shadow-lg hover:shadow-krgold/10 transition-all flex items-center gap-2"
                >
                  Try Web Version
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
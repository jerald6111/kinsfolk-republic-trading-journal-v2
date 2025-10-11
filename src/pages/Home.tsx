import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, 
  BookOpen, 
  Target, 
  Wallet, 
  TrendingUp, 
  Calendar,
  Shield,
  Zap,
  X,
  Copy,
  Check
} from 'lucide-react'

export default function Home() {
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const features = [
    {
      icon: <BarChart3 className="text-krgold" size={32} />,
      title: 'Advanced Analytics',
      description: 'Track your performance with comprehensive analytics including win rate, profit factor, ROI, and more.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'
    },
    {
      icon: <BookOpen className="text-krgold" size={32} />,
      title: 'Trading Journal',
      description: 'Document every trade with detailed entry and exit reasons, screenshots, and performance metrics.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop'
    },
    {
      icon: <Target className="text-krgold" size={32} />,
      title: 'Strategy Playbook',
      description: 'Build and refine your trading strategies with a customizable playbook system.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'
    },
    {
      icon: <TrendingUp className="text-krgold" size={32} />,
      title: 'Performance Tracking',
      description: 'Visualize your equity curve, track drawdowns, and analyze your trading streaks.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop'
    },
    {
      icon: <Calendar className="text-krgold" size={32} />,
      title: 'PNL Calendar',
      description: 'View your daily, weekly, and monthly performance at a glance with an intuitive calendar view.',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop'
    },
    {
      icon: <Wallet className="text-krgold" size={32} />,
      title: 'Wallet Management',
      description: 'Track deposits, withdrawals, and see your real-time trading balance with fee accounting.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop'
    }
  ]

  const news = [
    {
      title: 'New Analytics Features Released',
      date: 'October 10, 2025',
      description: 'We\'ve added advanced analytics including risk metrics, exposure analysis, and drawdown tracking to help you better understand your trading performance.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop'
    },
    {
      title: 'Enhanced Trade Entry System',
      date: 'October 5, 2025',
      description: 'The journal entry system now supports both Spot and Futures trading with automatic P&L calculations and leverage tracking.',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&auto=format&fit=crop'
    },
    {
      title: 'Vision Board & Goal Setting',
      date: 'September 28, 2025',
      description: 'Set and track your trading goals with our new Vision Board feature. Visualize your success and stay motivated.',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&auto=format&fit=crop'
    }
  ]

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
    <div className="min-h-screen bg-krbg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-krblack to-krbg py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-krgold/10 border border-krgold/20 rounded-full px-4 py-2 mb-6">
              <Zap className="text-krgold" size={16} />
              <span className="text-sm text-krgold font-semibold">Professional Trading Journal Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-krwhite mb-6">
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-krgold to-kryellow">Trading Journey</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Track, analyze, and improve your trading performance with powerful analytics, comprehensive journaling, and intuitive visualizations.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/journal/entries"
                className="bg-gradient-to-r from-krgold to-kryellow text-krblack px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all"
              >
                Start Trading Journal
              </Link>
              <Link
                to="/journal/analytics"
                className="bg-krcard border border-krborder text-krwhite px-8 py-3 rounded-lg font-semibold hover:border-krgold transition-all"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-krbg">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
              Everything You Need to <span className="text-krgold">Trade Better</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you track, analyze, and improve your trading performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-krcard border border-krborder rounded-xl p-6 hover:border-krgold/50 transition-all group"
              >
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-krblack/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-krwhite mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-krblack/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
              Latest <span className="text-krgold">Updates</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Stay informed about new features and improvements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <div
                key={index}
                className="bg-krcard border border-krborder rounded-xl overflow-hidden hover:border-krgold/50 transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-krgold mb-2">{item.date}</div>
                  <h3 className="text-xl font-bold text-krwhite mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-krgold/10 to-kryellow/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="text-krgold mx-auto mb-6" size={48} />
            <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join traders who are taking their performance to the next level
            </p>
            <Link
              to="/journal/entries"
              className="inline-block bg-gradient-to-r from-krgold to-kryellow text-krblack px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-krblack border-t border-krborder py-8">
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
    </div>
  )
}

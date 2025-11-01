import React from 'react'
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
  Download,
  Monitor,
  ArrowRight
} from 'lucide-react'

export default function Home() {

  const features = [
    {
      icon: <BarChart3 className="text-krgold" size={32} />,
      title: 'Advanced Analytics',
      description: 'Track performance with comprehensive analytics: win rate, profit factor, ROI, risk/reward ratios, and objective-based breakdowns.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop'
    },
    {
      icon: <BookOpen className="text-krgold" size={32} />,
      title: 'Trading Journal',
      description: 'Document every trade with detailed entry/exit reasons, chart and PNL screenshots, leverage tracking, and automatic P&L calculations.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop'
    },
    {
      icon: <Target className="text-krgold" size={32} />,
      title: 'Strategy Playbook',
      description: 'Build your trading playbook with markdown support, strategy images, and collapsible sections. Define entry/exit rules and risk management per setup.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop'
    },
    {
      icon: <TrendingUp className="text-krgold" size={32} />,
      title: 'Live Market Data',
      description: 'Access Top 100/200/300 cryptos with real-time prices, 7-day sparklines, trending coins, economic calendar, and market heatmap (updates every 60s).',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop'
    },
    {
      icon: <Calendar className="text-krgold" size={32} />,
      title: 'Visual Snapshots',
      description: 'Gallery of trade charts and PNL screenshots with filters. NEW: Upload missed opportunities (not counted as entries) for learning purposes.',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop'
    },
    {
      icon: <Wallet className="text-krgold" size={32} />,
      title: 'Wallet Management',
      description: 'Track deposits and withdrawals locally for accurate ROI calculations. No real money transfers - just personal record-keeping.',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop'
    }
  ]

  const news = [
    {
      title: 'Windows Desktop App Now Available!',
      date: 'October 14, 2025',
      description: 'Our professional Windows desktop application is now ready for production! Enhanced security, offline functionality, auto-updates, and native performance. Download now and take your trading journal offline.',
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&auto=format&fit=crop'
    },
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
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-krblack to-gray-950 relative overflow-hidden">
      {/* Animated gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-krgold/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-kryellow/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-transparent to-transparent py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-krgold/10 border border-krgold/20 rounded-full px-4 py-2 mb-6">
              <Zap className="text-krgold" size={16} />
              <span className="text-sm text-krgold font-semibold">Professional Trading Journal Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-krwhite mb-6">
              Master Your <span className="bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Trading Journey</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Track, analyze, and improve your trading performance with powerful analytics, comprehensive journaling, and intuitive visualizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/journal/entries"
                className="bg-gradient-to-r from-krgold to-kryellow text-krblack px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all"
              >
                Start Trading Journal
              </Link>
              <Link
                to="/journal/analytics"
                className="bg-krcard/80 backdrop-blur-sm border border-krborder text-krwhite px-8 py-3 rounded-xl font-semibold hover:border-krgold hover:shadow-lg hover:shadow-krgold/10 transition-all"
              >
                View Analytics
              </Link>
            </div>
            
            {/* Windows App Announcement */}
            <div className="mt-8 inline-flex items-center gap-2 bg-krgold/10 border border-krgold/30 rounded-full px-4 py-2">
              <Monitor className="text-krgold" size={16} />
              <span className="text-sm text-krgold">
                Desktop app coming soon with enhanced offline features!
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop App Highlight Section */}
      <section className="py-16 bg-gradient-to-r from-krgold/5 to-kryellow/5 border-y border-krgold/10">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-krgold/10 border border-krgold/20 rounded-full px-4 py-2 mb-4">
                  <Monitor className="text-krgold" size={16} />
                  <span className="text-sm text-krgold font-semibold">Desktop Application Available</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
                  Take KRTJ <span className="bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Offline</span>
                </h2>
                <p className="text-gray-300 mb-6 text-lg">
                  Experience enhanced security, lightning-fast performance, and complete offline functionality with our Windows desktop application. Professional trading journal software ready for production use.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Shield className="text-krgold" size={16} />
                    <span className="text-sm text-gray-300">100% Offline Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-krgold" size={16} />
                    <span className="text-sm text-gray-300">Native Performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="text-krgold" size={16} />
                    <span className="text-sm text-gray-300">Dark Theme Optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="text-krgold" size={16} />
                    <span className="text-sm text-gray-300">Auto-Updates Included</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 bg-krgold/10 border border-krgold/30 text-krgold px-6 py-3 rounded-lg font-semibold">
                  <Download size={16} />
                  Coming Soon
                </div>
                <p className="text-sm text-gray-400 mt-2">Desktop app is being rebuilt with enhanced features</p>
              </div>
              
              <div className="relative">
                <div className="bg-krcard/60 backdrop-blur-sm border border-krborder rounded-xl p-6">
                  <div className="bg-krblack rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-400 ml-auto">Kinsfolk Republic Trading Journal</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-krgold/30 rounded w-3/4"></div>
                      <div className="h-2 bg-krgray/30 rounded w-1/2"></div>
                      <div className="h-2 bg-krgold/20 rounded w-2/3"></div>
                      <div className="flex gap-2 mt-4">
                        <div className="h-12 bg-krgold/20 rounded flex-1"></div>
                        <div className="h-12 bg-krgray/20 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      <Monitor className="inline w-4 h-4 mr-1" />
                      Windows 10/11 Compatible
                    </p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-krgold text-krblack rounded-full px-3 py-1 text-xs font-bold">
                  NEW!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
              Everything You Need to <span className="bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Trade Better</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you track, analyze, and improve your trading performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-krcard/80 backdrop-blur-sm border border-krborder rounded-xl p-6 hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 group"
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
      <section className="py-20 bg-krblack/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-krwhite mb-4">
              Latest <span className="bg-gradient-to-r from-krgold to-kryellow bg-clip-text text-transparent">Updates</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Stay informed about new features and improvements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <div
                key={index}
                className="bg-krcard/80 backdrop-blur-sm border border-krborder rounded-xl overflow-hidden hover:border-krgold/70 hover:shadow-lg hover:shadow-krgold/10 transition-all duration-200 group"
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
              className="inline-block bg-gradient-to-r from-krgold to-kryellow text-krblack px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Shield, Navigation, HelpCircle } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface QuickAction {
  id: string
  label: string
  icon: JSX.Element
  response: string
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'security',
      label: 'Security Features',
      icon: <Shield className="w-4 h-4" />,
      response: `🔒 **Kinsfolk Republic Security Features:**

• **Client-Side Only**: All data processing happens in your browser - no server storage
• **No Personal Data Collection**: We don't store your trading data or personal information
• **Open Source**: Full transparency - you can review our code on GitHub
• **RSS Feed Integration**: News comes directly from trusted sources (CoinTelegraph, MarketWatch, BBC)
• **No Login Required**: Use all features without creating accounts or sharing personal details
• **HTTPS Encryption**: All connections are secure and encrypted
• **No Third-Party Tracking**: We don't use analytics or tracking cookies

Your privacy and security are our top priorities! 🛡️`
    },
    {
      id: 'navigation',
      label: 'How to Navigate',
      icon: <Navigation className="w-4 h-4" />,
      response: `🧭 **How to Navigate Kinsfolk Republic:**

**📈 Trading Journal:**
• Track your trades with detailed entry/exit records
• Analyze performance with profit/loss calculations
• View trading statistics and insights

**📰 News & Data Hub:**
• Access live market news from multiple sources
• Filter by Crypto, Stocks, Forex, or World news
• News updates every minute automatically

**💹 Data Market:**
• View market data and financial insights
• Access trading tools and analysis

**🎯 Quick Tips:**
• Use the top navigation menu to switch between sections
• All features work offline after initial load
• No account needed - start using immediately!

Navigate like a pro! 🚀`
    },
    {
      id: 'features',
      label: 'Key Features',
      icon: <HelpCircle className="w-4 h-4" />,
      response: `✨ **Kinsfolk Republic Key Features:**

**🔥 Trading Journal:**
• Record buy/sell trades with automatic P&L calculation
• Track portfolio performance over time
• Export data for tax reporting
• Completely private - stored locally in your browser

**📈 Live Market News:**
• Real-time RSS feeds from CoinTelegraph, MarketWatch, ForexLive, BBC
• Updates every 60 seconds automatically
• Thumbnail images for better visual experience
• Pagination for easy browsing through news history

**🎨 Professional Design:**
• Custom Kinsfolk Republic theme with gold accents
• Mobile-responsive design works on all devices
• Dark theme optimized for trading environments
• Glass morphism UI effects for modern appeal

**🔒 Privacy-First:**
• No data leaves your browser
• No account registration required
• Open source and transparent

Ready to dominate the markets? 💪`
    }
  ]

  const botResponses: Record<string, string> = {
    'hello': 'Hello! 👋 Welcome to Kinsfolk Republic Trading Journal! I\'m here to help you navigate our platform and answer any questions about security and features.',
    'help': 'I can help you with:\n• Understanding our security features 🔒\n• Learning how to navigate the website 🧭\n• Exploring key features ✨\n\nWhat would you like to know?',
    'trading': '📈 The Trading Journal lets you track your trades, calculate P&L automatically, and analyze your performance. All data is stored locally in your browser for maximum privacy!',
    'news': '📰 Our News section provides live updates from CoinTelegraph, MarketWatch, ForexLive, and BBC News. Updates happen every minute with new articles stacking on top!',
    'privacy': '🔒 Your privacy is paramount! All data processing happens client-side, we don\'t collect personal information, and everything is open source for transparency.',
    'safe': '✅ Absolutely! Our platform is completely client-side, meaning your data never leaves your browser. No servers, no data collection, no tracking!',
    'default': 'I\'m here to help with questions about navigation, security, and features of Kinsfolk Republic Trading Journal. Try asking about "security", "navigation", or "features"!'
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("👋 Hello! I'm your Kinsfolk Republic assistant. I'm here to help you navigate our trading platform and answer security questions. How can I help you today?")
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addBotMessage = (content: string) => {
    const newMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const processMessage = (message: string) => {
    const lowerMessage = message.toLowerCase().trim()
    
    // Check for keywords and provide appropriate responses
    let response = botResponses.default
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = botResponses.hello
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = botResponses.help
    } else if (lowerMessage.includes('trading') || lowerMessage.includes('journal') || lowerMessage.includes('trade')) {
      response = botResponses.trading
    } else if (lowerMessage.includes('news') || lowerMessage.includes('market') || lowerMessage.includes('rss')) {
      response = botResponses.news
    } else if (lowerMessage.includes('privacy') || lowerMessage.includes('data') || lowerMessage.includes('personal')) {
      response = botResponses.privacy
    } else if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('security')) {
      response = botResponses.safe
    }
    
    return response
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    addUserMessage(inputMessage)
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const response = processMessage(inputMessage)
      addBotMessage(response)
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
  }

  const handleQuickAction = (action: QuickAction) => {
    addUserMessage(action.label)
    setIsTyping(true)

    setTimeout(() => {
      addBotMessage(action.response)
      setIsTyping(false)
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-krgold to-kryellow text-krblack p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 group"
          aria-label="Open AI Chatbot"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden group-hover:block text-sm font-medium whitespace-nowrap">
            Need Help?
          </span>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[500px] bg-krcard border border-krborder rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-krgold to-kryellow text-krblack p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm">Kinsfolk AI Assistant</h3>
                <p className="text-xs opacity-80">Here to help you navigate</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/10 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-3 border-b border-krborder">
              <p className="text-xs text-krmuted mb-2">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-krgold/20 text-krgold border border-krgold/30 rounded-full hover:bg-krgold/30 transition-colors"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  message.type === 'user' 
                    ? 'bg-krgold text-krblack' 
                    : 'bg-krgray text-krgold'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[280px] p-3 rounded-lg text-sm ${
                  message.type === 'user'
                    ? 'bg-krgold text-krblack ml-auto'
                    : 'bg-krgray text-krtext'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 opacity-70 ${
                    message.type === 'user' ? 'text-krblack/70' : 'text-krmuted'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-krgray text-krgold flex items-center justify-center text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-krgray text-krtext p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-krgold rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-krgold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-krgold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-krborder">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about navigation, security, features..."
                className="flex-1 bg-krgray text-krtext px-3 py-2 rounded-lg text-sm border border-krborder focus:border-krgold focus:outline-none"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-krgold text-krblack p-2 rounded-lg hover:bg-kryellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-krmuted mt-1">
              AI assistant for navigation and security questions
            </p>
          </div>
        </div>
      )}
    </>
  )
}
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Shield, Navigation, HelpCircle, TrendingUp, Mail } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: Date
}

interface QuickAction {
  id: string
  label: string
  icon: JSX.Element
  response: string
}

interface UserInfo {
  name: string
  email: string
  hasProvidedInfo: boolean
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '', hasProvidedInfo: false })
  const [showEmailPrompt, setShowEmailPrompt] = useState(false)
  const [showConversationSender, setShowConversationSender] = useState(false)
  const [loadingPriceData, setLoadingPriceData] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions: QuickAction[] = [
    {
      id: 'platform_overview',
      label: 'What is KRTJ?',
      icon: <Shield className="w-4 h-4" />,
      response: `🎯 **Kinsfolk Republic Trading Journal (KRTJ)**

Hey! I'm your Kinsfolk Assistant - part customer service, part trading mentor. KRTJ is a web-based trading journal and analytics dashboard that helps you log, analyze, and improve your trading performance across crypto, stocks, and forex.

**Core Sections:**
• **Vision Board**: Motivation hub for goals and affirmations
• **Dashboard**: PNL, Win Rate, ROI overview  
• **Journal**: Log every trade with reasoning and screenshots
• **Strategies**: Store your playbooks and setups
• **Snapshots**: Visual gallery of trades and patterns
• **Wallets**: Track deposits/withdrawals (ROI only updates from trading results)

Built for traders who want clarity, discipline, and data-driven results! �`
    },
    {
      id: 'analytics',
      label: 'Analytics Guide',
      icon: <TrendingUp className="w-4 h-4" />,
      response: `📊 **Analytics Breakdown - Let's decode your numbers:**

• **Win Rate**: (Wins ÷ Total Trades) × 100 - Aim for consistency over perfection
• **Profit Factor**: Gross Profit ÷ Gross Loss - Above 1.5 shows solid edge
• **ROI**: (Current Balance - Deposits) ÷ Deposits × 100 - Withdrawals from profit don't affect this
• **Risk/Reward**: Average Win ÷ Average Loss - Healthy systems maintain 1.5:1+
• **PNL Calendar**: Visual timeline of your trading journey
• **Top 5 Pairs**: Your best performers ranked by total PNL

Remember: Focus on process over profits. Your Journal is your mirror! 🪞`
    },
    {
      id: 'trading_help',
      label: 'Trading Guidance',
      icon: <HelpCircle className="w-4 h-4" />,
      response: `🎯 **Trading Wisdom - Keep it simple:**

**Risk Management:**
• Never risk more than 1-2% per trade
• Tighten stop losses, loosen your ego
• Capital protection first, profits second

**Psychology:**
• Trading is 80% mindset - your Journal is your therapist
• When emotions rise, position size should fall
• FOMO entries feel good short-term, but they're emotionally expensive

**Discipline Beats Signals:**
• You don't need more setups - you need more patience
• Focus on execution, not outcome
• Sometimes the best trade is no trade

What's your biggest trading challenge right now? 🤔`
    },
    {
      id: 'market_data',
      label: 'Check Prices',
      icon: <TrendingUp className="w-4 h-4" />,
      response: `💰 **Live Market Data Available!**

I can check real-time prices from CoinGecko for:
• **Bitcoin (BTC)** - "What's BTC price?"
• **Ethereum (ETH)** - "ETH price now"
• **Solana (SOL)** - "How much is SOL?"
• **And many more!** ADA, DOGE, BNB, XRP, AVAX, MATIC, DOT, LINK

Just ask naturally like "Bitcoin price" or "How much is ETH?" and I'll pull live data with 24h changes, market cap, and volume!

Which coin are you watching? 📊`
    }
  ]

  const getSmartResponse = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase().trim()
    
    // Price queries - CoinGecko integration
    if (lowerMessage.includes('price') || lowerMessage.includes('btc') || lowerMessage.includes('eth') || 
        lowerMessage.includes('bitcoin') || lowerMessage.includes('ethereum') || 
        lowerMessage.match(/what.*(cost|worth|trading)/i)) {
      
      // Extract coin mentions
      const coinMap: Record<string, string> = {
        'bitcoin': 'bitcoin',
        'btc': 'bitcoin',
        'ethereum': 'ethereum', 
        'eth': 'ethereum',
        'solana': 'solana',
        'sol': 'solana',
        'cardano': 'cardano',
        'ada': 'cardano',
        'dogecoin': 'dogecoin',
        'doge': 'dogecoin',
        'bnb': 'binancecoin',
        'binance': 'binancecoin',
        'xrp': 'ripple',
        'ripple': 'ripple',
        'avax': 'avalanche-2',
        'avalanche': 'avalanche-2',
        'matic': 'matic-network',
        'polygon': 'matic-network',
        'dot': 'polkadot',
        'polkadot': 'polkadot',
        'link': 'chainlink',
        'chainlink': 'chainlink'
      }

      for (const [keyword, coinId] of Object.entries(coinMap)) {
        if (lowerMessage.includes(keyword)) {
          const priceData = await fetchCoinPrice(coinId)
          return formatPriceData(priceData, keyword)
        }
      }

      // Generic price request
      if (lowerMessage.includes('price') && !Object.keys(coinMap).some(k => lowerMessage.includes(k))) {
        return `💰 **I can check prices for you!** Just ask like:

• "What's the Bitcoin price?"
• "BTC price now" 
• "How much is ETH?"
• "Solana price check"

**Supported coins**: BTC, ETH, SOL, ADA, DOGE, BNB, XRP, AVAX, MATIC, DOT, LINK, and more!

Which coin price do you want to check? 📊`
      }
    }
    
    // Emotional responses for trading situations
    if (lowerMessage.includes('liquidated') || lowerMessage.includes('rekt') || lowerMessage.includes('account wiped')) {
      return "Ouch 😬 liquidation stings. Happens to all of us. Reset, refocus, and rebuild smarter. Was it overleverage or no stop-loss? Let's check that trade in your Journal - the lesson is usually hiding there."
    }
    
    if (lowerMessage.includes('stop loss') || lowerMessage.includes('sl hit') || lowerMessage.includes('stopped out')) {
      return "SL hit - and that's okay. That's risk management doing its job. You followed the plan. Losses within plan are wins in discipline. 📉"
    }
    
    if (lowerMessage.includes('fomo') || lowerMessage.includes('chased') || lowerMessage.includes('entered late')) {
      return "FOMO's sneaky huh? 😂 Missing one trade won't ruin your month, forcing one will. FOMO entries feel good short-term, but they're emotionally expensive. Did you have an alert set or just reacted?"
    }
    
    if (lowerMessage.includes('revenge trade') || lowerMessage.includes('emotional entry') || lowerMessage.includes('angry')) {
      return "That's your emotions talking. Walk away before your account becomes collateral. Revenge trades feel justified, but they're just losses in disguise. Take a 15-minute break before touching another trade."
    }
    
    if (lowerMessage.includes('losing streak') || lowerMessage.includes('drawdown') || lowerMessage.includes('red week')) {
      return "Drawdowns test character. Focus on process, not PNL. Red weeks happen - the goal is to limit damage, not avoid it. Cut size, stay calm, journal every trade until the storm passes."
    }
    
    if (lowerMessage.includes('overtrading') || lowerMessage.includes('too many trades')) {
      return "If you're clicking nonstop, you're not trading - you're gambling. Overtrading is usually boredom in disguise. Sometimes the best trade is no trade. Chill mode = profit mode."
    }
    
    if (lowerMessage.includes('big win') || lowerMessage.includes('massive win') || lowerMessage.includes('crushing it')) {
      return "Nice one! 🎯 Don't let euphoria take over though. Celebrate it, then log it and review what went right so you can repeat it, not chase it. Stick to the same risk per trade even when winning."
    }
    
    // Platform-specific questions
    if (lowerMessage.includes('roi not updating') || lowerMessage.includes('roi not changing')) {
      return "Withdrawals from profit don't affect ROI. ROI only changes with trading performance, not balance withdrawals. That's normal - ROI is based on deposits and trade results. 📊"
    }
    
    if (lowerMessage.includes('trade missing') || lowerMessage.includes('trade didn\'t save')) {
      return "Make sure you hit 'Save Trade'. Try refreshing - sometimes the sheet or local data just needs to reload. Could be a temporary cache issue. Save again and check your Journal tab."
    }
    
    if (lowerMessage.includes('hyperlink') || lowerMessage.includes('link disappeared')) {
      return "Hyperlinks can't be saved directly due to a script limitation. Add them as plain text or image references. You can paste links as text - the clickable link won't stick yet due to spreadsheet restrictions."
    }
    
    // Trading guidance
    if (lowerMessage.includes('improve win rate') || lowerMessage.includes('better win rate')) {
      return "Review your losing trades weekly and identify if losses are from poor setups or emotions. Filter out impulsive entries. Focus on execution, not outcome. Your Journal doesn't lie - it shows who you are as a trader."
    }
    
    if (lowerMessage.includes('good roi') || lowerMessage.includes('what roi')) {
      return "A consistent 5-10% monthly ROI with proper risk management is already excellent. Focus on consistency over speed. Don't chase big numbers - chase sustainable processes."
    }
    
    if (lowerMessage.includes('profit factor') || lowerMessage.includes('low profit factor')) {
      return "Profit Factor < 1 means your losses outweigh your wins. Check if you're cutting losses late or letting winners run too short. Above 1.5 shows you have a solid edge."
    }
    
    // Platform navigation
    if (lowerMessage.includes('how to use') || lowerMessage.includes('navigate') || lowerMessage.includes('getting started')) {
      return `🧭 **Getting Started with KRTJ:**

**Dashboard**: Your bird's-eye view showing Total Trades, Win Rate, PNL, ROI, Profit Factor
**Journal**: Log every trade - entry, exit, setup, reasoning, screenshots
**Vision Board**: Add charts, affirmations, goals to keep your vision clear  
**Strategies**: Store your playbooks and trading systems
**Snapshots**: Visual gallery for quick trade review
**Wallets**: Track deposits/withdrawals (ROI only updates from trading results)

All features work offline after initial load. No account needed - start journaling immediately! 🚀`
    }
    
    // Security questions
    if (lowerMessage.includes('secure') || lowerMessage.includes('privacy') || lowerMessage.includes('safe')) {
      return `🔒 **Security & Privacy:**

• **Client-Side Only**: All processing in your browser - no server storage
• **No Data Collection**: We don't store your trading data or personal info
• **Open Source**: Full transparency - check our GitHub
• **No Login Required**: Use all features without accounts
• **Local Storage**: Your data stays on your device
• **HTTPS Encrypted**: All connections secure

Your data never leaves your browser. Privacy-first design! 🛡️`
    }
    
    // Market analysis requests
    if (lowerMessage.includes('market') && (lowerMessage.includes('analysis') || lowerMessage.includes('outlook') || lowerMessage.includes('trend'))) {
      return `📈 **Market Analysis:**

I can help with price data, but for deep market analysis, here's my take:

**Always Remember:**
• Markets are unpredictable - focus on risk management
• Your Journal shows your real edge, not market predictions
• Stick to your tested setups regardless of market sentiment
• When in doubt, size down and wait for clarity

Want me to check specific coin prices for your analysis? Just ask "BTC price" or "ETH price"! 💰`
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hey! 👋 I'm your Kinsfolk Assistant - part customer service, part trading mentor. I can help with KRTJ navigation, check live crypto prices via CoinGecko, and guide you through trading challenges. What's on your mind?"
    }
    
    // Default response
    return "I'm here to help with KRTJ navigation, live crypto prices (via CoinGecko), trading guidance, and platform questions. Try asking 'Bitcoin price', 'how to use the journal', 'analytics help', or share what's happening with your trades. What do you need? 🤔"
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hey! 👋 I'm your Kinsfolk Assistant - part customer service, part trading mentor. I help with KRTJ navigation, analytics questions, and trading mindset. Whether you're celebrating wins or dealing with losses, I'm here to help. What's on your trading mind today?")
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

  const requestUserInfo = () => {
    if (!userInfo.hasProvidedInfo) {
      setShowEmailPrompt(true)
    }
  }

  const handleUserInfoSubmit = (name: string, email: string) => {
    setUserInfo({ name, email, hasProvidedInfo: true })
    setShowEmailPrompt(false)
    addBotMessage(`Nice to meet you, ${name}! 🤝 I've got your email (${email}) saved for our conversation summary. Now, how can I help you dominate the markets today?`)
  }

  const sendConversationEmail = async () => {
    if (!userInfo.email) return
    
    const conversationText = messages
      .map(msg => `${msg.type.toUpperCase()} (${msg.timestamp.toLocaleString()}): ${msg.content}`)
      .join('\n\n')
    
    // This would integrate with your email service
    console.log('Sending conversation to:', userInfo.email)
    console.log('Conversation:', conversationText)
    
    addBotMessage(`📧 Conversation summary sent to ${userInfo.email}! Check your inbox for the full chat transcript. Keep crushing those trades! 🚀`)
    setShowConversationSender(false)
  }

  // CoinGecko API integration
  const fetchCoinPrice = async (coinId: string) => {
    try {
      setLoadingPriceData(true)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      )
      const data = await response.json()
      return data[coinId]
    } catch (error) {
      console.error('CoinGecko API error:', error)
      return null
    } finally {
      setLoadingPriceData(false)
    }
  }

  const searchCoin = async (query: string) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`)
      const data = await response.json()
      return data.coins?.slice(0, 5) || []
    } catch (error) {
      console.error('CoinGecko search error:', error)
      return []
    }
  }

  const formatPriceData = (priceData: any, coinName: string) => {
    if (!priceData) return "Sorry, I couldn't fetch that price data right now. CoinGecko might be busy! 📊"

    const price = priceData.usd?.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6 
    })
    
    const change24h = priceData.usd_24h_change
    const changeEmoji = change24h > 0 ? '🟢' : change24h < 0 ? '🔴' : '⚪'
    const changeText = change24h > 0 ? `+${change24h.toFixed(2)}%` : `${change24h.toFixed(2)}%`
    
    const marketCap = priceData.usd_market_cap ? 
      `$${(priceData.usd_market_cap / 1000000000).toFixed(2)}B` : 'N/A'
    
    const volume24h = priceData.usd_24h_vol ? 
      `$${(priceData.usd_24h_vol / 1000000).toFixed(2)}M` : 'N/A'

    return `💰 **${coinName.toUpperCase()} Price Update:**

• **Price**: ${price}
• **24h Change**: ${changeEmoji} ${changeText}
• **Market Cap**: ${marketCap}
• **24h Volume**: ${volume24h}

*Data from CoinGecko* 📈

What's your take on this price action? Planning any moves?`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Request user info after a few messages if not provided
    if (messages.length > 3 && !userInfo.hasProvidedInfo) {
      setTimeout(() => requestUserInfo(), 2000)
    }

    addUserMessage(inputMessage)
    const currentMessage = inputMessage
    setInputMessage('')
    setIsTyping(true)

    // Handle async responses (like price data)
    try {
      const response = await getSmartResponse(currentMessage)
      setTimeout(() => {
        addBotMessage(response)
        setIsTyping(false)
      }, 800 + Math.random() * 800) // Delay for realism
    } catch (error) {
      setTimeout(() => {
        addBotMessage("Oops! Something went wrong while fetching that info. Try asking again! 🤖")
        setIsTyping(false)
      }, 800)
    }
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
      <div className="fixed bottom-6 right-6 z-50">
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
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-krcard border border-krborder rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-krgold to-kryellow text-krblack p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm">Kinsfolk AI Assistant</h3>
                <p className="text-xs opacity-80">Trading mentor & platform guide</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 3 && userInfo.hasProvidedInfo && (
                <button
                  onClick={() => setShowConversationSender(true)}
                  className="hover:bg-black/10 p-1 rounded transition-colors"
                  title="Send conversation to email"
                >
                  <Mail className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-black/10 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
                    {loadingPriceData && (
                      <span className="ml-2 text-xs text-krmuted">Fetching live data...</span>
                    )}
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

      {/* Email Prompt Modal */}
      {showEmailPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-krcard border border-krborder rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-krgold" />
              <h3 className="font-bold text-krtext">Quick Info</h3>
            </div>
            <p className="text-krmuted text-sm mb-4">
              I can send you a copy of our conversation when we're done! Just need your name and email:
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-krgray text-krtext px-3 py-2 rounded-lg text-sm border border-krborder focus:border-krgold focus:outline-none"
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-krgray text-krtext px-3 py-2 rounded-lg text-sm border border-krborder focus:border-krgold focus:outline-none"
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowEmailPrompt(false)}
                className="flex-1 px-4 py-2 text-sm text-krmuted border border-krborder rounded-lg hover:border-krgold/50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => handleUserInfoSubmit(userInfo.name, userInfo.email)}
                disabled={!userInfo.name || !userInfo.email}
                className="flex-1 px-4 py-2 text-sm bg-krgold text-krblack rounded-lg hover:bg-kryellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Sender Modal */}
      {showConversationSender && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-krcard border border-krborder rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-krgold" />
              <h3 className="font-bold text-krtext">Send Conversation</h3>
            </div>
            <p className="text-krmuted text-sm mb-4">
              Want a copy of our conversation sent to <span className="text-krgold">{userInfo.email}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConversationSender(false)}
                className="flex-1 px-4 py-2 text-sm text-krmuted border border-krborder rounded-lg hover:border-krgold/50 transition-colors"
              >
                No thanks
              </button>
              <button
                onClick={sendConversationEmail}
                className="flex-1 px-4 py-2 text-sm bg-krgold text-krblack rounded-lg hover:bg-kryellow transition-colors"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
// LLM Service for intelligent chatbot responses using Groq API
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

class LLMService {
  private apiKey: string
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions'
  private systemPrompt = `You are a Kinsfolk Assistant, an expert trading mentor and KRTJ (Kinsfolk Republic Trading Journal) platform guide. Your role is to:

🎯 **Core Responsibilities:**
- Provide trading psychology support and emotional guidance
- Help users navigate the KRTJ platform features (Dashboard, Journal, Vision Board, Strategies, Analytics)
- Analyze live crypto market data and provide insights
- Offer trading education and risk management advice
- Maintain a supportive, professional, and encouraging tone

🏠 **CRITICAL PLATFORM FACTS - NEVER GET THESE WRONG:**
- KRTJ is 100% LOCAL - NO accounts, NO login, NO user registration required
- ALL data stays in the user's browser - completely privacy-first
- NO PASSWORDS, NO 2FA, NO SERVER-SIDE SECURITY - everything is client-side only
- NO user management, authentication systems, or password storage of any kind
- Wallets section is for tracking personal deposits/withdrawals locally, not real money transfers
- No server storage, no data collection, completely client-side application
- Users access all features immediately without signing up
- All trading data is stored locally in browser storage only
- Security = local browser storage + HTTPS connection, that's it!

💡 **Key Guidelines:**
- Keep responses concise (2-4 sentences usually)
- Use relevant emojis to make conversations engaging  
- For emotional support: acknowledge feelings, provide perspective, suggest healthy coping strategies
- For price questions: provide analysis but always remind about risk management
- For platform help: guide users to specific KRTJ sections and features (no login required)
- Be encouraging but realistic about trading challenges

🚫 **FORBIDDEN TOPICS - NEVER MENTION THESE:**
- Accounts, login, registration, user profiles, passwords, 2FA - KRTJ has NONE of these
- Server-side security measures, password management, authentication systems
- User management, account settings, profile management - doesn't exist
- Data storage on servers, cloud storage, or databases - everything is local only
- Never provide financial advice or guarantee returns
- Don't recommend specific trades or investments
- Always emphasize proper risk management and education
- If asked about topics outside trading/KRTJ, gently redirect to your expertise areas

📋 **CORRECT RESPONSES FOR COMMON QUESTIONS:**

Security: "KRTJ is completely client-side - no passwords, accounts, or server storage needed! Your data stays private in your browser with local storage. Security comes from HTTPS connection and the fact that nothing is stored on external servers. Privacy-first by design! 🔒"

Wallets: "The Wallets section helps you track your personal deposits/withdrawals locally for accurate ROI calculations. It's just for your own record-keeping - no real money transfers or accounts involved!"

Features: "Navigate to Dashboard, Journal, Vision Board, Strategies, or Analytics tabs - all available instantly, no signup required!"

Remember: You're a mentor focused on helping traders develop discipline, emotional control, and systematic approaches to trading through the KRTJ platform.`

  constructor() {
    // @ts-ignore - Vite environment variables
    this.apiKey = import.meta.env?.VITE_GROQ_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Groq API key not found. LLM features will be disabled.')
      // @ts-ignore - Debug environment variables
      console.log('Available env vars:', import.meta.env)
    } else {
      console.log('Groq API key loaded successfully')
    }
  }

  async generateResponse(
    userMessage: string, 
    conversationHistory: ChatMessage[] = [],
    priceData?: any,
    userName?: string
  ): Promise<string> {
    
    if (!this.apiKey) {
      return "I'm having trouble connecting to my knowledge base right now. Please try again later! 🔄"
    }

    try {
      // Build context with price data if available
      let contextualPrompt = this.systemPrompt
      
      if (userName) {
        contextualPrompt += `\n\nThe user's name is ${userName}. Use their name naturally in conversation when appropriate.`
      }

      if (priceData) {
        contextualPrompt += `\n\nCurrent Market Data Available:\n${JSON.stringify(priceData, null, 2)}\nUse this data to provide informed market analysis when relevant.`
      }

      const messages: ChatMessage[] = [
        { role: 'system', content: contextualPrompt },
        ...conversationHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user', content: userMessage }
      ]

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Fast and capable model
          messages,
          temperature: 0.7, // Balanced creativity and consistency
          max_tokens: 300, // Keep responses concise
          top_p: 0.9
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data: GroqResponse = await response.json()
      const botResponse = data.choices[0]?.message?.content || "I'm thinking... could you rephrase that? 🤔"

      return botResponse.trim()

    } catch (error) {
      console.error('LLM Service Error:', error)
      
      // Graceful fallback responses
      const fallbackResponses = [
        "I'm having a brief moment of confusion! Could you try asking that again? 😅",
        "My thinking cap seems to be stuck! Let me know what you need help with. 🎩",
        "Oops, I got distracted by the markets! What were we talking about? 📈"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  // Helper method to determine if message needs price data context
  isPriceQuery(message: string): boolean {
    const priceKeywords = [
      'price', 'cost', 'value', 'worth', 'btc', 'bitcoin', 'ethereum', 'eth', 
      'crypto', 'coin', 'market', 'trading', 'buy', 'sell', 'pump', 'dump',
      'bull', 'bear', 'analysis', 'chart', 'technical'
    ]
    
    return priceKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
  }

  // Format conversation history for LLM context
  formatConversationHistory(messages: Array<{type: string, content: string}>): ChatMessage[] {
    return messages
      .filter(msg => msg.type !== 'system') // Exclude system messages
      .map(msg => ({
        role: msg.type === 'bot' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }))
  }
}

export const llmService = new LLMService()
export default llmService
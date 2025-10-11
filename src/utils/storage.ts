const KEY = 'kr_trading_journal_v1'
const WEBHOOK_KEY = 'kr_discord_webhooks'
const ACTIVE_WEBHOOK_KEY = 'kr_active_webhook'

export type DiscordWebhook = {
  id: string;
  name: string;
  url: string;
  active?: boolean;
}

export type AppData = {
  vision: any[],
  journal: any[],
  playbook: any[],
  wallet: any[],
}

export function loadData(): AppData {
  const raw = localStorage.getItem(KEY)
  if(!raw) return { vision: [], journal: [], playbook: [], wallet: [] }
  try{ return JSON.parse(raw) }catch(e){
    console.error('Failed to parse storage', e)
    return { vision: [], journal: [], playbook: [], wallet: [] }
  }
}

export function getDiscordWebhooks(): DiscordWebhook[] {
  const raw = localStorage.getItem(WEBHOOK_KEY)
  if(!raw) return []
  try{ return JSON.parse(raw) }catch(e){
    console.error('Failed to parse webhooks', e)
    return []
  }
}

export function getActiveWebhookId(): string {
  return localStorage.getItem(ACTIVE_WEBHOOK_KEY) || ''
}

export function setActiveWebhookId(id: string) {
  localStorage.setItem(ACTIVE_WEBHOOK_KEY, id)
}

export function addDiscordWebhook(name: string, url: string): DiscordWebhook {
  const webhooks = getDiscordWebhooks()
  const webhook = { id: Date.now().toString(), name, url }
  webhooks.push(webhook)
  localStorage.setItem(WEBHOOK_KEY, JSON.stringify(webhooks))
  if (webhooks.length === 1) {
    setActiveWebhookId(webhook.id)
  }
  return webhook
}

export function updateDiscordWebhook(id: string, name: string, url: string) {
  const webhooks = getDiscordWebhooks()
  const index = webhooks.findIndex(w => w.id === id)
  if (index !== -1) {
    webhooks[index] = { ...webhooks[index], name, url }
    localStorage.setItem(WEBHOOK_KEY, JSON.stringify(webhooks))
  }
}

export function deleteDiscordWebhook(id: string) {
  const webhooks = getDiscordWebhooks()
  const filtered = webhooks.filter(w => w.id !== id)
  localStorage.setItem(WEBHOOK_KEY, JSON.stringify(filtered))
  if (getActiveWebhookId() === id && filtered.length > 0) {
    setActiveWebhookId(filtered[0].id)
  }
}

// For backward compatibility
export function getDiscordWebhook(): string {
  const activeId = getActiveWebhookId()
  if (!activeId) return ''
  const webhooks = getDiscordWebhooks()
  const webhook = webhooks.find(w => w.id === activeId)
  return webhook?.url || ''
}

export async function sendToDiscord(data: any, webhookId?: string) {
  const url = webhookId ? 
    getDiscordWebhooks().find(w => w.id === webhookId)?.url :
    getDiscordWebhook()
    
  if (!url) return false

  try {
    // Build title: TICKER | POSITION | LEVERAGEx
    const position = data.position.toUpperCase();
    const leverage = data.type === 'Futures' ? `${data.leverage}x` : '';
    const title = `${data.ticker.toUpperCase()} | ${position} ${leverage}`.trim();
    
    // Determine color based on PnL
    const isProfitable = data.pnlAmount > 0;
    const embedColor = isProfitable ? 0x00FF00 : 0xFF0000; // Green for profit, Red for loss
    
    // Format PnL with + or - sign
    const pnlSign = isProfitable ? '+' : '';
    const pnlDisplay = `${pnlSign}$${data.pnlAmount.toFixed(2)} (${pnlSign}${data.pnlPercent.toFixed(2)}%)`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: title,
          color: embedColor,
          fields: [
            { 
              name: '📊 Objective', 
              value: data.objective, 
              inline: true 
            },
            { 
              name: '🎯 Setup', 
              value: data.setup || 'N/A', 
              inline: true 
            },
            { 
              name: '💰 PnL', 
              value: `**${pnlDisplay}**`, 
              inline: true 
            },
            { 
              name: '📈 Entry', 
              value: `**Price:** $${data.entryPrice}\n**Date:** ${data.date} ${data.time}`, 
              inline: true 
            },
            { 
              name: '📉 Exit', 
              value: `**Price:** $${data.exitPrice}\n**Date:** ${data.exitDate} ${data.exitTime}`, 
              inline: true 
            },
            { 
              name: '💵 Fee', 
              value: data.fee ? `$${data.fee.toFixed(2)}` : '$0.00', 
              inline: true 
            },
            ...(data.marginCost > 0 ? [{ 
              name: '💸 Margin Cost', 
              value: `$${data.marginCost.toFixed(2)}`, 
              inline: true 
            }] : []),
            ...(data.reasonIn ? [{ 
              name: '📝 Reason for Entry & Exit', 
              value: data.reasonIn 
            }] : [])
          ],
          image: data.chartImg ? { url: data.chartImg } : undefined,
          thumbnail: data.pnlImg ? { url: data.pnlImg } : undefined,
          footer: {
            text: 'Kinsfolk Republic Trading Journal'
          },
          timestamp: new Date().toISOString()
        }]
      })
    })
    return response.ok
  } catch (e) {
    console.error('Failed to send to Discord', e)
    return false
  }
}

export function saveData(data: Partial<AppData>){
  const cur = loadData()
  const merged = { ...cur, ...data }
  localStorage.setItem(KEY, JSON.stringify(merged))
}

export function exportData(){
  const data = loadData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'kinsfolk-republic-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file: File, { overwrite = false } = {}){
  try {
    const txt = await file.text()
    
    // Log for debugging
    console.log('File content length:', txt.length)
    console.log('First 100 chars:', txt.substring(0, 100))
    
    // Try to parse JSON
    const data = JSON.parse(txt)
    
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format: Expected an object')
    }
    
    // Check if it has the expected structure (vision, journal, playbook, wallet)
    const hasValidStructure = (
      data.hasOwnProperty('vision') ||
      data.hasOwnProperty('journal') ||
      data.hasOwnProperty('playbook') ||
      data.hasOwnProperty('wallet')
    )
    
    if (!hasValidStructure) {
      console.error('Invalid structure. Data keys:', Object.keys(data))
      throw new Error('Invalid data format: Missing expected properties (vision, journal, playbook, wallet)')
    }
    
    console.log('Data validated successfully:', Object.keys(data))
    
    if(overwrite) {
      localStorage.setItem(KEY, JSON.stringify(data))
      console.log('Data overwritten successfully')
      return
    }
    const cur = loadData()
    const merged = { ...cur, ...data }
    localStorage.setItem(KEY, JSON.stringify(merged))
    console.log('Data merged successfully')
  } catch (error) {
    console.error('Import error details:', error)
    throw error // Re-throw to be caught by the calling function
  }
}

export function deleteAllData(){
  localStorage.removeItem(KEY)
}

// Auto-send email backup functionality
export async function triggerAutoEmailBackup(action: 'add' | 'delete' | 'update') {
  const emailFrequency = localStorage.getItem('email_frequency')
  const email = localStorage.getItem('backup_email')
  const antiPhishingCode = localStorage.getItem('anti_phishing_code')
  
  // Don't send if disabled or no email configured
  if (!emailFrequency || emailFrequency === 'disabled' || !email || !antiPhishingCode) {
    return
  }
  
  // Check if we should send based on frequency and action
  let shouldSend = false
  
  if (emailFrequency === 'on-add' && action === 'add') {
    shouldSend = true
  } else if (emailFrequency === 'on-delete' && action === 'delete') {
    shouldSend = true
  } else if (emailFrequency === 'on-change' && (action === 'add' || action === 'delete' || action === 'update')) {
    shouldSend = true
  }
  
  if (!shouldSend) return
  
  try {
    // Export only app data (vision, journal, playbook, wallet)
    // NOT the entire localStorage which includes settings
    const appData = loadData()
    const dataStr = JSON.stringify(appData, null, 2)
    const functionUrl = '/api/send-email'
    
    await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        antiPhishingCode,
        dataStr,
        emailFrequency
      })
    })
    
    console.log('✅ Auto-backup email sent successfully')
  } catch (error) {
    console.error('❌ Auto-backup email failed:', error)
  }
}

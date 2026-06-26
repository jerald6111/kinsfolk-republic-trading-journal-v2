import {
  deriveNewKey,
  deriveKeyFromSalt,
  encryptJSON,
  encryptWithSalt,
  decryptJSON,
  type SecurePayload,
} from './crypto'

const KEY = 'kr_trading_journal_v1'      // legacy plaintext store (migrated away on vault creation)
const SECURE_KEY = 'kr_secure_v1'        // encrypted vault (passcode-protected)
const WEBHOOK_KEY = 'kr_discord_webhooks'
const ACTIVE_WEBHOOK_KEY = 'kr_active_webhook'

const EMPTY: AppData = { vision: [], journal: [], playbook: [], wallet: [] }

// ===== In-memory vault state (cleared on lock / reload) =====
let memCache: AppData | null = null
let cryptoKey: CryptoKey | null = null
let currentSalt: string | null = null

/** Is there an encrypted vault already set up? */
export function hasVault(): boolean {
  return !!localStorage.getItem(SECURE_KEY)
}

/** Is there old unencrypted data to migrate? */
export function hasLegacyData(): boolean {
  return !!localStorage.getItem(KEY)
}

/** Is the vault currently unlocked in this session? */
export function isUnlocked(): boolean {
  return cryptoKey !== null && memCache !== null
}

function readLegacyPlaintext(): AppData {
  const raw = localStorage.getItem(KEY)
  if (!raw) return { ...EMPTY }
  try { return { ...EMPTY, ...JSON.parse(raw) } } catch { return { ...EMPTY } }
}

/** Create a new encrypted vault from a passcode, migrating any legacy plaintext data. */
export async function createVault(passcode: string): Promise<void> {
  const seed = hasLegacyData() ? readLegacyPlaintext() : { ...EMPTY }
  const { key, salt } = await deriveNewKey(passcode)
  const payload = await encryptJSON(key, salt, seed)
  localStorage.setItem(SECURE_KEY, JSON.stringify(payload))
  localStorage.removeItem(KEY) // remove plaintext after migrating
  cryptoKey = key
  currentSalt = payload.salt
  memCache = seed
}

/** Unlock an existing vault. Throws if the passcode is wrong. */
export async function unlockVault(passcode: string): Promise<void> {
  const raw = localStorage.getItem(SECURE_KEY)
  if (!raw) throw new Error('No vault found')
  const payload = JSON.parse(raw) as SecurePayload
  const key = await deriveKeyFromSalt(passcode, payload.salt)
  const data = await decryptJSON<AppData>(key, payload) // throws on wrong passcode
  cryptoKey = key
  currentSalt = payload.salt
  memCache = { ...EMPTY, ...data }
}

/** Lock the vault (clear in-memory plaintext + key). */
export function lockVault(): void {
  memCache = null
  cryptoKey = null
  currentSalt = null
}

/** Persist the current in-memory cache, encrypted, to localStorage. */
async function persistEncrypted(): Promise<void> {
  if (!cryptoKey || !currentSalt || !memCache) return
  const payload = await encryptWithSalt(cryptoKey, currentSalt, memCache)
  localStorage.setItem(SECURE_KEY, JSON.stringify(payload))
}

/** Verify a passcode against the stored vault (does not unlock). */
export async function verifyPasscode(passcode: string): Promise<boolean> {
  const raw = localStorage.getItem(SECURE_KEY)
  if (!raw) return false
  try {
    const payload = JSON.parse(raw) as SecurePayload
    const key = await deriveKeyFromSalt(passcode, payload.salt)
    await decryptJSON(key, payload)
    return true
  } catch {
    return false
  }
}

/** Re-encrypt the (unlocked) vault under a new passcode. */
export async function changePasscode(newPasscode: string): Promise<void> {
  if (!memCache) throw new Error('Vault is locked')
  const { key, salt } = await deriveNewKey(newPasscode)
  const payload = await encryptJSON(key, salt, memCache)
  localStorage.setItem(SECURE_KEY, JSON.stringify(payload))
  cryptoKey = key
  currentSalt = payload.salt
}

// ===== Backup reminder tracking =====
const LAST_BACKUP_KEY = 'kr_last_backup'

export function markBackedUp(): void {
  localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()))
}

/** Days since last backup, or null if never backed up. */
export function daysSinceBackup(): number | null {
  const raw = localStorage.getItem(LAST_BACKUP_KEY)
  if (!raw) return null
  const then = Number(raw)
  if (!then) return null
  return Math.floor((Date.now() - then) / 86400000)
}

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
  uploadedCharts?: any[],
}

export function loadData(): AppData {
  // Unlocked vault → serve from in-memory plaintext cache.
  if (memCache) return memCache
  // Fallback: legacy plaintext (pre-vault / not yet migrated).
  const raw = localStorage.getItem(KEY)
  if(!raw) return { ...EMPTY }
  try{ return { ...EMPTY, ...JSON.parse(raw) } }catch(e){
    console.error('Failed to parse storage', e)
    return { ...EMPTY }
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
  if (cryptoKey) {
    // Unlocked vault: update cache synchronously, persist encrypted in background.
    memCache = merged
    void persistEncrypted()
  } else {
    // No vault (legacy/unauthenticated) — keep plaintext behaviour.
    localStorage.setItem(KEY, JSON.stringify(merged))
  }
  // Notify optional listeners (e.g. cloud auto-sync). Harmless if nothing listens.
  try { window.dispatchEvent(new Event('kr:data-change')) } catch { /* SSR/no-window */ }
}

/** Load a small, realistic sample dataset so users can preview the app. */
export function loadSampleData(): void {
  const today = new Date()
  const d = (daysAgo: number) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() - daysAgo)
    return dt.toISOString().split('T')[0]
  }

  const journal = [
    {
      id: 1001, date: d(2), time: '09:30', exitDate: d(2), exitTime: '11:45',
      ticker: 'BTC/USDT', objective: 'Day Trade', setup: 'Breakout',
      type: 'Futures', position: 'Long', leverage: 5,
      entryPrice: 61250, exitPrice: 63100, fee: 12.4, marginCost: 500,
      pnlAmount: 150.98, pnlPercent: 30.2, chartImg: '', pnlImg: '',
      reasonIn: 'Clean break above range with strong volume.', reasonOut: 'Hit target at prior resistance.',
      tags: ['Plan followed', 'Disciplined'],
    },
    {
      id: 1002, date: d(4), time: '14:10', exitDate: d(4), exitTime: '15:20',
      ticker: 'ETH/USDT', objective: 'Scalping', setup: 'Mean Reversion',
      type: 'Spot', position: 'Long', leverage: 1,
      entryPrice: 3380, exitPrice: 3342, fee: 3.1, marginCost: 600,
      pnlAmount: -67.46, pnlPercent: -1.12, chartImg: '', pnlImg: '',
      reasonIn: 'Expected bounce off support.', reasonOut: 'Support broke, cut the loss.',
      tags: ['FOMO', 'Late entry'],
    },
    {
      id: 1003, date: d(6), time: '08:00', exitDate: d(5), exitTime: '16:30',
      ticker: 'SOL/USDT', objective: 'Swing Trade', setup: 'Trend Continuation',
      type: 'Futures', position: 'Long', leverage: 3,
      entryPrice: 142.5, exitPrice: 158.0, fee: 8.2, marginCost: 400,
      pnlAmount: 130.53, pnlPercent: 32.6, chartImg: '', pnlImg: '',
      reasonIn: 'Higher highs, pullback to 20EMA.', reasonOut: 'Momentum stalling near round number.',
      tags: ['Patience', 'Plan followed'],
    },
    {
      id: 1004, date: d(9), time: '10:45', exitDate: d(9), exitTime: '12:00',
      ticker: 'BNB/USDT', objective: 'Day Trade', setup: 'Range Reversal',
      type: 'Futures', position: 'Short', leverage: 4,
      entryPrice: 612, exitPrice: 624, fee: 5.6, marginCost: 350,
      pnlAmount: -27.45, pnlPercent: -7.84, chartImg: '', pnlImg: '',
      reasonIn: 'Rejection at range top.', reasonOut: 'Stopped out as it pushed higher.',
      tags: ['Revenge trade', 'Broke rules'],
    },
    {
      id: 1005, date: d(12), time: '13:15', exitDate: d(11), exitTime: '09:50',
      ticker: 'XRP/USDT', objective: 'Position', setup: 'Accumulation',
      type: 'Spot', position: 'Long', leverage: 1,
      entryPrice: 0.52, exitPrice: 0.61, fee: 2.0, marginCost: 800,
      pnlAmount: 138.46, pnlPercent: 17.31, chartImg: '', pnlImg: '',
      reasonIn: 'Long-term accumulation zone.', reasonOut: 'Reached first profit target.',
      tags: ['Patience', 'Disciplined'],
    },
  ]

  const vision = [
    {
      id: 2001, title: 'Grow account to $25k', desc: 'Compound profits steadily without over-leveraging.',
      target: '25000', timeline: 'Mid Term (6-12 months)', img: '', status: 'active',
    },
    {
      id: 2002, title: 'Hit 60% win rate', desc: 'Refine entries and stick to the playbook on every trade.',
      target: '0', timeline: 'Short Term (3-6 months)', img: '', status: 'active',
    },
    {
      id: 2003, title: 'First $1k week', desc: 'Achieve a single week with $1,000 net profit.',
      target: '1000', timeline: 'Short Term (3-6 months)', img: '', status: 'active',
    },
  ]

  const playbook = [
    {
      id: 3001, title: 'Breakout Continuation',
      desc: '## Breakout Continuation\n\n- **Entry:** Break + retest of range high on rising volume\n- **Stop:** Below the retest low\n- **Target:** Measured move of the range height',
      images: [],
    },
    {
      id: 3002, title: 'Support Bounce Scalp',
      desc: '## Support Bounce Scalp\n\n- **Entry:** Reclaim of a key support level\n- **Stop:** Below support wick\n- **Target:** Prior intraday high',
      images: [],
    },
  ]

  const wallet = [
    { id: 4001, date: d(30), type: 'deposit', amount: 2000, notes: 'Initial funding' },
    { id: 4002, date: d(14), type: 'withdrawal', amount: 300, notes: 'Profit withdrawal' },
  ]

  saveData({ journal, vision, playbook, wallet })
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
  markBackedUp()
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
      saveData(data as Partial<AppData>)
      console.log('Data overwritten successfully')
      return
    }
    const cur = loadData()
    const merged = { ...cur, ...data }
    saveData(merged)
    console.log('Data merged successfully')
  } catch (error) {
    console.error('Import error details:', error)
    throw error // Re-throw to be caught by the calling function
  }
}

export function deleteAllData(){
  localStorage.removeItem(KEY)
  if (cryptoKey && currentSalt) {
    // keep the vault but empty it
    memCache = { ...EMPTY }
    void persistEncrypted()
  } else {
    localStorage.removeItem(SECURE_KEY)
    memCache = null
  }
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

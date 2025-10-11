import React, { useRef, useState, useEffect } from 'react'
import { 
  exportData, 
  importData, 
  deleteAllData, 
  getDiscordWebhooks, 
  addDiscordWebhook, 
  updateDiscordWebhook, 
  deleteDiscordWebhook,
  getActiveWebhookId,
  setActiveWebhookId,
  loadData,
  type DiscordWebhook 
} from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import Modal from '../components/Modal'
import { AlertTriangle, Save, Link2, Trash2, Mail, Shield, Download, Send, CheckCircle2, Info, Eye, EyeOff } from 'lucide-react'

type EmailFrequency = 'disabled' | 'on-add' | 'on-delete' | 'on-change' | 'daily' | 'weekly'

export default function DataSettings(){
  const fileRef = useRef<HTMLInputElement|null>(null)
  const { currency, currencies, setCurrency } = useCurrency()
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [webhooks, setWebhooks] = useState<DiscordWebhook[]>([])
  const [activeWebhookId, setActiveWebhookId] = useState('')
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge')
  const [editingWebhook, setEditingWebhook] = useState<DiscordWebhook | null>(null)
  
  // Email Backup Settings
  const [email, setEmail] = useState('')
  const [emailFrequency, setEmailFrequency] = useState<EmailFrequency>('disabled')
  const [antiPhishingCode, setAntiPhishingCode] = useState('')
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [emailSaved, setEmailSaved] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showPhishingCode, setShowPhishingCode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    setWebhooks(getDiscordWebhooks())
    setActiveWebhookId(getActiveWebhookId())
    
    // Load email settings from localStorage
    const savedEmail = localStorage.getItem('backup_email')
    const savedFrequency = localStorage.getItem('email_frequency') as EmailFrequency
    const savedAntiPhishing = localStorage.getItem('anti_phishing_code')
    
    if (savedEmail) setEmail(savedEmail)
    if (savedFrequency) setEmailFrequency(savedFrequency)
    if (savedAntiPhishing) setAntiPhishingCode(savedAntiPhishing)
  }, [])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))
      exportData()
      // Show success message
      await new Promise(resolve => setTimeout(resolve, 500))
      alert('✅ Data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      alert('❌ Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
      setShowExportModal(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      alert('⚠️ Please select a file to import')
      return
    }
    
    setIsImporting(true)
    try {
      await importData(selectedFile, { overwrite: importMode === 'overwrite' })
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))
      alert(`✅ Data imported successfully! Mode: ${importMode === 'overwrite' ? 'Overwrite' : 'Merge'}\n\n🔄 Refreshing page to load new data...`)
      
      // Refresh page to load imported data
      window.location.reload()
    } catch (error) {
      console.error('Import error:', error)
      alert('❌ Failed to import data. Please check the file format and try again.')
      setIsImporting(false)
    } finally {
      setShowImportModal(false)
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = () => {
    if (deleteConfirm.toLowerCase() === 'delete') {
      deleteAllData()
      setShowDeleteModal(false)
      setDeleteConfirm('')
    }
  }

  const addWebhook = () => {
    if (!newWebhookName || !newWebhookUrl) {
      alert('Please provide both name and URL')
      return
    }
    const webhook = addDiscordWebhook(newWebhookName, newWebhookUrl)
    setWebhooks([...webhooks, webhook])
    setNewWebhookName('')
    setNewWebhookUrl('')
  }

  const updateWebhook = () => {
    if (!editingWebhook || !editingWebhook.name || !editingWebhook.url) {
      alert('Please provide both name and URL')
      return
    }
    updateDiscordWebhook(editingWebhook.id, editingWebhook.name, editingWebhook.url)
    setWebhooks(getDiscordWebhooks())
    setEditingWebhook(null)
  }

  const removeWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      deleteDiscordWebhook(id)
      setWebhooks(getDiscordWebhooks())
      setActiveWebhookId(getActiveWebhookId())
    }
  }

  const handleSetActive = (id: string) => {
    setActiveWebhookId(id)
  }

  const saveEmailSettings = () => {
    if (email && !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }
    
    localStorage.setItem('backup_email', email)
    localStorage.setItem('email_frequency', emailFrequency)
    localStorage.setItem('anti_phishing_code', antiPhishingCode)
    
    // Hide email and phishing code after saving
    setShowEmail(false)
    setShowPhishingCode(false)
    
    setEmailSaved(true)
    setTimeout(() => setEmailSaved(false), 3000)
  }
  
  // Helper function to mask email (show last 3 chars before @)
  const getMaskedEmail = () => {
    if (!email || showEmail) return email
    const atIndex = email.indexOf('@')
    if (atIndex <= 3) return email // Email too short to mask
    const beforeAt = email.substring(0, atIndex)
    const afterAt = email.substring(atIndex)
    const lastThree = beforeAt.slice(-3)
    const masked = '•'.repeat(beforeAt.length - 3) + lastThree + afterAt
    return masked
  }
  
  // Helper function to mask phishing code (show last 2 chars)
  const getMaskedPhishingCode = () => {
    if (!antiPhishingCode || showPhishingCode) return antiPhishingCode
    if (antiPhishingCode.length <= 2) return antiPhishingCode
    return '•'.repeat(antiPhishingCode.length - 2) + antiPhishingCode.slice(-2)
  }

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Please save a valid email address first')
      return
    }

    setSendingEmail(true)
    
    try {
      // Export data - Use loadData() to get only app data (vision, journal, playbook, wallet)
      // NOT the entire localStorage which includes settings
      const appData = loadData()
      const dataStr = JSON.stringify(appData, null, 2)
      
      // Call serverless function (works on Vercel/Netlify deployment)
      // Try Vercel first, then Netlify
      const functionUrl = '/api/send-email' // Vercel format
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          antiPhishingCode: antiPhishingCode,
          dataStr: dataStr,
          emailFrequency: emailFrequency
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setSendingEmail(false)
        alert(`✅ Email sent successfully to ${email}!\n\n🛡️ Anti-Phishing Code: ${antiPhishingCode}\n\nYour backup has been sent. Please check your inbox (and spam folder if needed).\n\nEmail ID: ${result.id}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send email')
      }
      
    } catch (error) {
      console.error('Error sending email:', error)
      setSendingEmail(false)
      
      // Fallback: download file if email fails
      // Use loadData() to export only app data, not entire localStorage
      const appData = loadData()
      const dataStr = JSON.stringify(appData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert(`⚠️ Email sending failed\n\nYour backup has been downloaded instead. You can manually send it to ${email}\n\n💡 Make sure you've deployed to Vercel and the API function is working.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const generateRandomPhishingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setAntiPhishingCode(code)
  }

  const [showHowToUse, setShowHowToUse] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Data Settings</h1>
      
      {/* Currency Settings */}
      <div className="bg-krcard rounded-xl shadow-sm border border-krborder p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-krtext">Currency Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-krtext mb-2">
              Select Currency (used throughout the application)
            </label>
            <select
              value={currency.code}
              onChange={(e) => {
                const selected = currencies.find(c => c.code === e.target.value)
                if (selected) setCurrency(selected)
              }}
              className="w-full px-3 py-2 border border-krborder rounded-xl bg-krblack text-krtext focus:ring-1 focus:ring-krgold"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} - {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-krmuted">
            Current: <strong className="text-krtext">{currency.symbol} {currency.name}</strong> (Rate: {currency.rate} to USD)
          </div>
        </div>
      </div>

      {/* Email Backup Settings */}
      <div className="bg-krcard rounded-xl shadow-sm border border-krborder p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="text-krgold" size={20} />
            <h2 className="text-lg font-semibold text-krtext">Email Backup & Security</h2>
          </div>
          <div className="flex items-center gap-3">
            {emailSaved && (
              <span className="flex items-center gap-1 text-green-500 text-sm">
                <CheckCircle2 size={16} />
                Saved!
              </span>
            )}
            {/* How to Use Button - Moved to top right */}
            <button
              onClick={() => setShowHowToUse(!showHowToUse)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
              title="How to use Email Backup"
            >
              <Info size={16} />
              <span className="text-sm font-medium">How to use</span>
            </button>
          </div>
        </div>
        
        {/* How to Use Expandable Section */}
        {showHowToUse && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-400 mb-3">💡 How to use Email Backup:</h3>
            <ol className="text-xs text-blue-300 space-y-2 list-decimal list-inside">
              <li>Enter your email address below</li>
              <li>Set your anti-phishing code (for security verification)</li>
              <li>Choose auto-send frequency (or keep as manual)</li>
              <li>Click "Save Email Settings"</li>
              <li>Click "Send Now" - you'll receive an email with:
                <ul className="ml-6 mt-1 space-y-1 list-disc">
                  <li>Your anti-phishing code (verify it matches!)</li>
                  <li>📎 <strong>Attached JSON backup file</strong> (ready to download)</li>
                  <li>Optional: Copy JSON data from email for extra security</li>
                </ul>
              </li>
            </ol>
            <p className="mt-3 text-xs text-yellow-300">
              <strong>💾 Note:</strong> The backup file is attached to the email, so you can download it directly. 
              The "Export Data" button below lets you save a backup locally without sending an email.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-krtext mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={getMaskedEmail()}
                onChange={(e) => {
                  // Only update if showing (not masked)
                  if (showEmail) {
                    setEmail(e.target.value)
                  }
                }}
                onFocus={() => setShowEmail(true)}
                className="w-full px-3 py-2 pr-12 border border-krborder rounded-xl bg-krblack text-krtext focus:ring-1 focus:ring-krgold"
                placeholder="your.email@example.com"
                readOnly={!showEmail}
              />
              <button
                type="button"
                onClick={() => setShowEmail(!showEmail)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krtext transition-colors"
                title={showEmail ? "Hide email" : "Show email"}
              >
                {showEmail ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-krmuted mt-1">
              Your data will be sent to this email address automatically based on the frequency you choose
            </p>
          </div>

          {/* Auto-Send Frequency */}
          <div>
            <label className="block text-sm font-medium text-krtext mb-2">
              Auto-Send Frequency
            </label>
            <select
              value={emailFrequency}
              onChange={(e) => setEmailFrequency(e.target.value as EmailFrequency)}
              className="w-full px-3 py-2 border border-krborder rounded-xl bg-krblack text-krtext focus:ring-1 focus:ring-krgold"
            >
              <option value="disabled">Disabled (Manual only)</option>
              <option value="on-add">When Data is Added</option>
              <option value="on-delete">When Data is Deleted</option>
              <option value="on-change">On Any Change (Add/Delete/Update)</option>
              <option value="daily">Once a Day</option>
              <option value="weekly">Once a Week</option>
            </select>
            <p className="text-xs text-krmuted mt-1">
              {emailFrequency === 'disabled' && 'Automatic backups are disabled. Use manual send button.'}
              {emailFrequency === 'on-add' && 'Backup will be sent automatically when you add new data (trades, goals, etc).'}
              {emailFrequency === 'on-delete' && 'Backup will be sent automatically when you delete data.'}
              {emailFrequency === 'on-change' && 'Backup will be sent after any change (add, delete, or update).'}
              {emailFrequency === 'daily' && 'Your data will be emailed once per day.'}
              {emailFrequency === 'weekly' && 'Your data will be emailed once per week.'}
            </p>
          </div>

          {/* Anti-Phishing Code */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-krtext mb-2">
              <Shield className="text-krgold" size={16} />
              Anti-Phishing Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={getMaskedPhishingCode()}
                  onChange={(e) => {
                    // Only update if showing (not masked)
                    if (showPhishingCode) {
                      setAntiPhishingCode(e.target.value.toUpperCase())
                    }
                  }}
                  onFocus={() => setShowPhishingCode(true)}
                  className="w-full px-3 py-2 pr-12 border border-krborder rounded-xl bg-krblack text-krtext font-mono text-lg tracking-wider focus:ring-1 focus:ring-krgold"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  readOnly={!showPhishingCode}
                />
                <button
                  type="button"
                  onClick={() => setShowPhishingCode(!showPhishingCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-krmuted hover:text-krtext transition-colors"
                  title={showPhishingCode ? "Hide code" : "Show code"}
                >
                  {showPhishingCode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                onClick={generateRandomPhishingCode}
                className="px-4 py-2 bg-krgold/20 text-krgold rounded-xl hover:bg-krgold/30 transition-colors whitespace-nowrap"
              >
                Generate
              </button>
            </div>
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-blue-400 leading-relaxed">
                <strong>Security Feature:</strong> All legitimate emails from this system will include your anti-phishing code. 
                If you receive an email without this code, it's likely a phishing attempt. Never trust emails that don't contain your personal code.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveEmailSettings}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-krgold text-krblack rounded-xl hover:bg-kryellow transition-colors font-semibold"
            >
              <Save size={18} />
              Save Email Settings
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!email || sendingEmail}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-krcard rounded-xl shadow-sm border border-krborder p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-krtext">Data Management</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save size={20} />
            Export Data
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Link2 size={20} />
            Import Data
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 size={20} />
            Delete All Data
          </button>
        </div>
      </div>

      <div className="bg-krcard rounded-xl shadow-sm border border-krborder p-6">
        <h2 className="text-lg font-semibold mb-4 text-krtext">Discord Integration</h2>
        <div className="space-y-6">
          {/* Add New Webhook */}
          <div className="space-y-4 p-4 bg-krblack/50 rounded-lg">
            <h3 className="font-medium text-krtext">Add New Webhook</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-krtext mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:ring-1 focus:ring-krgold"
                  placeholder="e.g., Main Channel"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-krtext mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-krborder rounded-md bg-krblack text-krtext focus:ring-1 focus:ring-krgold"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={addWebhook}
              className="w-full px-4 py-2 bg-krgold text-white rounded-md hover:bg-kryellow transition-colors"
            >
              Add Webhook
            </button>
          </div>

          {/* Webhook List */}
          <div className="space-y-4">
            <h3 className="font-medium text-krtext">Manage Webhooks</h3>
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div 
                  key={webhook.id} 
                  className={`p-4 rounded-lg border ${webhook.id === activeWebhookId ? 'border-krgold bg-krgold/5' : 'border-krborder'}`}
                >
                  {editingWebhook?.id === webhook.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-krborder rounded-md focus:ring-1 focus:ring-krgold"
                          value={editingWebhook.name}
                          onChange={(e) => setEditingWebhook({...editingWebhook, name: e.target.value})}
                        />
                        <input
                          type="url"
                          className="w-full px-3 py-2 border border-krborder rounded-md focus:ring-1 focus:ring-krgold"
                          value={editingWebhook.url}
                          onChange={(e) => setEditingWebhook({...editingWebhook, url: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={updateWebhook}
                          className="px-3 py-1 bg-krgold text-white rounded hover:bg-kryellow transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingWebhook(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-krtext">{webhook.name}</div>
                        <div className="text-sm text-krmuted break-all">{webhook.url}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {webhook.id === activeWebhookId ? (
                          <span className="px-2 py-1 bg-krgold/10 text-krgold rounded text-sm whitespace-nowrap">Active</span>
                        ) : (
                          <button
                            onClick={() => handleSetActive(webhook.id)}
                            className="px-3 py-1 border border-krgold text-krgold rounded hover:bg-krgold hover:text-white transition-colors text-sm whitespace-nowrap"
                          >
                            Set Active
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingWebhook(webhook)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => removeWebhook(webhook.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => !isExporting && setShowExportModal(false)}
        title="Export Data"
      >
        <div className="space-y-4">
          {isExporting ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-lg font-medium text-krtext">Exporting your data...</p>
              <p className="text-sm text-krmuted mt-2">Please wait while we prepare your backup file</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                This will download all your data as a JSON file. You can use this file to backup or transfer your data.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Export
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => !isImporting && setShowImportModal(false)}
        title="Import Data"
      >
        <div className="space-y-4">
          {isImporting ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
              <p className="text-lg font-medium text-krtext">Importing your data...</p>
              <p className="text-sm text-krmuted mt-2">Please wait, this may take a moment</p>
              <p className="text-xs text-krmuted mt-4">
                Mode: <strong>{importMode === 'overwrite' ? 'Overwrite All Data' : 'Merge with Existing Data'}</strong>
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Select a JSON file to import. Choose whether to merge with existing data or overwrite everything.
              </p>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mb-4"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="mr-2"
                  />
                  Merge with existing data
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={importMode === 'overwrite'}
                    onChange={() => setImportMode('overwrite')}
                    className="mr-2"
                  />
                  Overwrite all data
                </label>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <strong>⚠️ {importMode === 'overwrite' ? 'Warning' : 'Note'}:</strong>{' '}
                {importMode === 'overwrite' 
                  ? 'This will replace ALL your current data with the imported file. Make sure you have a backup!'
                  : 'New data will be combined with your existing data. Duplicates may occur.'}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete All Data"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 text-red-800 rounded-md">
            <AlertTriangle className="flex-shrink-0" />
            <p>This action cannot be undone. All your data will be permanently deleted.</p>
          </div>
          <p className="text-gray-600">
            Type "delete" below to confirm:
          </p>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500"
            placeholder="Type 'delete' to confirm"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteConfirm.toLowerCase() !== 'delete'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete All Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

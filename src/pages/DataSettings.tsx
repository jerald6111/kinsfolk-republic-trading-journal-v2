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
  type DiscordWebhook 
} from '../utils/storage'
import { useCurrency } from '../context/CurrencyContext'
import Modal from '../components/Modal'
import { AlertTriangle, Save, Link2, Trash2, Mail, Shield, Download, Send, CheckCircle2 } from 'lucide-react'

type EmailFrequency = 'disabled' | 'every-update' | 'every-trade' | 'daily' | 'weekly'

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

  const handleExport = () => {
    exportData()
    setShowExportModal(false)
  }

  const handleImport = async () => {
    if (!selectedFile) return
    await importData(selectedFile, { overwrite: importMode === 'overwrite' })
    setShowImportModal(false)
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ''
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
    
    setEmailSaved(true)
    setTimeout(() => setEmailSaved(false), 3000)
  }

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Please save a valid email address first')
      return
    }

    setSendingEmail(true)
    
    try {
      // Export data
      const dataStr = JSON.stringify(localStorage, null, 2)
      
      // Resend API Configuration
      const RESEND_API_KEY = 're_D145aHmt_8nxXgKGfrUwfUeyP34SrujjN'
      const FROM_EMAIL = 'onboarding@resend.dev' // Default Resend email (you can add your own domain later)
      
      // Prepare email HTML with anti-phishing code
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4AF37 0%, #F4E157 100%); color: #1E2329; padding: 20px; border-radius: 10px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .phishing-code { background: #1E2329; color: #D4AF37; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; background: #D4AF37; color: #1E2329; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Trading Journal Backup</h1>
              <p>Kinsfolk Republic Trading Journal</p>
            </div>
            
            <div class="content">
              <h2>Your Data Backup is Ready</h2>
              <p>Hi there! 👋</p>
              <p>Your trading journal data has been successfully backed up.</p>
              
              <div class="phishing-code">
                🛡️ SECURITY CODE: ${antiPhishingCode}
              </div>
              
              <div class="warning">
                <strong>⚠️ IMPORTANT SECURITY NOTICE:</strong><br>
                Always verify this anti-phishing code matches your saved code. If the code doesn't match, 
                <strong>DO NOT TRUST THIS EMAIL</strong> - it may be a phishing attempt!
              </div>
              
              <p><strong>📅 Backup Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>📊 Auto-Send Frequency:</strong> ${emailFrequency === 'disabled' ? 'Manual Only' : emailFrequency.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              
              <h3>📥 How to Restore Your Backup:</h3>
              <ol>
                <li>Go to your Trading Journal Settings page</li>
                <li>Navigate to "Data Management" section</li>
                <li>Click "Import Data"</li>
                <li>Upload the backup file</li>
                <li>Choose "Merge" to combine with existing data, or "Overwrite" to replace all data</li>
              </ol>
              
              <p><strong>💾 Your Data:</strong><br>
              The backup is included below in JSON format. You can copy it and save it as a .json file.</p>
              
              <div style="background: #1E2329; color: #D4AF37; padding: 15px; border-radius: 8px; overflow-x: auto; max-height: 300px; overflow-y: auto;">
                <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 11px;">${dataStr}</pre>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated email from your Kinsfolk Republic Trading Journal.</p>
              <p>Keep your backups safe and secure! 🔐</p>
              <p style="margin-top: 20px;">
                <strong>Need Help?</strong><br>
                Visit your Settings page for more options and support.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
      
      // Send email using Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: `🔒 Trading Journal Backup - ${new Date().toLocaleDateString()} - Code: ${antiPhishingCode}`,
          html: emailHTML
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSendingEmail(false)
        alert(`✅ Email sent successfully to ${email}!\n\n🛡️ Anti-Phishing Code: ${antiPhishingCode}\n\nYour backup has been sent. Please check your inbox (and spam folder if needed).\n\nEmail ID: ${result.id}`)
      } else {
        throw new Error(result.message || 'Failed to send email')
      }
      
    } catch (error) {
      console.error('Error sending email:', error)
      setSendingEmail(false)
      
      // Fallback: download file if email fails
      const dataStr = JSON.stringify(localStorage, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert(`⚠️ Email sending failed\n\nYour backup has been downloaded instead. You can manually send it to ${email}\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          {emailSaved && (
            <span className="flex items-center gap-1 text-green-500 text-sm">
              <CheckCircle2 size={16} />
              Saved!
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-krtext mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-krborder rounded-xl bg-krblack text-krtext focus:ring-1 focus:ring-krgold"
              placeholder="your.email@example.com"
            />
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
              <option value="every-update">Every Update (Real-time)</option>
              <option value="every-trade">After Each Trade Entry</option>
              <option value="daily">Once a Day</option>
              <option value="weekly">Once a Week</option>
            </select>
            <p className="text-xs text-krmuted mt-1">
              {emailFrequency === 'disabled' && 'Automatic backups are disabled. Use manual send button.'}
              {emailFrequency === 'every-update' && 'Your data will be emailed after every change.'}
              {emailFrequency === 'every-trade' && 'Your data will be emailed after each trade is logged.'}
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
              <input
                type="text"
                value={antiPhishingCode}
                onChange={(e) => setAntiPhishingCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-krborder rounded-xl bg-krblack text-krtext font-mono text-lg tracking-wider focus:ring-1 focus:ring-krgold"
                placeholder="XXXXXXXX"
                maxLength={8}
              />
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

          {/* Info Note */}
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <h3 className="text-sm font-semibold text-green-400 mb-2">✅ Resend Email Service Active</h3>
            <div className="text-xs text-green-300 space-y-2 leading-relaxed">
              <p><strong>Status:</strong> Email sending is fully configured and ready to use!</p>
              <p><strong>Service:</strong> Resend (3,000 free emails/month)</p>
              <p><strong>Features:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Professional HTML emails with your anti-phishing code</li>
                <li>Automatic backup delivery to your inbox</li>
                <li>Beautiful formatted emails with instructions</li>
                <li>Inline JSON data for easy restoration</li>
                <li>Secure and reliable delivery</li>
              </ul>
              <p className="mt-2"><strong>💡 How to use:</strong></p>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Enter your email address above</li>
                <li>Set your anti-phishing code</li>
                <li>Choose auto-send frequency (or keep as manual)</li>
                <li>Click "Save Email Settings"</li>
                <li>Click "Send Now" to test!</li>
              </ol>
              <p className="mt-3 text-yellow-300"><strong>� Note:</strong> Emails are sent from <code className="bg-krblack px-1 py-0.5 rounded">onboarding@resend.dev</code>. Check your spam folder if you don't see it in your inbox!</p>
            </div>
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
        onClose={() => setShowExportModal(false)}
        title="Export Data"
      >
        <div className="space-y-4">
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
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Data"
      >
        <div className="space-y-4">
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Import
            </button>
          </div>
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

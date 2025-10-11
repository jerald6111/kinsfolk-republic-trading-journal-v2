import React, { useState } from 'react'
import Modal from './Modal'
import { getDiscordWebhooks, getActiveWebhookId } from '../utils/storage'
import type { DiscordWebhook } from '../utils/storage'
import { Check } from 'lucide-react'

type WebhookSelectorModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (webhookId: string) => void
}

export default function WebhookSelectorModal({ isOpen, onClose, onSelect }: WebhookSelectorModalProps) {
  const webhooks = getDiscordWebhooks()
  const activeWebhookId = getActiveWebhookId()
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null)

  // Function to mask webhook URL - show only last 4 characters
  const maskWebhookUrl = (url: string) => {
    if (url.length <= 4) return url
    return '•'.repeat(url.length - 4) + url.slice(-4)
  }

  // Sort webhooks to show active one first
  const sortedWebhooks = [...webhooks].sort((a, b) => {
    if (a.id === activeWebhookId && b.id !== activeWebhookId) return -1
    if (a.id !== activeWebhookId && b.id === activeWebhookId) return 1
    return 0
  })

  // Auto-select the active webhook when modal opens (as default suggestion)
  React.useEffect(() => {
    if (isOpen) {
      if (activeWebhookId && webhooks.find(w => w.id === activeWebhookId)) {
        setSelectedWebhookId(activeWebhookId)
      } else if (webhooks.length > 0) {
        setSelectedWebhookId(webhooks[0].id)
      }
    }
  }, [isOpen, webhooks, activeWebhookId])

  const handleConfirm = () => {
    if (selectedWebhookId) {
      onSelect(selectedWebhookId)
    }
  }

  if (!webhooks.length) {
    return (
      <Modal 
        title="Send to Discord" 
        isOpen={isOpen} 
        onClose={onClose}
      >
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">No webhooks configured. Please add webhooks in Data Settings.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-krgold text-krblack rounded-md hover:bg-kryellow transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal 
      title="Select Discord Channel" 
      isOpen={isOpen} 
      onClose={onClose}
    >
      <div className="p-6">
        <p className="text-gray-400 text-sm mb-4">
          Select a Discord webhook to send this trade to. The default active channel is pre-selected, but you can choose any configured channel:
        </p>
        <div className="space-y-3 mb-6">
          {sortedWebhooks.map((webhook: DiscordWebhook) => (
            <button
              key={webhook.id}
              onClick={() => setSelectedWebhookId(webhook.id)}
              type="button"
              className={`w-full p-4 text-left rounded-lg border transition-all cursor-pointer ${
                selectedWebhookId === webhook.id
                  ? 'border-krgold bg-krgold/10 shadow-md shadow-krgold/20'
                  : 'border-krborder hover:border-krgold/50 hover:bg-krgold/5'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-krwhite">{webhook.name}</div>
                    {webhook.id === activeWebhookId && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full whitespace-nowrap">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 font-mono break-all">{maskWebhookUrl(webhook.url)}</div>
                </div>
                {selectedWebhookId === webhook.id && (
                  <div className="w-6 h-6 bg-krgold rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={16} className="text-krblack" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-krtext transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedWebhookId}
            className="px-6 py-2 bg-gradient-to-r from-krgold to-kryellow text-krblack rounded-lg font-semibold hover:shadow-lg hover:shadow-krgold/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm & Send
          </button>
        </div>
      </div>
    </Modal>
  )
}
import React from 'react'
import Modal from './Modal'
import { getDiscordWebhooks } from '../utils/storage'
import type { DiscordWebhook } from '../utils/storage'

type WebhookSelectorModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (webhookId: string) => void
}

export default function WebhookSelectorModal({ isOpen, onClose, onSelect }: WebhookSelectorModalProps) {
  const webhooks = getDiscordWebhooks()

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
            className="px-4 py-2 bg-krgold text-white rounded-md hover:bg-kryellow transition-colors"
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
        <div className="space-y-3 mb-6">
          {webhooks.map((webhook: DiscordWebhook) => (
            <button
              key={webhook.id}
              onClick={() => onSelect(webhook.id)}
              className="w-full p-4 text-left rounded-lg border border-krborder hover:border-krgold hover:bg-krgold/5 transition-colors"
            >
              <div className="font-medium">{webhook.name}</div>
              <div className="text-sm text-gray-500 truncate">{webhook.url}</div>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { sendToDiscord } from '../utils/storage';
import WebhookSelectorModal from './WebhookSelectorModal';

export default function SendToDiscordButton({ trade }: { trade: any }) {
  const [sending, setSending] = useState(false);
  const [showWebhookSelector, setShowWebhookSelector] = useState(false);

  const handleSend = async (webhookId?: string) => {
    setSending(true);
    const success = await sendToDiscord(trade, webhookId);
    setSending(false);
    setShowWebhookSelector(false);
    if (success) {
      alert('Trade sent to Discord successfully!');
    } else {
      alert('Failed to send trade to Discord. Please check your webhook URL in Data Settings.');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowWebhookSelector(true)}
        disabled={sending}
        className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
        title="Send to Discord"
      >
        <SendHorizontal size={16} className={sending ? 'animate-pulse' : ''} />
        <span className="hidden sm:inline">Send to Discord</span>
      </button>

      <WebhookSelectorModal
        isOpen={showWebhookSelector}
        onClose={() => setShowWebhookSelector(false)}
        onSelect={handleSend}
      />
    </>
  );
}
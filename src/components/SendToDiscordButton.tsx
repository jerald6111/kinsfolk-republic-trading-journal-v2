import React, { useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { sendToDiscord } from '../utils/storage';

export default function SendToDiscordButton({ trade }: { trade: any }) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    const success = await sendToDiscord(trade);
    setSending(false);
    if (success) {
      alert('Trade sent to Discord successfully!');
    } else {
      alert('Failed to send trade to Discord. Please check your webhook URL in Data Settings.');
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
      title="Send to Discord"
    >
      <SendHorizontal size={16} className={sending ? 'animate-pulse' : ''} />
    </button>
  );
}
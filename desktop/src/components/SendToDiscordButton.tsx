import React, { useState } from 'react';
import { SendHorizontal, Check, X } from 'lucide-react';
import { sendToDiscord } from '../utils/storage';
import WebhookSelectorModal from './WebhookSelectorModal';

export default function SendToDiscordButton({ trade }: { trade: any }) {
  const [sending, setSending] = useState(false);
  const [showWebhookSelector, setShowWebhookSelector] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async (webhookId?: string) => {
    setSending(true);
    setSendError(null);
    
    try {
      const success = await sendToDiscord(trade, webhookId);
      setSending(false);
      setShowWebhookSelector(false);
      
      if (success) {
        setShowSuccessModal(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 3000);
      } else {
        setSendError('Failed to send trade to Discord. Please check your webhook URL in Data Settings.');
      }
    } catch (error) {
      setSending(false);
      setShowWebhookSelector(false);
      setSendError('An error occurred while sending to Discord.');
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
        {sending ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="hidden sm:inline">Sending...</span>
          </>
        ) : (
          <>
            <SendHorizontal size={16} />
            <span className="hidden sm:inline">Send to Discord</span>
          </>
        )}
      </button>

      <WebhookSelectorModal
        isOpen={showWebhookSelector}
        onClose={() => setShowWebhookSelector(false)}
        onSelect={handleSend}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-krcard backdrop-blur-xl border border-krborder rounded-xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="text-green-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-krwhite">Success!</h3>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="p-1 hover:bg-krgold/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-krtext" />
              </button>
            </div>
            <p className="text-gray-300">Trade has been sent to Discord successfully!</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {sendError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <X size={20} />
          <span>{sendError}</span>
          <button
            onClick={() => setSendError(null)}
            className="ml-2 hover:bg-red-600 rounded p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
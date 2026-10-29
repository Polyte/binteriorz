import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send } from 'lucide-react';
import { useCompanyContent } from '../content/CompanyContentContext';
import { COMPANY_NAME, whatsappLink } from '../content/company';

const DEFAULT_MESSAGE = `Hi ${COMPANY_NAME}! I'd like to chat about my space.`;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
    <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.129 6.744 3.047 9.379L1.054 31.49l6.328-2.024A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.32 22.608c-.39 1.1-1.932 2.013-3.17 2.28-.847.18-1.953.324-5.676-1.22-4.763-1.976-7.828-6.815-8.066-7.131-.23-.316-1.929-2.568-1.929-4.897 0-2.328 1.22-3.471 1.654-3.946.434-.474.948-.593 1.264-.593.316 0 .632.003.908.016.29.014.682-.112 1.066.814.39.948 1.33 3.249 1.447 3.485.118.237.198.513.04.83-.158.315-.237.513-.474.79-.237.276-.498.618-.711.829-.237.237-.484.494-.208.968.277.474 1.23 2.028 2.642 3.286 1.814 1.617 3.343 2.118 3.817 2.355.474.237.75.198 1.027-.118.277-.316 1.184-1.382 1.5-1.856.316-.474.632-.395 1.066-.237.434.158 2.756 1.3 3.23 1.537.474.237.79.355.908.553.118.197.118 1.146-.272 2.249z" />
  </svg>
);

export const WhatsAppWidget = () => {
  const { contact } = useCompanyContent();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [showPulse, setShowPulse] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);

  // Show auto-greeting bubble after 5s on first visit
  useEffect(() => {
    const greeted = sessionStorage.getItem('bi_wa_greeted');
    if (greeted) { setHasGreeted(true); return; }

    const timer = setTimeout(() => {
      setHasGreeted(true);
      sessionStorage.setItem('bi_wa_greeted', '1');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Stop pulse after 8s
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleSend = () => {
    window.open(whatsappLink(contact.whatsapp, message.trim() || DEFAULT_MESSAGE), '_blank', 'noopener');
    setIsOpen(false);
  };

  // Hidden until a WhatsApp number is set in Admin → Company Profile.
  if (!whatsappLink(contact.whatsapp)) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 right-auto z-50 flex flex-col items-start gap-3">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-[340px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#075e54] px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{COMPANY_NAME}</p>
                <p className="text-white/70 text-[11px]">Typically replies within minutes</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat body */}
            <div className="px-5 py-5 bg-[#e5ddd5] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] min-h-[120px]">
              <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm max-w-[85%] relative">
                <p className="text-[13px] text-neutral-800 leading-relaxed">
                  Hello! <span role="img" aria-label="wave">👋</span> Welcome to <strong>{COMPANY_NAME}</strong>. How can we help you today?
                </p>
                <p className="text-[10px] text-neutral-400 text-right mt-1.5">Now</p>
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-neutral-100">
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  rows={2}
                  className="flex-1 text-sm text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 rounded-xl px-4 py-2.5 outline-none resize-none border border-neutral-200 focus:border-[#25d366] transition-colors"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full bg-[#25d366] hover:bg-[#20bd5a] text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md"
                >
                  <Send className="w-4 h-4 translate-x-[1px]" />
                </button>
              </div>
              <p className="text-[9px] text-neutral-400 mt-2 text-center tracking-wide">
                Powered by WhatsApp &middot; End-to-end encrypted
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-greeting bubble (before user opens) */}
      <AnimatePresence>
        {!isOpen && hasGreeted && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-xl rounded-bl-none shadow-lg border border-neutral-100 px-4 py-2.5 max-w-[220px] cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <p className="text-xs text-neutral-700 leading-relaxed">
              Need help? <span role="img" aria-label="wave">👋</span> <span className="font-medium">Chat with us!</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close WhatsApp chat' : 'Chat with us on WhatsApp'}
        aria-expanded={isOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-lg shadow-[#25d366]/30 hover:shadow-xl hover:shadow-[#25d366]/40 transition-shadow"
      >
        {/* Pulse ring */}
        {showPulse && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25d366] animate-ping opacity-30" />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="wa"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WhatsAppIcon className="w-7 h-7" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
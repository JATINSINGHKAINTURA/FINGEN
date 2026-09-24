import React, { useState, useRef, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  ArrowDown, 
  RotateCcw,
  Zap,
  TrendingUp,
  ShieldAlert,
  CreditCard
} from 'lucide-react';

export const PulseAgentChat: React.FC = () => {
  const { 
    user, 
    accounts, 
    chatMessages, 
    sendChatMessage, 
    isAgentDrawerOpen, 
    setIsAgentDrawerOpen 
  } = useFinancial();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAgentDrawerOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isAgentDrawerOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    try {
      await sendChatMessage(message);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isAgentDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0b0f17]/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="w-5 h-5 animate-spin text-violet-200" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white">
                Pulse Agent
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Financial Copilot for Gig & Creator Income
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAgentDrawerOpen(false)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Live Financial Context Bar */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Rate: <strong className="text-emerald-400">${user.hourlyRate}/hr</strong></span>
        <span>Base: <strong className="text-teal-400">${user.baselineWeeklyIncome}/wk</strong></span>
        <span>Buffer: <strong className="text-cyan-400">${accounts.find(a => a.accountType === 'buffer_vault')?.balance || 2450}</strong></span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-violet-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">
                    {msg.content}
                  </div>
                </div>

                {/* Suggested Action Chips on Bot Messages */}
                {!isUser && msg.suggestedActions && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(action.label)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 hover:text-white transition-all text-left"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-500 font-mono block px-1">
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-violet-400" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse delay-75"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse delay-150"></span>
              <span className="font-mono text-[11px]">Pulse Agent calculating cash velocity...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2.5 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
        {[
          '🍕 Can I afford $65 dinner?',
          '🛡️ Test Impulse Cart',
          '🌴 Split Miami trip text',
          '⚡ Simulate lean week',
          '📊 1099 tax reserve estimate'
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white whitespace-nowrap transition-all flex-shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything about your cash flow or spending..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md shadow-violet-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

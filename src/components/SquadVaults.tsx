import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { 
  Zap, 
  Users, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Send, 
  Copy, 
  Check, 
  ArrowRight,
  DollarSign,
  Share2,
  PieChart
} from 'lucide-react';

export const SquadVaults: React.FC = () => {
  const { 
    squadVaults, 
    createSquadVault, 
    contributeToSquadVault 
  } = useFinancial();

  const [isCreatingVault, setIsCreatingVault] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌴');
  const [newDescription, setNewDescription] = useState('');
  const [newTarget, setNewTarget] = useState('1200');
  const [newCategory, setNewCategory] = useState<'Trip' | 'Apartment' | 'Dinner & Party' | 'Project' | 'Festival'>('Trip');

  // AI Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState({ name: 'Jordan Hayes', amount: 200, expense: 'Miami Basel Villa Deposit' });
  const [reminderVibe, setReminderVibe] = useState('chill_meme');
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenReminderModal = (name: string, amount: number, vaultTitle: string) => {
    setSelectedDebtor({ name, amount, expense: vaultTitle });
    setReminderModalOpen(true);
    fetchAiReminders(name, amount, vaultTitle, reminderVibe);
  };

  const fetchAiReminders = async (name: string, amount: number, expense: string, vibe: string) => {
    setIsGeneratingReminder(true);
    try {
      const res = await fetch('/api/split-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debtorName: name,
          amount,
          expenseTitle: expense,
          vibe
        })
      });
      const data = await res.json();
      setGeneratedMessages(data.messages || []);
    } catch (err) {
      console.error(err);
      setGeneratedMessages([
        { id: '1', style: 'Casual & Quick', text: `Yo ${name}! When you get a sec, toss over that $${amount} for ${expense} 🙌`, emoji: '⚡' },
        { id: '2', style: 'Playful Meme Vibe', text: `Pulse AI reminded me to balance the squad vault! Your share for ${expense} is $${amount} 🍕💸`, emoji: '💅' },
        { id: '3', style: 'Direct & Polite', text: `Hi ${name}, settling up the ledger for ${expense}. Total is $${amount}. Thank you!`, emoji: '💸' }
      ]);
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateVaultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    createSquadVault({
      title: `${newTitle} ${newEmoji}`,
      emoji: newEmoji,
      description: newDescription || 'Shared group expenses & automated settlement.',
      targetAmount: parseFloat(newTarget),
      category: newCategory,
      members: [
        { id: 'm1', name: 'Alex R. (You)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'admin', sharePercentage: 50, amountPaid: 0, amountOwed: 0, status: 'paid' },
        { id: 'm_friend_1', name: 'Taylor Swift', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', role: 'member', sharePercentage: 50, amountPaid: 0, amountOwed: parseFloat(newTarget) / 2, status: 'pending' }
      ],
      recentSplits: []
    });

    setIsCreatingVault(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Module Header */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            <Zap className="w-4 h-4" />
            <span>Module 4 • Squad Vaults & Social Splits</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Squad Micro-Vaults & Frictionless Splits
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Co-funded group accounts, real-time shared contribution ledgers, and AI "anti-awkward" reminder text generators that eliminate social friction.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingVault(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Squad Vault</span>
        </button>
      </div>

      {/* New Vault Modal */}
      {isCreatingVault && (
        <div className="glass-panel-glow p-6 rounded-3xl border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">
              Create a Shared Squad Vault
            </h3>
            <button
              onClick={() => setIsCreatingVault(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateVaultSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Vault Title (e.g. Coachella 2026, Tokyo AirBnb, Sunday Dinners)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coachella Safari Tent"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-amber-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Emoji Icon
                </label>
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-center text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Target Group Goal ($ USD)
                </label>
                <input
                  type="number"
                  placeholder="1500"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-amber-500 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="Trip">Trip & Travel</option>
                  <option value="Apartment">Apartment & Utilities</option>
                  <option value="Festival">Festival & Events</option>
                  <option value="Dinner & Party">Dinner & Party</option>
                  <option value="Project">Creator Collab Project</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Description / Rules
              </label>
              <input
                type="text"
                placeholder="Shared pool for tickets, food, and ride splits"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all"
            >
              Launch Squad Vault
            </button>
          </form>
        </div>
      )}

      {/* Squad Vault Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {squadVaults.map((vault) => {
          const progressPercent = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
          const pendingMembers = vault.members.filter(m => m.amountOwed > 0);

          return (
            <div key={vault.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 hover:border-amber-500/30 transition-all">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{vault.emoji}</span>
                    <h3 className="text-lg font-extrabold text-white">
                      {vault.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    {vault.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                  {vault.category}
                </span>
              </div>

              {/* Progress Bar & Amount */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-xl font-black text-amber-300 font-mono">
                      {formatCurrency(vault.currentAmount)}
                    </span>
                    <span className="text-slate-400 text-xs font-mono ml-1">
                      / {formatCurrency(vault.targetAmount)}
                    </span>
                  </div>
                  <span className="font-bold font-mono text-amber-400">{progressPercent}% Funded</span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Members Ledger */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Squad Members ({vault.members.length})</span>
                  <span>Ledger Status</span>
                </div>

                <div className="space-y-2">
                  {vault.members.map((member) => (
                    <div key={member.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-7 h-7 rounded-full object-cover border border-slate-700" 
                        />
                        <div>
                          <span className="text-xs font-semibold text-white block">{member.name}</span>
                          <span className="text-[10px] text-slate-400">
                            Paid: <span className="font-mono text-emerald-400">${member.amountPaid}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.amountOwed > 0 ? (
                          <>
                            <span className="text-xs font-mono text-rose-400 font-bold">
                              -${member.amountOwed}
                            </span>
                            <button
                              onClick={() => handleOpenReminderModal(member.name, member.amountOwed, vault.title)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-all flex items-center gap-1"
                              title="Generate AI Anti-Awkward reminder text"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>AI Nudge</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Paid in Full</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Vault Contribution Button */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => contributeToSquadVault(vault.id, 100)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
                >
                  + Deposit $100 Share
                </button>
                <button
                  onClick={() => contributeToSquadVault(vault.id, 250)}
                  className="py-2 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all"
                >
                  + $250
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* AI Anti-Awkward Debt Reminder Generator Modal */}
      {reminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel-glow w-full max-w-lg p-6 rounded-3xl border border-amber-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                <span>AI Anti-Awkward Debt Generator</span>
              </div>
              <button
                onClick={() => setReminderModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Target Friend: <strong>{selectedDebtor.name}</strong></span>
                <span className="font-mono text-amber-400 font-bold">${selectedDebtor.amount}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Expense: {selectedDebtor.expense}
              </p>
            </div>

            {/* Vibe Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold block">
                Select Tone Vibe:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'chill_meme', label: '🍕 Chill & Casual' },
                  { id: 'playful_roast', label: '💅 Playful Meme' },
                  { id: 'polite_direct', label: '💸 Direct & Clear' }
                ].map((vibe) => (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => {
                      setReminderVibe(vibe.id);
                      fetchAiReminders(selectedDebtor.name, selectedDebtor.amount, selectedDebtor.expense, vibe.id);
                    }}
                    className={`py-2 px-2 rounded-xl font-bold transition-all text-center text-[11px] ${
                      reminderVibe === vibe.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {vibe.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Message Cards */}
            <div className="space-y-2.5">
              <span className="text-xs text-slate-400 font-semibold block">
                {isGeneratingReminder ? 'Crafting friction-free texts with Gemini...' : 'Choose a message to copy or send:'}
              </span>

              {isGeneratingReminder ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                  <p>Generating personalized social text...</p>
                </div>
              ) : (
                generatedMessages.map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <span>{msg.emoji}</span>
                        <span>{msg.style}</span>
                      </span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          copiedId === msg.id
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied!' : 'Copy Text'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Venmo Direct Deep-link option */}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Venmo Request Shortcut</span>
              <a
                href={`https://venmo.com/?txn=charge&audience=private&amount=${selectedDebtor.amount}&note=${encodeURIComponent(selectedDebtor.expense)}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-bold"
              >
                Open Venmo App ↗
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

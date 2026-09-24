import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { 
  PlusCircle, 
  DollarSign, 
  Tag, 
  ShoppingBag, 
  Sparkles, 
  ShieldAlert,
  Calendar,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';

export const AddTransactionModal: React.FC = () => {
  const { 
    isAddTxModalOpen, 
    setIsAddTxModalOpen, 
    addTransaction, 
    categorizeTransactionWithAI,
    accounts,
    user,
    budgetAlerts,
    categoryBudgets
  } = useFinancial();

  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Gig Payout' | 'Income' | 'Food & Drink' | 'Shopping' | 'Entertainment' | 'Bills & Rent' | 'Subscriptions'>('Gig Payout');
  const [isExpense, setIsExpense] = useState(false);
  const [isImpulse, setIsImpulse] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [customAiTag, setCustomAiTag] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  if (!isAddTxModalOpen) return null;

  const parsedAmount = parseFloat(amount) || 0;

  // Real-time Budget Calculation for selected category
  const targetBudget = budgetAlerts.find(b => b.category === category);
  const currentSpent = targetBudget?.spent || 0;
  const monthlyLimit = targetBudget?.monthlyBudget || 200;
  const projectedSpent = isExpense ? currentSpent + parsedAmount : currentSpent;
  const projectedPercentage = monthlyLimit > 0 ? Number(((projectedSpent / monthlyLimit) * 100).toFixed(1)) : 0;
  const willCrossThreshold = isExpense && parsedAmount > 0 && projectedPercentage >= 80 && (targetBudget?.percentage || 0) < 80;
  const isCurrentlyOverThreshold = isExpense && parsedAmount > 0 && projectedPercentage >= 80;
  const isProjectedExceeded = isExpense && parsedAmount > 0 && projectedPercentage >= 100;

  const handleAiAutoClassify = async () => {
    if (!merchantName) return;
    setIsCategorizing(true);
    try {
      const result = await categorizeTransactionWithAI(
        merchantName, 
        isExpense ? -Math.abs(parsedAmount || 50) : Math.abs(parsedAmount || 500)
      );
      setCategory(result.category as any);
      setCustomAiTag(result.aiTag);
      setIsImpulse(result.isDoomspend);
      setIsRecurring(result.isRecurring);
      setAiRationale(`${result.aiTag} • ${result.reasoning} (${result.confidenceScore}% confidence)`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handlePreset = (preset: { merchant: string; amt: number; expense: boolean }) => {
    setMerchantName(preset.merchant);
    setAmount(preset.amt.toString());
    setIsExpense(preset.expense);
    // Trigger AI categorize
    setIsCategorizing(true);
    categorizeTransactionWithAI(preset.merchant, preset.expense ? -preset.amt : preset.amt)
      .then(res => {
        setCategory(res.category as any);
        setCustomAiTag(res.aiTag);
        setIsImpulse(res.isDoomspend);
        setIsRecurring(res.isRecurring);
        setAiRationale(`${res.aiTag} • ${res.reasoning} (${res.confidenceScore}% confidence)`);
      })
      .finally(() => setIsCategorizing(false));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName || parsedAmount <= 0) return;

    const finalAmount = isExpense ? -parsedAmount : parsedAmount;
    const checkingAcc = accounts.find(a => a.accountType === 'checking');

    let defaultTag = customAiTag;
    if (!defaultTag) {
      if (isExpense && isProjectedExceeded) {
        defaultTag = `Doomspend`;
      } else if (isExpense && isCurrentlyOverThreshold) {
        defaultTag = `⚠️ 80%+ Budget Alert`;
      } else if (isExpense && isImpulse) {
        defaultTag = `Doomspend`;
      } else if (!isExpense) {
        defaultTag = `Gig Earnings`;
      } else {
        defaultTag = `Daily Essential`;
      }
    }

    addTransaction({
      accountId: checkingAcc?.id || 'acc_primary_checking',
      accountName: checkingAcc?.name || 'Main Liquid Checking',
      amount: finalAmount,
      merchantName,
      category,
      date: new Date().toISOString(),
      isImpulse: isExpense ? isImpulse : false,
      isRecurring: isRecurring,
      aiTag: defaultTag
    });

    setIsAddTxModalOpen(false);
    setMerchantName('');
    setAmount('');
    setCustomAiTag('');
    setAiRationale(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-glow w-full max-w-md p-6 rounded-3xl border border-emerald-500/40 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
            <PlusCircle className="w-4 h-4" />
            <span>Smart Transaction Creator</span>
          </div>
          <button
            onClick={() => setIsAddTxModalOpen(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-white">
            Log Transaction Event
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Incoming gig payouts over baseline auto-sweep to Buffer Vault.
          </p>
        </div>

        {/* Income vs Expense Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsExpense(false); setCategory('Gig Payout'); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              !isExpense 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ Income / Payout</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsExpense(true); setCategory('Shopping'); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isExpense 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>- Expense / Spend</span>
          </button>
        </div>

        {/* Presets Strip */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Quick AI Test Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handlePreset({ merchant: 'Upwork Global Retainer', amt: 1250, expense: false })}
              className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all"
            >
              + Upwork ($1,250)
            </button>
            <button
              type="button"
              onClick={() => handlePreset({ merchant: 'Uber Eats 1 AM Burrito', amt: 42.50, expense: true })}
              className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
            >
              - Late Delivery ($42.50)
            </button>
            <button
              type="button"
              onClick={() => handlePreset({ merchant: 'Spotify Premium Family', amt: 16.99, expense: true })}
              className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
            >
              - Spotify ($16.99)
            </button>
            <button
              type="button"
              onClick={() => handlePreset({ merchant: 'Sunset Loft Rent & Utilities', amt: 1250, expense: true })}
              className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
            >
              - Rent ($1,250)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-300 font-semibold block">
                Merchant / Source
              </label>
              {merchantName && (
                <button
                  type="button"
                  onClick={handleAiAutoClassify}
                  disabled={isCategorizing}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  <Sparkles className={`w-3 h-3 ${isCategorizing ? 'animate-spin' : ''}`} />
                  <span>{isCategorizing ? 'Categorizing...' : 'AI Auto-Classify'}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder={isExpense ? 'e.g. DoorDash, Zara, Apple' : 'e.g. Upwork Payout, Brand Deal, TikTok Rewards'}
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-all"
              required
            />
          </div>

          {/* AI Tag & Rationale Preview */}
          {aiRationale && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AI Categorization: </span>
                <span>{aiRationale}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Amount ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="250.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none font-mono transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-emerald-500 outline-none"
              >
                {!isExpense ? (
                  <>
                    <option value="Gig Payout">Gig Payout</option>
                    <option value="Income">Creator Income</option>
                  </>
                ) : (
                  <>
                    <option value="Food & Drink">Food & Drink</option>
                    <option value="Shopping">Shopping & Fashion</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills & Rent">Bills & Rent</option>
                    <option value="Subscriptions">Subscriptions</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              AI Tag (Auto-Assigned)
            </label>
            <input
              type="text"
              placeholder="e.g. Gig Earnings, Subscription, Doomspend, Fixed Obligation"
              value={customAiTag}
              onChange={(e) => setCustomAiTag(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 outline-none transition-all font-mono"
            />
          </div>

          {/* Flags */}
          {isExpense && (
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isImpulse}
                  onChange={(e) => setIsImpulse(e.target.checked)}
                  className="rounded accent-violet-500"
                />
                <span>Tag as Late-Night Impulse</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>Recurring Monthly Bill</span>
              </label>
            </div>
          )}

          {/* Live Budget Threshold Warning Preview */}
          {isExpense && parsedAmount > 0 && targetBudget && (
            <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
              isProjectedExceeded
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : isCurrentlyOverThreshold
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {(isProjectedExceeded || isCurrentlyOverThreshold) && (
                    <AlertTriangle className={`w-3.5 h-3.5 ${isProjectedExceeded ? 'text-rose-400' : 'text-amber-400'}`} />
                  )}
                  <span>
                    {isProjectedExceeded 
                      ? '🚨 100%+ Budget Overdraft Warning' 
                      : isCurrentlyOverThreshold 
                      ? '⚠️ 80% Budget Alert Triggered' 
                      : 'Category Budget Status'}
                  </span>
                </span>
                <span className="font-mono font-bold">
                  {projectedPercentage}% of ${monthlyLimit}
                </span>
              </div>

              <div className="relative w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10" 
                  style={{ left: '80%' }}
                  title="80% Threshold"
                />
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isProjectedExceeded ? 'bg-rose-500' : isCurrentlyOverThreshold ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, projectedPercentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Current: {formatCurrency(currentSpent)}</span>
                <span>Projected: {formatCurrency(projectedSpent)}</span>
                <span>Limit: {formatCurrency(monthlyLimit)}</span>
              </div>
            </div>
          )}

          {!isExpense && parsedAmount > user.baselineWeeklyIncome && (
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                Amount exceeds ${user.baselineWeeklyIncome}/wk baseline. <strong className="text-white">+${(parsedAmount - user.baselineWeeklyIncome).toFixed(2)}</strong> will auto-sweep to Buffer Vault!
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all"
          >
            {isExpense ? 'Log Expense' : 'Log Payout & Sweep'}
          </button>
        </form>

      </div>
    </div>
  );
};

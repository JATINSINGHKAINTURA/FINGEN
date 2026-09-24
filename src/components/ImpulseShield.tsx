import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, getHoursRemaining, formatRelativeTime } from '../lib/utils';
import { 
  ShieldAlert, 
  Lock, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Flame, 
  ShoppingBag, 
  ArrowRight,
  TrendingDown,
  Gift,
  HelpCircle
} from 'lucide-react';

export const ImpulseShield: React.FC = () => {
  const { 
    user, 
    accounts, 
    chillLocks, 
    lockInChillVault, 
    cancelChillLock, 
    releaseChillLock 
  } = useFinancial();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [category, setCategory] = useState('Fashion & Apparel');
  const [currentMood, setCurrentMood] = useState('Late night scrolling / Bored');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiVerdictData, setAiVerdictData] = useState<any>(null);

  const activeLocks = chillLocks.filter(l => l.status === 'LOCKED');
  const savedLocks = chillLocks.filter(l => l.status === 'SAVED_CANCELLED');
  const totalSavedAmount = savedLocks.reduce((sum, l) => sum + l.amount, 0);

  const parsedPrice = parseFloat(itemPrice) || 0;
  const workHours = (parsedPrice / (user.hourlyRate || 32)).toFixed(1);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || parsedPrice <= 0) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/doomspend-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          price: parsedPrice,
          category,
          timeOfDay: '11:45 PM (Late-night trigger window)',
          hourlyRate: user.hourlyRate,
          currentMood
        })
      });
      const data = await response.json();
      setAiVerdictData(data);
    } catch (err) {
      console.error(err);
      setAiVerdictData({
        riskLevel: parsedPrice > 80 ? 'HIGH' : 'MODERATE',
        hourlyEquivalent: `${workHours} hours of freelance hustle`,
        psychologicalTrigger: 'Late-night dopamine surge and retail therapy urge.',
        alternativeOutcome: `Sweeping $${parsedPrice} to Buffer Vault protects your upcoming rent baseline.`,
        recommendedAction: 'CHILL_VAULT_24H',
        verdictMessage: `This cart requires ${workHours} hours of focused client work. Lock it in the 24h Chill Vault—if you still want it tomorrow, buy it guilt-free!`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmChillLock = () => {
    if (!itemName || parsedPrice <= 0) return;
    lockInChillVault({
      merchant: itemName,
      amount: parsedPrice,
      category,
      trigger: aiVerdictData?.psychologicalTrigger || currentMood,
      verdict: aiVerdictData?.verdictMessage
    });
    // Reset form
    setItemName('');
    setItemPrice('');
    setAiVerdictData(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Module Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-violet-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>Module 3 • Doomspend Interceptor</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Impulse Shield & 24h Chill Vault
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Converts item prices into required freelance work hours and provides 24-hour cooling periods. Cancel any impulse purchase to earn <span className="text-emerald-400 font-bold">+5 Pulse Health Score</span> points!
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-4 py-2 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Intercepted & Saved</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {formatCurrency(totalSavedAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Section: Test Cart / URL / Price */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Interceptor Tester Form */}
        <div className="lg:col-span-6 glass-panel-violet p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShoppingBag className="w-4 h-4 text-violet-400" />
              <span>Simulate an Impulse Cart Item</span>
            </div>
            <span className="text-xs font-mono text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
              AI Powered
            </span>
          </div>

          <form onSubmit={handleRunAnalysis} className="space-y-3.5">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Item or Cart Name (e.g. SSENSE Sneakers, Supreme Hoodie, TikTok Shop)
              </label>
              <input
                type="text"
                placeholder="e.g. Vintage Leather Bomber Jacket"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Price ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none font-mono transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-violet-500 outline-none transition-all"
                >
                  <option>Fashion & Apparel</option>
                  <option>Electronics & Gadgets</option>
                  <option>Sneaker Drops</option>
                  <option>Gaming & Micro-transactions</option>
                  <option>Late-Night Food Delivery</option>
                  <option>Home Aesthetic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Current Psychological State / Trigger
              </label>
              <select
                value={currentMood}
                onChange={(e) => setCurrentMood(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-violet-500 outline-none transition-all"
              >
                <option>Late night scrolling / Bored (11 PM - 3 AM)</option>
                <option>High stress / Seeking dopamine hit</option>
                <option>Limited edition countdown / FOMO panic</option>
                <option>Saw on TikTok influencer feed</option>
                <option>Celebratory after completing client milestone</option>
              </select>
            </div>

            {/* Real-time Hourly Rate Visualizer */}
            {parsedPrice > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-violet-500/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Hourly Work Conversion
                  </span>
                  <span className="text-xs text-slate-200">
                    At your rate of <span className="text-emerald-400 font-mono font-bold">${user.hourlyRate}/hr</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-violet-400 font-mono">
                    {workHours} hours
                  </span>
                  <span className="text-[10px] text-slate-400 block">of freelance hustle</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isAnalyzing || !itemName || parsedPrice <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-violet-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Intercepting Impulse...' : 'Analyze Doomspend Risk'}</span>
            </button>
          </form>
        </div>

        {/* Right 6 Cols: AI Verdict & Action Decision */}
        <div className="lg:col-span-6 space-y-4">
          {aiVerdictData ? (
            <div className="glass-panel p-6 rounded-3xl border border-violet-500/40 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    aiVerdictData.riskLevel === 'CRITICAL_DOOMSPEND' || aiVerdictData.riskLevel === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    RISK LEVEL: {aiVerdictData.riskLevel}
                  </span>
                </div>
                <span className="text-xs font-mono text-violet-300 font-bold">
                  {aiVerdictData.hourlyEquivalent}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-white">
                  Psychological Trigger Detected:
                </h3>
                <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 italic">
                  "{aiVerdictData.psychologicalTrigger}"
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-400">
                  Alternative Safety Net Value:
                </h4>
                <p className="text-xs text-slate-300">
                  {aiVerdictData.alternativeOutcome}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-violet-950/30 border border-violet-500/30 text-xs text-violet-200 leading-relaxed font-medium">
                {aiVerdictData.verdictMessage}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={handleConfirmChillLock}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-violet-600/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Freeze in 24h Chill Vault</span>
                </button>
                <button
                  onClick={() => setAiVerdictData(null)}
                  className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">
                  24h Chill Vault Rules
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  1. Purchase amount is temporarily moved to Chill Vault.<br/>
                  2. A 24-hour timer starts.<br/>
                  3. If you cancel after cooling down, your money returns to checking and you gain <strong>+5 Pulse Health points</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Active & Historical Chill Vault Locks List */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-400" />
              <span>Chill Vault Ledger</span>
              <span className="text-xs font-normal text-slate-400">({chillLocks.length} total)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Active frozen purchases and successfully prevented doomspends.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {chillLocks.map((lock) => {
            const isLocked = lock.status === 'LOCKED';
            const isCancelled = lock.status === 'SAVED_CANCELLED';
            const remaining = getHoursRemaining(lock.unlocksAt);

            return (
              <div 
                key={lock.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  isLocked 
                    ? 'bg-violet-950/20 border-violet-500/40' 
                    : isCancelled
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{lock.merchant}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isLocked 
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 animate-pulse' 
                          : isCancelled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isLocked ? 'FROZEN (24H)' : isCancelled ? 'SAVED (+5 SCORE)' : 'PURCHASED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="text-violet-300 font-mono font-bold">{formatCurrency(lock.amount)}</span>
                      <span>•</span>
                      <span>{lock.hoursEquivalent}h work equiv</span>
                      <span>•</span>
                      <span>{formatRelativeTime(lock.lockedAt)}</span>
                    </div>

                    {lock.psychologicalTrigger && (
                      <p className="text-[11px] text-slate-400 italic">
                        Trigger: {lock.psychologicalTrigger}
                      </p>
                    )}
                  </div>

                  {/* Right actions / countdown */}
                  <div className="flex items-center gap-3">
                    {isLocked ? (
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-violet-300 font-mono font-bold bg-violet-500/15 px-3 py-1 rounded-lg border border-violet-500/30">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>{remaining.hours}h {remaining.minutes}m left</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => cancelChillLock(lock.id)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold hover:scale-105 transition-all shadow-md shadow-emerald-500/20"
                          >
                            🎉 Cancel & Save (+5 pts)
                          </button>
                          <button
                            onClick={() => releaseChillLock(lock.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                          >
                            Release
                          </button>
                        </div>
                      </div>
                    ) : isCancelled ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved to Checking (+5 Pts Awarded)</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">
                        Completed deliberately
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

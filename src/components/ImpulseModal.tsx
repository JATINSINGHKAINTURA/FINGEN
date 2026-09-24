import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { 
  ShieldAlert, 
  Lock, 
  Sparkles, 
  X, 
  ShoppingBag, 
  AlertTriangle 
} from 'lucide-react';

export const ImpulseModal: React.FC = () => {
  const { 
    isImpulseModalOpen, 
    setIsImpulseModalOpen, 
    user, 
    lockInChillVault 
  } = useFinancial();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [category, setCategory] = useState('Fashion & Apparel');
  const [currentMood, setCurrentMood] = useState('Late night scrolling / Bored');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiVerdictData, setAiVerdictData] = useState<any>(null);

  if (!isImpulseModalOpen) return null;

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
        psychologicalTrigger: 'Instant gratification & late night dopamine loop.',
        alternativeOutcome: `Moving $${parsedPrice} to Buffer Vault protects against dry spells.`,
        recommendedAction: 'CHILL_VAULT_24H',
        verdictMessage: `This cart equals ${workHours} hours of deep client work. Send it to the 24h Chill Vault to cool down guilt-free!`
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
    setIsImpulseModalOpen(false);
    setItemName('');
    setItemPrice('');
    setAiVerdictData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-violet w-full max-w-lg p-6 rounded-3xl border border-violet-500/40 space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider font-mono">
            <ShieldAlert className="w-4 h-4" />
            <span>Doomspend Interceptor Live Simulator</span>
          </div>
          <button
            onClick={() => setIsImpulseModalOpen(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-white">
            Intercept Impulsive Cart Drop
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Test any late-night online cart or impulse desire against your hourly rate.
          </p>
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-3.5">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Cart or Product Name
            </label>
            <input
              type="text"
              placeholder="e.g. Vintage Salomon XT-6 Sneakers"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Cart Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="165.00"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none font-mono transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-violet-500 outline-none"
              >
                <option>Fashion & Apparel</option>
                <option>Sneaker Drops</option>
                <option>Electronics & Gadgets</option>
                <option>Gaming & Micro-transactions</option>
                <option>Late-Night Food Delivery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              Emotional State / Reason
            </label>
            <select
              value={currentMood}
              onChange={(e) => setCurrentMood(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:border-violet-500 outline-none"
            >
              <option>Late night scrolling / Bored (11 PM - 3 AM)</option>
              <option>High stress / Seeking dopamine hit</option>
              <option>Limited edition countdown / FOMO panic</option>
              <option>Saw on TikTok influencer feed</option>
              <option>Celebratory after completing client milestone</option>
            </select>
          </div>

          {parsedPrice > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-violet-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Work Hours Equivalent:
              </span>
              <span className="text-base font-black text-violet-400 font-mono">
                {workHours} hrs of freelance work
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isAnalyzing || !itemName || parsedPrice <= 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-violet-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Intercepting Impulse...' : 'Analyze with Gemini AI'}</span>
          </button>
        </form>

        {aiVerdictData && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-violet-500/40 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Risk: {aiVerdictData.riskLevel}
              </span>
              <span className="text-xs font-mono text-violet-300 font-bold">
                {aiVerdictData.hourlyEquivalent}
              </span>
            </div>

            <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              "{aiVerdictData.psychologicalTrigger}"
            </p>

            <p className="text-xs text-violet-200 font-medium leading-relaxed">
              {aiVerdictData.verdictMessage}
            </p>

            <button
              onClick={handleConfirmChillLock}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-extrabold shadow-md shadow-violet-600/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Freeze in 24h Chill Vault</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

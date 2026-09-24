import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { ExpenseCategory } from '../types';
import { 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  X, 
  DollarSign, 
  RotateCcw,
  ShieldCheck,
  Zap,
  PieChart
} from 'lucide-react';

export const BudgetManagerModal: React.FC = () => {
  const { 
    isBudgetModalOpen, 
    setIsBudgetModalOpen, 
    budgetAlerts, 
    setCategoryBudget,
    resetBudgetAlerts,
    user
  } = useFinancial();

  const [editingBudgets, setEditingBudgets] = useState<Record<string, number>>({});

  if (!isBudgetModalOpen) return null;

  const handleSliderChange = (cat: ExpenseCategory, val: number) => {
    setCategoryBudget(cat, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-glow w-full max-w-2xl p-6 rounded-3xl border border-amber-500/40 space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
            <Sliders className="w-4 h-4" />
            <span>Category Budget & 80% Threshold Guard</span>
          </div>
          <button
            onClick={() => setIsBudgetModalOpen(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">
            Monthly Category Budgets
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Pulse AI constantly monitors your outflow. If your spending exceeds <strong>80%</strong> of any monthly category limit, a visual warning alert is triggered automatically.
          </p>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {budgetAlerts.map((b) => {
            const isWarning = b.isWarning;
            const isExceeded = b.isExceeded;
            const threshold80Amount = b.monthlyBudget * 0.8;

            return (
              <div 
                key={b.category} 
                className={`p-4 rounded-2xl border transition-all ${
                  isExceeded
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {b.category === 'Food & Drink' ? '🍔' :
                       b.category === 'Shopping' ? '🛍️' :
                       b.category === 'Entertainment' ? '🎮' :
                       b.category === 'Bills & Rent' ? '🏠' : '🔄'}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{b.category}</span>
                        {isExceeded ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            100% Exceeded
                          </span>
                        ) : isWarning ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ⚠️ &gt;80% Alert ({b.percentage}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Normal ({b.percentage}%)
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Spent: <strong className="text-white font-mono">{formatCurrency(b.spent)}</strong> • Remaining: <strong className="text-emerald-400 font-mono">{formatCurrency(b.remaining)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Monthly Budget Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Budget:</span>
                    <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-xs text-slate-400 font-mono">$</span>
                      <input
                        type="number"
                        min="20"
                        max="5000"
                        step="10"
                        value={b.monthlyBudget}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            handleSliderChange(b.category, val);
                          }
                        }}
                        className="w-16 bg-transparent text-xs font-mono font-bold text-white outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">/mo</span>
                    </div>
                  </div>
                </div>

                {/* Range Slider & Progress visualization */}
                <div className="space-y-1.5 pt-1">
                  <div className="relative w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    {/* Vertical 80% line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10" 
                      style={{ left: '80%' }}
                      title="80% Warning Threshold"
                    />

                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : isWarning
                          ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>$0</span>
                    <span className="text-amber-400 font-semibold">80% Warning Limit: {formatCurrency(threshold80Amount)}</span>
                    <span>100% Target: {formatCurrency(b.monthlyBudget)}</span>
                  </div>

                  {/* Interactive Slider */}
                  <input
                    type="range"
                    min="50"
                    max={b.category === 'Bills & Rent' ? 3000 : 800}
                    step="10"
                    value={b.monthlyBudget}
                    onChange={(e) => handleSliderChange(b.category, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={resetBudgetAlerts}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Dismissed Warnings</span>
          </button>

          <button
            onClick={() => setIsBudgetModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

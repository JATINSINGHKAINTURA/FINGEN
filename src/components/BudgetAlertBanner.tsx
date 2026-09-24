import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Sliders, 
  Sparkles, 
  X, 
  ArrowRight,
  TrendingDown,
  BellRing,
  PieChart
} from 'lucide-react';

interface BudgetAlertBannerProps {
  onOpenBudgetModal?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({ 
  onOpenBudgetModal, 
  setActiveTab 
}) => {
  const { 
    activeBudgetAlerts, 
    dismissBudgetAlert, 
    setIsBudgetModalOpen, 
    setIsImpulseModalOpen,
    setIsAgentDrawerOpen,
    user
  } = useFinancial();

  if (activeBudgetAlerts.length === 0) return null;

  return (
    <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
      {activeBudgetAlerts.map((alert) => {
        const isCritical = alert.isExceeded;
        const workHours = (alert.spent / (user.hourlyRate || 32)).toFixed(1);

        return (
          <div
            key={alert.category}
            className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all shadow-xl ${
              isCritical
                ? 'bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-red-950/40 border-rose-500/60 shadow-rose-950/30'
                : 'bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-orange-950/30 border-amber-500/50 shadow-amber-950/25'
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
              isCritical ? 'bg-rose-500/15' : 'bg-amber-500/15'
            }`} />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left Column: Icon, Title, and Context */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className={`p-1.5 rounded-xl flex-shrink-0 ${
                    isCritical 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>

                  <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isCritical ? '🚨 100% Budget Exceeded' : '⚠️ 80% Budget Threshold Warning'}
                  </span>

                  <span className="text-xs font-bold text-white font-mono">
                    {alert.category}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 pt-0.5">
                  <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {isCritical ? (
                      <>
                        Over budget by <span className="text-rose-400 font-mono">{formatCurrency(alert.overAmount)}</span> in {alert.category}
                      </>
                    ) : (
                      <>
                        You've reached <span className="text-amber-400 font-mono">{alert.percentage}%</span> of your monthly {alert.category} budget
                      </>
                    )}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Spent <strong className="text-white font-mono">{formatCurrency(alert.spent)}</strong> of your <strong className="text-slate-200 font-mono">{formatCurrency(alert.monthlyBudget)}</strong> monthly allowance ({workHours}h of freelance work equivalent). {alert.remaining > 0 ? `Only ${formatCurrency(alert.remaining)} remaining this cycle.` : 'Zero allowance remaining for this category.'}
                </p>

                {/* Progress bar with 80% threshold marker */}
                <div className="pt-2 max-w-xl space-y-1">
                  <div className="relative w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    {/* 80% threshold line marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-20"
                      style={{ left: '80%' }}
                      title="80% Alert Threshold"
                    />

                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical 
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500' 
                          : 'bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, alert.percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
                    <span>$0</span>
                    <span className="text-amber-400 font-bold">80% Alert Marker ({formatCurrency(alert.monthlyBudget * 0.8)})</span>
                    <span>100% ({formatCurrency(alert.monthlyBudget)})</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex flex-wrap sm:flex-nowrap md:flex-col lg:flex-row items-center gap-2 self-start md:self-center">
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    isCritical
                      ? 'bg-rose-500 text-slate-950 hover:bg-rose-400 shadow-rose-500/20'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Adjust Budget</span>
                </button>

                <button
                  onClick={() => setIsImpulseModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Freeze subsequent purchases in 24h Chill Vault"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
                  <span>Chill Vault</span>
                </button>

                <button
                  onClick={() => dismissBudgetAlert(alert.category)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
                  title="Dismiss warning for this session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

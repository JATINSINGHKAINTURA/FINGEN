import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Building, 
  Zap, 
  Music, 
  Dumbbell, 
  ShoppingBag,
  ExternalLink,
  Info,
  ArrowRight
} from 'lucide-react';

export const CreditElevator: React.FC = () => {
  const { 
    subscriptions, 
    toggleSubscriptionReporting, 
    toggleAllSubscriptions 
  } = useFinancial();

  const [isSimulatingAi, setIsSimulatingAi] = useState(false);
  const [aiReportData, setAiReportData] = useState<any>(null);

  const baseCreditScore = 668;
  const reportedSubscriptions = subscriptions.filter(s => s.isReported);
  const totalBoost = reportedSubscriptions.reduce((sum, s) => sum + s.impactScore, 0);
  const projectedScore = baseCreditScore + totalBoost;

  const handleRunCreditAiAudit = async () => {
    setIsSimulatingAi(true);
    try {
      const res = await fetch('/api/credit-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptions,
          currentCreditScore: baseCreditScore
        })
      });
      const data = await res.json();
      setAiReportData(data);
    } catch (err) {
      console.error(err);
      setAiReportData({
        projectedScore30Days: baseCreditScore + 15,
        projectedScore90Days: baseCreditScore + 28,
        projectedScore180Days: baseCreditScore + 42,
        totalEstimatedPointsBoost: 42,
        bureauReportableStatus: 'ELIGIBLE_ACTIVE',
        insights: [
          'Reporting on-time Rent ($1,250/mo) demonstrates steady large-obligation capacity to Experian.',
          '100% on-time Spotify & Equinox payments establish 22 consecutive positive payment marks.',
          'Zero late fees on Klarna settlements boosts alternative payment velocity on Equifax rails.'
        ],
        bureauBadges: [
          { bureau: 'Experian Boost', status: 'Ready to sync', points: '+18 pts' },
          { bureau: 'TransUnion', status: 'RentTrack Verified', points: '+14 pts' },
          { bureau: 'Equifax', status: 'BNPL Alternative Rail', points: '+10 pts' }
        ]
      });
    } finally {
      setIsSimulatingAi(false);
    }
  };

  const getSubIcon = (category: string) => {
    switch (category) {
      case 'Rent': return Building;
      case 'Streaming': return Music;
      case 'Fitness': return Dumbbell;
      case 'BNPL': return ShoppingBag;
      default: return Zap;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Module Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
            <CreditCard className="w-4 h-4" />
            <span>Module 5 • Alternative Credit Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Credit Elevator & Alt-Scoring
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Gen Z rarely carries 5 high-fee credit cards. Credit Elevator reports your on-time Rent, Spotify, Gym, Utilities, and BNPL settlements to major credit bureaus for rapid score growth.
          </p>
        </div>

        <button
          onClick={handleRunCreditAiAudit}
          disabled={isSimulatingAi}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSimulatingAi ? 'Auditing Rails...' : 'Run Bureau Simulator'}</span>
        </button>
      </div>

      {/* Credit Score Gauge & Trajectory Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Score Visualizer */}
        <div className="lg:col-span-5 glass-panel-glow p-6 rounded-3xl space-y-5 border border-indigo-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                Bureau Trajectory
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                +{totalBoost} Projected Pts
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black text-white font-mono tracking-tight">
                {projectedScore}
              </span>
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 font-mono line-through block">
                  Base: {baseCreditScore}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Prime Tier (680+)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2">
              Based on <strong>{reportedSubscriptions.length}</strong> active reported rails over consecutive billing cycles.
            </p>
          </div>

          {/* Trajectory Milestone Bars */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block">
              6-Month Projected Bureau Elevation
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Score</span>
                <span className="text-white font-bold">{baseCreditScore}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: `${(baseCreditScore / 850) * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-indigo-300">With Pulse Alt-Reporting (90 Days)</span>
                <span className="text-indigo-400 font-bold">+{Math.round(totalBoost * 0.7)} pts ({baseCreditScore + Math.round(totalBoost * 0.7)})</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${((baseCreditScore + totalBoost * 0.7) / 850) * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-emerald-300">Max Projected Ceiling (180 Days)</span>
                <span className="text-emerald-400 font-bold">{projectedScore}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${(projectedScore / 850) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* 1-Click All Opt-in */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => toggleAllSubscriptions(true)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all"
            >
              ✓ Opt-In All to Bureaus
            </button>
            <button
              onClick={() => toggleAllSubscriptions(false)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Verified Reportable Recurring Items */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-white">
                Verified Positive Payment Rails
              </h3>
              <p className="text-xs text-slate-400">
                Toggle recurring items to include in bureau telemetry.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {reportedSubscriptions.length}/{subscriptions.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const Icon = getSubIcon(sub.category);

              return (
                <div
                  key={sub.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    sub.isReported
                      ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${
                      sub.isReported ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">{sub.name}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          +{sub.impactScore} pts
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono font-bold text-slate-200">${sub.monthlyAmount}/mo</span>
                        <span>•</span>
                        <span>{sub.consecutiveOnTimeMonths} on-time payments</span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button & Bureau Sync Badges */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-1">
                      {sub.bureauSync.experian && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                          EXP
                        </span>
                      )}
                      {sub.bureauSync.transunion && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                          TU
                        </span>
                      )}
                      {sub.bureauSync.equifax && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                          EQ
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleSubscriptionReporting(sub.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        sub.isReported
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sub.isReported ? '✓ Reporting' : 'Enable'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* AI Bureau Audit Insights Card if generated */}
      {aiReportData && (
        <div className="glass-panel-glow p-6 rounded-3xl border border-indigo-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Gemini Bureau Alternative Scoring Analysis</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              +{aiReportData.totalEstimatedPointsBoost} pts total projected boost
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(aiReportData.insights || []).map((insight: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="text-indigo-400 font-bold block">Pillar {idx + 1}</span>
                <p className="leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

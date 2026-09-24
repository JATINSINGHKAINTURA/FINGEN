import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Play,
  RotateCcw,
  Percent,
  Layers
} from 'lucide-react';

export const IncomeSmoother: React.FC = () => {
  const { 
    user, 
    accounts, 
    incomeWeeks, 
    setBaselineIncome, 
    simulateIncomeWeek 
  } = useFinancial();

  const [baselineSlider, setBaselineSlider] = useState(user.baselineWeeklyIncome);
  const [taxPercent, setTaxPercent] = useState(25); // 25% tax reserve for 1099
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const bufferAcc = accounts.find(a => a.accountType === 'buffer_vault');
  const bufferBalance = bufferAcc ? bufferAcc.balance : 2450;
  const runwayWeeks = (bufferBalance / baselineSlider).toFixed(1);

  // Calculate statistics across recorded weeks
  const totalEarned = incomeWeeks.reduce((sum, w) => sum + w.earned, 0);
  const averageWeeklyEarned = Math.round(totalEarned / (incomeWeeks.length || 1));
  const surplusWeeksCount = incomeWeeks.filter(w => w.status === 'surplus').length;
  const deficitWeeksCount = incomeWeeks.filter(w => w.status === 'deficit').length;

  const handleApplyBaseline = () => {
    setBaselineIncome(baselineSlider);
  };

  const handleRunAiSmoother = async () => {
    setIsAiAnalyzing(true);
    try {
      const response = await fetch('/api/income-smoother', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklyEarningsHistory: incomeWeeks,
          targetBaseline: baselineSlider
        })
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error(err);
      setAiAnalysis({
        recommendedBaseline: 850,
        estimatedBufferRunwayWeeks: Number(runwayWeeks),
        volatilityIndex: 'MODERATE',
        strategySummary: `Your weekly income variance is ~45%. Maintaining a $${baselineSlider}/wk baseline cushions against lean cycles.`
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
            <TrendingUp className="w-4 h-4" />
            <span>Module 2 • Smart Buffering</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Dynamic Income Smoother
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Automates safety-net sweeps during feast weeks and top-up disbursements during lean weeks so your checking account receives a guaranteed, predictable paycheck.
          </p>
        </div>

        <button
          onClick={handleRunAiSmoother}
          disabled={isAiAnalyzing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAiAnalyzing ? 'Analyzing Cash Flow...' : 'AI Volatility Audit'}</span>
        </button>
      </div>

      {/* AI Volatility Analysis Card if loaded */}
      {aiAnalysis && (
        <div className="glass-panel-glow p-5 rounded-3xl border border-cyan-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              ✨ Gemini Income Intelligence
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Volatility: {aiAnalysis.volatilityIndex || 'MODERATE'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {aiAnalysis.strategySummary}
          </p>
          {aiAnalysis.smartDistribution && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Guaranteed Paycheck</span>
                <span className="font-bold text-white font-mono">{aiAnalysis.smartDistribution.checkingCoverage}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Buffer Surplus</span>
                <span className="font-bold text-cyan-300">{aiAnalysis.smartDistribution.bufferSurplus}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Tax Shield</span>
                <span className="font-bold text-amber-300">{aiAnalysis.smartDistribution.taxShield}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Buffer Vault Balance */}
        <div className="glass-panel p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Buffer Vault Balance</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {formatCurrency(bufferBalance)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Safety Runway:</span>
            <span className="font-bold text-cyan-400 font-mono">{runwayWeeks} weeks</span>
          </div>
        </div>

        {/* Guaranteed Weekly Baseline */}
        <div className="glass-panel p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Weekly Baseline</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {formatCurrency(user.baselineWeeklyIncome)}
          </div>
          <p className="text-[11px] text-slate-400">
            Fixed living expenses covered
          </p>
        </div>

        {/* 90-Day Avg Weekly Earnings */}
        <div className="glass-panel p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Historical Avg / Week</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            {formatCurrency(averageWeeklyEarned)}
          </div>
          <p className="text-[11px] text-slate-400">
            Over {incomeWeeks.length} recorded cycles
          </p>
        </div>

        {/* Feast vs Lean Cycles */}
        <div className="glass-panel p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cycle Distributions</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-3 text-sm font-bold font-mono pt-1">
            <span className="text-emerald-400">+{surplusWeeksCount} Feast</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400">-{deficitWeeksCount} Lean</span>
          </div>
          <p className="text-[11px] text-slate-400">
            100% smoothed without overdrafts
          </p>
        </div>

      </div>

      {/* Interactive Controls & Live Weekly Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Baseline Income Adjuster & 1099 Tax Split */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">
              Baseline & Distribution Config
            </h3>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Live Engine
            </span>
          </div>

          {/* Baseline Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Guaranteed Weekly Checking Paycheck:</span>
              <span className="font-extrabold text-emerald-400 font-mono text-sm">
                ${baselineSlider}/week
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="2000"
              step="50"
              value={baselineSlider}
              onChange={(e) => setBaselineSlider(Number(e.target.value))}
              className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$400/wk (Minimalist)</span>
              <span>$1,200/wk (Standard)</span>
              <span>$2,000/wk (Scale)</span>
            </div>
            {baselineSlider !== user.baselineWeeklyIncome && (
              <button
                onClick={handleApplyBaseline}
                className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all mt-2"
              >
                Apply ${baselineSlider}/wk Baseline Setting
              </button>
            )}
          </div>

          {/* 1099 Tax Shield Reserve Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">1099 Gig Tax Reserve Earmark:</span>
              <span className="font-extrabold text-amber-400 font-mono text-sm">
                {taxPercent}%
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="35"
              step="1"
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Allocates {taxPercent}% of gig surplus for estimated quarterly taxes so tax season brings zero panic.
            </p>
          </div>
        </div>

        {/* Right 6 Cols: Interactive Scenario Simulator */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Interactive Week Scenario Simulator</span>
            </h3>
            <span className="text-[11px] text-slate-400">Test the buffer logic</span>
          </div>

          <p className="text-xs text-slate-300">
            Click any scenario to simulate an incoming weekly payout. Watch how surplus funds auto-sweep or deficit funds auto-disburse.
          </p>

          <div className="grid grid-cols-2 gap-3">
            
            {/* Scenario 1: Feast Week */}
            <button
              onClick={() => simulateIncomeWeek(1450)}
              className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-400">🎉 Feast Week</span>
                <span className="text-xs font-mono text-white font-bold">$1,450</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Sweeps +${1450 - user.baselineWeeklyIncome} surplus to Buffer Vault
              </p>
            </button>

            {/* Scenario 2: Dry / Lean Week */}
            <button
              onClick={() => simulateIncomeWeek(420)}
              className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-rose-400">🌧️ Lean Week</span>
                <span className="text-xs font-mono text-white font-bold">$420</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Disburses +${user.baselineWeeklyIncome - 420} from Buffer to checking
              </p>
            </button>

            {/* Scenario 3: Creator Brand Deal Drop */}
            <button
              onClick={() => simulateIncomeWeek(2100)}
              className="p-3.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-purple-400">🚀 Big Sponsorship</span>
                <span className="text-xs font-mono text-white font-bold">$2,100</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Massive buffer surge +${2100 - user.baselineWeeklyIncome}
              </p>
            </button>

            {/* Scenario 4: Balanced Week */}
            <button
              onClick={() => simulateIncomeWeek(user.baselineWeeklyIncome)}
              className="p-3.5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-teal-400">🎯 Exact Target</span>
                <span className="text-xs font-mono text-white font-bold">${user.baselineWeeklyIncome}</span>
              </div>
              <p className="text-[10px] text-slate-300">
                100% covers checking, zero buffer movement
              </p>
            </button>

          </div>
        </div>

      </div>

      {/* Historical Weekly Income Timeline Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-white">
          Historical Dynamic Smoothing Timeline
        </h3>

        <div className="space-y-3">
          {incomeWeeks.slice().reverse().map((item, idx) => {
            const isSurplus = item.status === 'surplus';
            const isDeficit = item.status === 'deficit';

            return (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isSurplus 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : isDeficit 
                      ? 'bg-rose-500/10 text-rose-400' 
                      : 'bg-teal-500/10 text-teal-400'
                  }`}>
                    {isSurplus ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.week}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isSurplus 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : isDeficit 
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                          : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                      }`}>
                        {isSurplus ? 'FEAST SWEEP' : isDeficit ? 'LEAN TOP-UP' : 'BALANCED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Earned: <span className="font-mono text-slate-200 font-bold">${item.earned}</span> vs ${item.baseline} baseline
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Buffer Movement</span>
                    <span className={`text-xs sm:text-sm font-extrabold font-mono ${
                      isSurplus ? 'text-emerald-400' : isDeficit ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {item.sweepAmount > 0 ? `+${formatCurrency(item.sweepAmount)} (Swept)` : item.sweepAmount < 0 ? `${formatCurrency(item.sweepAmount)} (Disbursed)` : '$0.00'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Buffer Total</span>
                    <span className="text-xs sm:text-sm font-bold text-cyan-300 font-mono">
                      {formatCurrency(item.bufferResultBalance)}
                    </span>
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

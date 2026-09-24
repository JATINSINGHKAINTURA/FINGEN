import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Info,
  DollarSign,
  Zap,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { IncomeForecastData, ForecastWeekItem } from '../types';

export const IncomeForecastTab: React.FC = () => {
  const { 
    user, 
    accounts, 
    incomeWeeks, 
    transactions, 
    subscriptions,
    addTransaction,
    triggerConfetti 
  } = useFinancial();

  const bufferAcc = accounts.find(a => a.accountType === 'buffer_vault');
  const checkingAcc = accounts.find(a => a.accountType === 'checking');
  const currentBuffer = bufferAcc?.balance || 2450;
  const currentChecking = checkingAcc?.balance || 1485;

  const [isLoading, setIsLoading] = useState(false);
  const [forecastData, setForecastData] = useState<IncomeForecastData | null>(null);
  const [inflowMultiplier, setInflowMultiplier] = useState<number>(100); // 80% to 140%
  const [executedWeeks, setExecutedWeeks] = useState<number[]>([]);
  const [selectedWeekDetail, setSelectedWeekDetail] = useState<number>(1);
  const [customExpenseAdjustment, setCustomExpenseAdjustment] = useState<number>(0);

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/income-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userContext: {
            fullName: user.fullName,
            hourlyRate: user.hourlyRate,
          },
          targetBaseline: user.baselineWeeklyIncome,
          currentBuffer,
          checkingBalance: currentChecking,
          recentWeeks: incomeWeeks.map(w => ({ week: w.week, earned: w.earned }))
        })
      });

      const data: IncomeForecastData = await response.json();
      setForecastData(data);
    } catch (err) {
      console.error('Failed to load income forecast:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [user.baselineWeeklyIncome, currentBuffer]);

  // Adjust forecast based on interactive slider
  const adjustedWeeks: ForecastWeekItem[] = (forecastData?.forecastWeeks || []).map((w, idx) => {
    const multiplier = inflowMultiplier / 100;
    const adjustedIncome = Math.round(w.predictedIncome * multiplier);
    const extraExpense = idx === 0 ? customExpenseAdjustment : 0;
    const adjustedExpenses = Math.round(w.predictedExpenses + extraExpense);
    const netCashFlow = adjustedIncome - adjustedExpenses;

    let recommendedAction: ForecastWeekItem['recommendedAction'] = 'BALANCED';
    let suggestedTransferAmount = 0;

    if (adjustedIncome > user.baselineWeeklyIncome) {
      recommendedAction = 'SWEEP_TO_BUFFER';
      suggestedTransferAmount = Math.max(0, Math.round(adjustedIncome - user.baselineWeeklyIncome));
    } else if (adjustedIncome < user.baselineWeeklyIncome || netCashFlow < 0) {
      recommendedAction = 'TOP_UP_FROM_BUFFER';
      suggestedTransferAmount = Math.max(50, Math.round(user.baselineWeeklyIncome - adjustedIncome));
    }

    return {
      ...w,
      predictedIncome: adjustedIncome,
      predictedExpenses: adjustedExpenses,
      netCashFlow,
      recommendedAction,
      suggestedTransferAmount
    };
  });

  const handleExecuteTransfer = (week: ForecastWeekItem) => {
    if (executedWeeks.includes(week.weekNumber)) return;

    if (week.recommendedAction === 'SWEEP_TO_BUFFER') {
      addTransaction({
        accountId: 'acc_primary_checking',
        accountName: 'Main Liquid Checking',
        amount: -week.suggestedTransferAmount,
        merchantName: `AI Forecast Buffer Sweep (${week.weekLabel})`,
        category: 'Buffer Sweep',
        date: new Date().toISOString(),
        aiTag: `Optimal Forecast: Swept $${week.suggestedTransferAmount} surplus to safety buffer`
      });
    } else if (week.recommendedAction === 'TOP_UP_FROM_BUFFER') {
      addTransaction({
        accountId: 'acc_primary_checking',
        accountName: 'Main Liquid Checking',
        amount: week.suggestedTransferAmount,
        merchantName: `AI Buffer Top-Up Injection (${week.weekLabel})`,
        category: 'Income',
        date: new Date().toISOString(),
        aiTag: `Optimal Forecast: Disbursed $${week.suggestedTransferAmount} top-up to preserve liquid checking`
      });
    }

    setExecutedWeeks(prev => [...prev, week.weekNumber]);
    triggerConfetti();
  };

  const chartData = adjustedWeeks.map(w => ({
    name: w.weekLabel.split(' ')[0] + ' ' + (w.weekLabel.split(' ')[1] || ''),
    fullLabel: w.weekLabel,
    Income: w.predictedIncome,
    Expenses: w.predictedExpenses,
    NetCashFlow: w.netCashFlow,
    Baseline: user.baselineWeeklyIncome,
    SuggestedTransfer: w.suggestedTransferAmount,
    Action: w.recommendedAction,
    Confidence: w.confidence
  }));

  const activeWeekObj = adjustedWeeks.find(w => w.weekNumber === selectedWeekDetail) || adjustedWeeks[0];

  const totalProjectedIncome = adjustedWeeks.reduce((sum, w) => sum + w.predictedIncome, 0);
  const totalProjectedExpenses = adjustedWeeks.reduce((sum, w) => sum + w.predictedExpenses, 0);
  const totalNet = totalProjectedIncome - totalProjectedExpenses;
  const netBufferDelta = adjustedWeeks.reduce((sum, w) => {
    if (w.recommendedAction === 'SWEEP_TO_BUFFER') return sum + w.suggestedTransferAmount;
    if (w.recommendedAction === 'TOP_UP_FROM_BUFFER') return sum - w.suggestedTransferAmount;
    return sum;
  }, 0);

  const projectedEndBuffer = currentBuffer + netBufferDelta;
  const projectedRunwayWeeks = Number((projectedEndBuffer / user.baselineWeeklyIncome).toFixed(1));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel-glow p-6 sm:p-7 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Cash Flow Projection Engine</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                Gemini 3.8 Flash
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              4-Week Income & Cash Flow Forecast
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Analyzes historical gig volatility, recurring bills, and client milestone cadences to predict cash flow trends and suggest mathematical buffer transfers.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchForecast}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>{isLoading ? 'Projecting Trends...' : 'Regenerate AI Forecast'}</span>
            </button>
          </div>
        </div>

        {/* AI Executive Summary Box */}
        {forecastData && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-300">Strategic Cash Flow Outlook:</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {forecastData.confidenceScore}% Confidence
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {forecastData.executiveSummary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Projected Inflow */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Projected 4-Wk Inflow</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {formatCurrency(totalProjectedIncome)}
          </div>
          <p className="text-[11px] text-slate-400">
            Avg {formatCurrency(totalProjectedIncome / 4)}/wk across active pipelines
          </p>
        </div>

        {/* Metric 2: Total Projected Outflow */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Projected 4-Wk Outflow</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-300 font-mono tracking-tight">
            {formatCurrency(totalProjectedExpenses)}
          </div>
          <p className="text-[11px] text-slate-400">
            Includes rent, subscriptions & variable spend
          </p>
        </div>

        {/* Metric 3: Net Cash Flow */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Projected Surplus</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-extrabold font-mono tracking-tight ${totalNet >= 0 ? 'text-cyan-300' : 'text-amber-400'}`}>
            {totalNet >= 0 ? `+${formatCurrency(totalNet)}` : formatCurrency(totalNet)}
          </div>
          <p className="text-[11px] text-slate-400">
            Net cash gain after all monthly obligations
          </p>
        </div>

        {/* Metric 4: Projected Buffer Runway */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1 relative">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Buffer Vault at End</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-purple-300 font-mono tracking-tight">
            {formatCurrency(projectedEndBuffer)}
          </div>
          <p className="text-[11px] text-slate-400">
            {projectedRunwayWeeks} weeks of baseline security runway
          </p>
        </div>
      </div>

      {/* Main Grid: Recharts Visualization + Interactive Cash Flow Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Recharts 4-Week Projection Graph */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Visual Trajectory
                </span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
                Weekly Cash Flow & Buffer Inflow/Outflow
              </h3>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span>Inflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                <span>Expenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" />
                <span>Target ($850)</span>
              </div>
            </div>
          </div>

          {/* Recharts Composed Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
                          <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>{data.fullLabel}</span>
                            <span className="text-[10px] font-mono text-emerald-400">{data.Confidence}% conf</span>
                          </div>
                          <div className="flex justify-between text-emerald-400">
                            <span>Predicted Inflow:</span>
                            <span className="font-mono font-bold">{formatCurrency(data.Income)}</span>
                          </div>
                          <div className="flex justify-between text-rose-400">
                            <span>Predicted Expenses:</span>
                            <span className="font-mono font-bold">{formatCurrency(data.Expenses)}</span>
                          </div>
                          <div className="flex justify-between text-cyan-300 font-semibold pt-1 border-t border-slate-800">
                            <span>Net Flow:</span>
                            <span className="font-mono">{data.NetCashFlow >= 0 ? `+${formatCurrency(data.NetCashFlow)}` : formatCurrency(data.NetCashFlow)}</span>
                          </div>
                          <div className="pt-1 text-[11px] text-amber-300 font-medium">
                            <span>Optimal Action: </span>
                            <span className="font-bold">{data.Action === 'SWEEP_TO_BUFFER' ? `Sweep $${data.SuggestedTransfer} to Buffer` : data.Action === 'TOP_UP_FROM_BUFFER' ? `Top-up $${data.SuggestedTransfer} from Buffer` : 'Hold Steady'}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  y={user.baselineWeeklyIncome} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: `Baseline: $${user.baselineWeeklyIncome}`, fill: '#f59e0b', fontSize: 10, position: 'right' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="Income" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#incomeGradient)" 
                />
                <Bar 
                  dataKey="Expenses" 
                  fill="#f43f5e" 
                  radius={[4, 4, 0, 0]} 
                  opacity={0.7} 
                  maxBarSize={32}
                />
                <Line 
                  type="monotone" 
                  dataKey="NetCashFlow" 
                  stroke="#06b6d4" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Week Selector Pills */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-400 font-medium shrink-0">Inspect Week:</span>
            {adjustedWeeks.map(w => {
              const isSelected = selectedWeekDetail === w.weekNumber;
              return (
                <button
                  key={w.weekNumber}
                  onClick={() => setSelectedWeekDetail(w.weekNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{w.weekLabel}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    w.recommendedAction === 'SWEEP_TO_BUFFER' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : w.recommendedAction === 'TOP_UP_FROM_BUFFER' 
                        ? 'bg-rose-500/20 text-rose-300' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {w.recommendedAction === 'SWEEP_TO_BUFFER' ? `+$${w.suggestedTransferAmount}` : w.recommendedAction === 'TOP_UP_FROM_BUFFER' ? `-$${w.suggestedTransferAmount}` : '$0'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Cash Flow Scenario Simulator Controls */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Scenario Simulator</h3>
            </div>
            <button
              onClick={() => {
                setInflowMultiplier(100);
                setCustomExpenseAdjustment(0);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline"
            >
              Reset
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Test how pipeline fluctuations or unexpected expenses alter optimal buffer allocations.
          </p>

          {/* Slider 1: Freelance Gig Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Gig Inflow Multiplier</span>
              <span className="font-mono font-bold text-emerald-400">{inflowMultiplier}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="150"
              step="5"
              value={inflowMultiplier}
              onChange={(e) => setInflowMultiplier(parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Lean Month (60%)</span>
              <span>Baseline (100%)</span>
              <span>Bullish (150%)</span>
            </div>
          </div>

          {/* Slider 2: Big One-Time Expense in Week 1 */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Add Shock Expense (Wk 1)</span>
              <span className="font-mono font-bold text-rose-400">+${customExpenseAdjustment}</span>
            </div>
            <input
              type="range"
              min="0"
              max="600"
              step="50"
              value={customExpenseAdjustment}
              onChange={(e) => setCustomExpenseAdjustment(parseInt(e.target.value))}
              className="w-full accent-rose-400 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$0 (None)</span>
              <span>$300 (Gear/Repair)</span>
              <span>$600 (Emergency)</span>
            </div>
          </div>

          {/* Dynamic Simulation Result Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Net Buffer Delta:</span>
              <span className={`font-bold font-mono ${netBufferDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netBufferDelta >= 0 ? `+${formatCurrency(netBufferDelta)}` : formatCurrency(netBufferDelta)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Ending Buffer Vault:</span>
              <span className="font-bold font-mono text-purple-300">{formatCurrency(projectedEndBuffer)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Safe Runway Horizon:</span>
              <span className="font-bold font-mono text-cyan-300">{projectedRunwayWeeks} weeks</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Week Optimal Transfer Schedule Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Optimal 4-Week Buffer Transfer Schedule</span>
            </h3>
            <p className="text-xs text-slate-400">
              AI-calculated exact transfer amounts to ensure checking never dips below your safety threshold.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adjustedWeeks.map((week) => {
            const isExecuted = executedWeeks.includes(week.weekNumber);
            const isSweep = week.recommendedAction === 'SWEEP_TO_BUFFER';
            const isTopUp = week.recommendedAction === 'TOP_UP_FROM_BUFFER';

            return (
              <motion.div
                key={week.weekNumber}
                whileHover={{ y: -2 }}
                className={`glass-panel p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                  isSweep
                    ? 'border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                    : isTopUp
                      ? 'border-rose-500/30 shadow-lg shadow-rose-950/20'
                      : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {week.weekLabel}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                      isSweep
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isTopUp
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {isSweep ? 'Surplus Sweep' : isTopUp ? 'Buffer Top-Up' : 'Hold Steady'}
                    </span>
                  </div>

                  {/* Transfer Amount Pill */}
                  <div className={`p-3 rounded-2xl border text-center ${
                    isSweep 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                      : isTopUp 
                        ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                      {isSweep ? 'Auto-Sweep into Buffer' : isTopUp ? 'Top-Up to Checking' : 'No Action Needed'}
                    </span>
                    <span className="text-2xl font-black font-mono tracking-tight block mt-0.5">
                      {week.suggestedTransferAmount > 0 ? formatCurrency(week.suggestedTransferAmount) : '$0.00'}
                    </span>
                  </div>

                  {/* Cash Flow Breakdown */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Predicted Inflow:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(week.predictedIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Predicted Outflow:</span>
                      <span className="font-mono text-rose-400 font-semibold">{formatCurrency(week.predictedExpenses)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1 font-semibold">
                      <span className="text-slate-300">Net Flow:</span>
                      <span className={`font-mono ${week.netCashFlow >= 0 ? 'text-cyan-300' : 'text-amber-400'}`}>
                        {week.netCashFlow >= 0 ? `+${formatCurrency(week.netCashFlow)}` : formatCurrency(week.netCashFlow)}
                      </span>
                    </div>
                  </div>

                  {/* AI Rationale */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 leading-snug">
                    <span className="font-bold text-slate-200">💡 AI Rationale: </span>
                    <span>{week.aiRationale}</span>
                  </div>

                  {/* Income Sources Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {week.incomeSources.map((src, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50">
                        {src}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Execute Action Button */}
                <div className="pt-4 mt-3 border-t border-slate-800/80">
                  {isExecuted ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Transfer Executed</span>
                    </div>
                  ) : week.suggestedTransferAmount > 0 ? (
                    <button
                      onClick={() => handleExecuteTransfer(week)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        isSweep
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400 shadow-purple-500/20'
                      }`}
                    >
                      <span>Execute {isSweep ? 'Safe Sweep' : 'Top-Up'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="w-full py-2 text-center text-slate-500 text-xs">
                      Balanced Runway
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Strategic Recommendations Strip */}
      {forecastData?.strategicRecommendations && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">AI Proactive Cash Flow Optimization Tips</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {forecastData.strategicRecommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">{rec.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/20">
                    {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {rec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

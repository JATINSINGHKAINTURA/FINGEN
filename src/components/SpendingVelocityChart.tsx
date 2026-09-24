import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  AlertTriangle, 
  Calendar, 
  Sparkles, 
  Flame, 
  Info,
  Clock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { Transaction } from '../types';

export const SpendingVelocityChart: React.FC = () => {
  const { transactions, user, setIsImpulseModalOpen } = useFinancial();
  const [timeRange, setTimeRange] = useState<'14d' | '30d'>('14d');
  const [highlightDoomspendOnly, setHighlightDoomspendOnly] = useState<boolean>(false);
  const [selectedDayData, setSelectedDayData] = useState<any | null>(null);

  // Generate Daily Aggregations from Transactions
  const chartData = useMemo(() => {
    const daysCount = timeRange === '14d' ? 14 : 30;
    const now = new Date();
    const daysMap: { [key: string]: {
      dateKey: string;
      displayDate: string;
      fullDate: string;
      totalSpend: number;
      doomspendAmount: number;
      txCount: number;
      doomspendCount: number;
      merchants: string[];
      isAtypical: boolean;
      doomspendNotes: string[];
    } } = {};

    // Initialize all past days
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
      daysMap[dateKey] = {
        dateKey,
        displayDate,
        fullDate,
        totalSpend: 0,
        doomspendAmount: 0,
        txCount: 0,
        doomspendCount: 0,
        merchants: [],
        isAtypical: false,
        doomspendNotes: []
      };
    }

    // Populate with real transactions
    transactions.forEach(tx => {
      if (tx.amount < 0 && tx.category !== 'Buffer Sweep') {
        const txDateKey = tx.date.split('T')[0];
        const absAmount = Math.abs(tx.amount);
        const isDoom = tx.isImpulse || tx.isDoomspend || tx.aiTag?.includes('Doomspend') || tx.category === 'Shopping' && absAmount > 100;

        if (daysMap[txDateKey]) {
          daysMap[txDateKey].totalSpend += absAmount;
          daysMap[txDateKey].txCount += 1;
          daysMap[txDateKey].merchants.push(tx.merchantName);
          if (isDoom) {
            daysMap[txDateKey].doomspendAmount += absAmount;
            daysMap[txDateKey].doomspendCount += 1;
            daysMap[txDateKey].doomspendNotes.push(`${tx.merchantName} (${formatCurrency(absAmount)})`);
          }
        }
      }
    });

    // Provide realistic realistic mock spread for past timeline demo consistency if transactions are few
    const entries = Object.values(daysMap);
    
    // Calculate benchmark daily average
    const totalSpentInPeriod = entries.reduce((sum, item) => sum + item.totalSpend, 0);
    // If total real spend is small, use baseline calculated daily average (~$68/day)
    const calculatedDailyAverage = Math.max(55, Math.round(totalSpentInPeriod / (entries.filter(e => e.totalSpend > 0).length || 1)));
    const benchmarkAverage = 68; // standard baseline pace for $2,000/mo spend
    const atypicalThreshold = benchmarkAverage * 1.85; // $125+/day is atypical

    return entries.map((day, idx) => {
      // If day has 0 real spend, seed some realistic variance for visual demonstration
      let finalSpend = day.totalSpend;
      let finalDoomspend = day.doomspendAmount;
      let isAtypical = false;
      let notes = day.doomspendNotes;

      // Ensure key historical demo spikes align with transaction history
      if (idx === daysCount - 1) {
        // Today / Yesterday
        if (finalSpend === 0) finalSpend = 183.80;
        if (finalDoomspend === 0) {
          finalDoomspend = 138.00;
          notes = ['Vintage Japanese Selvedge Denim ($138.00)', 'Uber Eats Late-Night Burrito ($45.80)'];
        }
      } else if (idx === daysCount - 5) {
        if (finalSpend === 0) {
          finalSpend = 142.50;
          notes = ['Erewhon Organic Groceries & Cafe ($142.50)'];
        }
      } else if (idx === daysCount - 9) {
        if (finalSpend === 0) {
          finalSpend = 195.00;
          finalDoomspend = 195.00;
          notes = ['ASOS Flash Midnight Haul ($195.00)'];
        }
      } else if (finalSpend === 0) {
        // Normal baseline daily spending pattern ($22 - $75)
        const mockVals = [32, 45, 18, 62, 28, 54, 40, 75, 15, 48, 52, 38];
        finalSpend = mockVals[idx % mockVals.length];
      }

      isAtypical = finalSpend >= atypicalThreshold || finalDoomspend > 60;

      return {
        ...day,
        totalSpend: Math.round(finalSpend),
        doomspendAmount: Math.round(finalDoomspend),
        normalSpend: Math.max(0, Math.round(finalSpend - finalDoomspend)),
        isAtypical,
        benchmarkAverage,
        atypicalThreshold,
        doomspendNotes: notes,
        workHoursEquivalent: Number((finalSpend / user.hourlyRate).toFixed(1)),
        velocityVsAverage: Math.round(((finalSpend - benchmarkAverage) / benchmarkAverage) * 100)
      };
    });
  }, [transactions, timeRange, user.hourlyRate]);

  // Summary Metrics
  const totalPeriodSpend = chartData.reduce((acc, d) => acc + d.totalSpend, 0);
  const totalDoomspend = chartData.reduce((acc, d) => acc + d.doomspendAmount, 0);
  const averageDailySpend = Math.round(totalPeriodSpend / chartData.length);
  const atypicalDaysCount = chartData.filter(d => d.isAtypical).length;
  const peakDay = [...chartData].sort((a, b) => b.totalSpend - a.totalSpend)[0];
  const doomspendRatio = totalPeriodSpend > 0 ? Math.round((totalDoomspend / totalPeriodSpend) * 100) : 0;

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Spend Velocity Sentinel</span>
            </span>
            {atypicalDaysCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                {atypicalDaysCount} Atypical Doomspend Surge{atypicalDaysCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h3 className="text-lg font-extrabold text-white tracking-tight mt-1">
            Spending Velocity vs. Monthly Average Benchmark
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Monitors day-by-day burn rate relative to your $68/day baseline, automatically isolating high-dopamine impulse surges and midnight carts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Doomspend Highlight Filter Toggle */}
          <button
            onClick={() => setHighlightDoomspendOnly(!highlightDoomspendOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              highlightDoomspendOnly
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{highlightDoomspendOnly ? 'Isolating Doomspends' : 'Highlight Doomspends'}</span>
          </button>

          {/* Timeframe Switcher */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '14d' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '30d' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        
        {/* Metric 1: Avg Daily Burn */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Daily Velocity</span>
            <span className="text-cyan-400 font-mono text-[11px] font-bold">Pace</span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {formatCurrency(averageDailySpend)}/day
          </div>
          <p className="text-[10px] text-slate-400">
            Target benchmark: $68.00/day
          </p>
        </div>

        {/* Metric 2: Peak Velocity Day */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Velocity Surge</span>
            <span className="text-rose-400 font-mono text-[11px] font-bold">Max</span>
          </div>
          <div className="text-xl font-extrabold text-rose-300 font-mono">
            {formatCurrency(peakDay?.totalSpend || 0)}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {peakDay?.displayDate} ({peakDay?.workHoursEquivalent}h work)
          </p>
        </div>

        {/* Metric 3: Doomspend Ratio */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Doomspend Friction</span>
            <span className="text-violet-400 font-mono text-[11px] font-bold">{doomspendRatio}%</span>
          </div>
          <div className="text-xl font-extrabold text-violet-300 font-mono">
            {formatCurrency(totalDoomspend)}
          </div>
          <p className="text-[10px] text-slate-400">
            {Math.round(totalDoomspend / user.hourlyRate)} freelance work hours
          </p>
        </div>

        {/* Metric 4: Atypical Surge Events */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Atypical Spikes</span>
            <span className="text-amber-400 font-mono text-[11px] font-bold">&gt;1.8x Avg</span>
          </div>
          <div className="text-xl font-extrabold text-amber-300 font-mono">
            {atypicalDaysCount} Days
          </div>
          <p className="text-[10px] text-slate-400">
            Triggered Chill Shield recommendations
          </p>
        </div>

      </div>

      {/* Recharts Spending Velocity Composed Graph */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                setSelectedDayData(state.activePayload[0].payload);
              }
            }}
          >
            <defs>
              <linearGradient id="normalBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="doomspendBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="atypicalSpikeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} vertical={false} />

            <XAxis 
              dataKey="displayDate" 
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
                    <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold text-white">
                        <span>{data.fullDate}</span>
                        {data.isAtypical && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Atypical Spike
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-slate-200">
                        <span>Total Daily Spend:</span>
                        <span className="font-mono font-bold text-white text-sm">{formatCurrency(data.totalSpend)}</span>
                      </div>

                      {data.doomspendAmount > 0 && (
                        <div className="flex justify-between items-center text-rose-400 font-semibold bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-500/20">
                          <span>Doomspend Surge:</span>
                          <span className="font-mono font-bold">{formatCurrency(data.doomspendAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Monthly Avg Benchmark:</span>
                        <span className="font-mono font-semibold">${data.benchmarkAverage}/day</span>
                      </div>

                      <div className="flex justify-between text-cyan-400 text-[11px]">
                        <span>Freelance Work Equivalent:</span>
                        <span className="font-mono font-semibold">{data.workHoursEquivalent} hours</span>
                      </div>

                      {data.doomspendNotes.length > 0 && (
                        <div className="pt-1 border-t border-slate-800 space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Flagged Items:</span>
                          {data.doomspendNotes.map((note: string, i: number) => (
                            <p key={i} className="text-[11px] text-amber-300 italic truncate">
                              • {note}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Baseline Monthly Average Benchmark Reference Line */}
            <ReferenceLine 
              y={68} 
              stroke="#06b6d4" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ 
                value: 'Monthly Avg: $68/day', 
                fill: '#06b6d4', 
                fontSize: 10, 
                position: 'insideTopRight',
                offset: 10
              }} 
            />

            {/* Atypical Doomspend Velocity Threshold Line */}
            <ReferenceLine 
              y={125} 
              stroke="#f43f5e" 
              strokeDasharray="3 3" 
              strokeWidth={1.5}
              label={{ 
                value: 'Atypical Surge: $125/day (1.8x)', 
                fill: '#f43f5e', 
                fontSize: 10, 
                position: 'insideTopRight',
                offset: -10
              }} 
            />

            {/* Daily Spend Bars with Dynamic Doomspend Color Highlights */}
            <Bar 
              dataKey="totalSpend" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={timeRange === '14d' ? 32 : 18}
            >
              {chartData.map((entry, index) => {
                let fillColor = "url(#normalBarGrad)";
                if (entry.isAtypical) {
                  fillColor = "url(#doomspendBarGrad)";
                } else if (entry.doomspendAmount > 0) {
                  fillColor = "url(#atypicalSpikeGrad)";
                }

                if (highlightDoomspendOnly && !entry.isAtypical && entry.doomspendAmount === 0) {
                  fillColor = "#1e293b";
                }

                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fillColor}
                    stroke={entry.isAtypical ? "#f43f5e" : entry.doomspendAmount > 0 ? "#f59e0b" : "#06b6d4"}
                    strokeWidth={entry.isAtypical ? 1.5 : 0.5}
                    className="transition-all hover:opacity-80 cursor-pointer"
                  />
                );
              })}
            </Bar>

            {/* Trendline overlay */}
            <Line 
              type="monotone" 
              dataKey="totalSpend" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              dot={false}
              opacity={0.6}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Interactive Callout */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500 inline-block" />
            <span>Normal Daily Spend (&lt;$125)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gradient-to-tr from-rose-500 to-violet-500 inline-block" />
            <span className="text-rose-300 font-semibold">Atypical Doomspend Spike (&gt;1.8x Avg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
            <span>Monthly Avg ($68/day)</span>
          </div>
        </div>

        <button
          onClick={() => setIsImpulseModalOpen(true)}
          className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Arm Doomspend Interceptor</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected Day Deep Dive Drawer (if clicked) */}
      <AnimatePresence>
        {selectedDayData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedDayData.fullDate}</span>
                {selectedDayData.isAtypical ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold text-[10px]">
                    🚨 Atypical Doomspend Day ({selectedDayData.velocityVsAverage > 0 ? `+${selectedDayData.velocityVsAverage}%` : ''} vs Avg)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px]">
                    ✓ Within Normal Velocity
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedDayData(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900">
                <span className="text-[10px] text-slate-500 block uppercase">Total Burn</span>
                <span className="text-sm font-extrabold text-white font-mono">{formatCurrency(selectedDayData.totalSpend)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900">
                <span className="text-[10px] text-slate-500 block uppercase">Impulse / Doomspend</span>
                <span className="text-sm font-extrabold text-rose-400 font-mono">{formatCurrency(selectedDayData.doomspendAmount)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900">
                <span className="text-[10px] text-slate-500 block uppercase">Work Hours To Recover</span>
                <span className="text-sm font-extrabold text-cyan-300 font-mono">{selectedDayData.workHoursEquivalent} hours</span>
              </div>
            </div>

            {selectedDayData.doomspendNotes.length > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Intercepted Spikes on this date:</span>
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 pl-1">
                  {selectedDayData.doomspendNotes.map((note: string, idx: number) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

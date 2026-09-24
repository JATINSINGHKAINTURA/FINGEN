import React, { useState, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  AlertTriangle,
  Sliders,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Info,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  hourlyRate: number;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, hourlyRate }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isExceeded = data.percentage >= 100;
    const isWarning = data.percentage >= 80 && !isExceeded;
    const workHours = (data.spent / hourlyRate).toFixed(1);

    return (
      <div className="glass-panel-glow p-3.5 rounded-2xl border border-slate-700 bg-slate-950/95 shadow-2xl space-y-2 text-xs min-w-[220px]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
          <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
            <span>{data.icon}</span>
            <span>{label}</span>
          </span>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isExceeded
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : isWarning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isExceeded ? '🚨 100%+ EXCEEDED' : isWarning ? '⚠️ 80%+ WARNING' : '✓ SAFE ZONE'}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span>Current Spent:</span>
            <span className="font-bold text-white">{formatCurrency(data.spent)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>80% Warning Limit:</span>
            <span className="text-amber-400 font-semibold">{formatCurrency(data.threshold80)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Monthly Budget:</span>
            <span className="text-slate-200">{formatCurrency(data.monthlyBudget)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Utilization:</span>
            <span className={`font-bold ${isExceeded ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.percentage}%
            </span>
          </div>
        </div>

        <div className="pt-1 text-[10px] text-slate-400 italic flex items-center justify-between">
          <span>Hustle Equiv:</span>
          <span className="text-slate-300 font-mono font-semibold">≈ {workHours}h freelance work</span>
        </div>
      </div>
    );
  }
  return null;
};

export const BudgetRechartsWidget: React.FC = () => {
  const {
    budgetAlerts,
    activeBudgetAlerts,
    user,
    setIsBudgetModalOpen,
    setIsImpulseModalOpen
  } = useFinancial();

  const [viewMode, setViewMode] = useState<'comparison' | 'radial'>('comparison');
  const [filterMode, setFilterMode] = useState<'all' | 'warning' | 'safe'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Prepare chart dataset
  const chartData = useMemo(() => {
    return budgetAlerts.map((b) => {
      const threshold80 = b.monthlyBudget * 0.8;
      const isExceeded = b.percentage >= 100;
      const isWarning = b.percentage >= 80 && !isExceeded;

      // Color assignment based on threshold status
      let barFill = '#10b981'; // emerald for safe
      if (isExceeded) barFill = '#f43f5e'; // rose-500 for >100%
      else if (isWarning) barFill = '#f59e0b'; // amber-500 for >80%

      const categoryIcons: Record<string, string> = {
        'Food & Drink': '🍔',
        'Shopping': '🛍️',
        'Entertainment': '🎮',
        'Bills & Rent': '🏠',
        'Subscriptions': '🔄'
      };

      return {
        name: b.category,
        shortName: b.category.split(' ')[0],
        spent: b.spent,
        monthlyBudget: b.monthlyBudget,
        threshold80: Number(threshold80.toFixed(2)),
        remaining: b.remaining,
        overAmount: b.overAmount,
        percentage: b.percentage,
        isWarning,
        isExceeded,
        barFill,
        icon: categoryIcons[b.category] || '💸'
      };
    });
  }, [budgetAlerts]);

  // Filtered dataset for charts
  const filteredData = useMemo(() => {
    if (filterMode === 'warning') {
      return chartData.filter(d => d.percentage >= 80);
    }
    if (filterMode === 'safe') {
      return chartData.filter(d => d.percentage < 80);
    }
    return chartData;
  }, [chartData, filterMode]);

  // Total aggregated statistics
  const totalSpent = budgetAlerts.reduce((sum, b) => sum + b.spent, 0);
  const totalBudget = budgetAlerts.reduce((sum, b) => sum + b.monthlyBudget, 0);
  const totalUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const warningCount = chartData.filter(d => d.percentage >= 80).length;

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-6">
      
      {/* Header with Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Recharts Analytics</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Live Category Monitor
            </span>
            {warningCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{warningCount} approaching/exceeding 80%</span>
              </span>
            )}
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight mt-1">
            Current Month Spending vs. Budget Limit
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            Visualizes real-time category utilization against your budget caps. Categories turning <strong className="text-amber-400">Amber (≥80%)</strong> or <strong className="text-rose-400">Red (≥100%)</strong> indicate high spend velocity.
          </p>
        </div>

        {/* View Switchers & Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Chart Mode Toggle */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('comparison')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'comparison'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bars & Limits</span>
            </button>
            <button
              onClick={() => setViewMode('radial')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'radial'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Share & Rings</span>
            </button>
          </div>

          {/* Settings / Budget Modal */}
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            title="Configure monthly limits"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Limits</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            Total Monthly Spend
          </span>
          <div className="text-base sm:text-lg font-extrabold text-white font-mono">
            {formatCurrency(totalSpent)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Cap: {formatCurrency(totalBudget)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            Overall Utilization
          </span>
          <div className={`text-base sm:text-lg font-extrabold font-mono ${
            totalUtilization >= 80 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {totalUtilization}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Target: &lt;80% safe pace
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            80% Warning Sentinel
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-base sm:text-lg font-extrabold font-mono ${
              warningCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {warningCount} / {budgetAlerts.length}
            </span>
            <span className="text-[10px] text-slate-400">Categories</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {warningCount > 0 ? 'Interventions active' : 'All categories clear'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            Work Hours Spent
          </span>
          <div className="text-base sm:text-lg font-extrabold text-violet-300 font-mono">
            {(totalSpent / (user.hourlyRate || 32)).toFixed(1)} hrs
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            @ ${user.hourlyRate}/hr rate
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({chartData.length})
          </button>
          <button
            onClick={() => setFilterMode('warning')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              filterMode === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>≥80% Warning Only ({warningCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('safe')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filterMode === 'safe'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Safe Zone &lt;80% ({chartData.length - warningCount})
          </button>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>&lt;80% (Safe)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
            <span>80-99% (Warning)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span>≥100% (Exceeded)</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Container */}
      <div className="h-72 w-full pt-2">
        {filteredData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-xs font-semibold">No categories match the active filter.</p>
            <button
              onClick={() => setFilterMode('all')}
              className="text-xs text-emerald-400 underline font-bold"
            >
              Reset to view all categories
            </button>
          </div>
        ) : viewMode === 'comparison' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `$${val}`}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <Tooltip
                content={<CustomBarTooltip hourlyRate={user.hourlyRate || 32} />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                formatter={(value) => <span className="text-slate-300 font-semibold">{value}</span>}
              />
              {/* Monthly Budget Reference bar */}
              <Bar
                dataKey="monthlyBudget"
                name="Budget Limit ($)"
                fill="#334155"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              {/* 80% Warning Limit Bar */}
              <Bar
                dataKey="threshold80"
                name="80% Warning Threshold ($)"
                fill="#f59e0b"
                fillOpacity={0.25}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              {/* Actual Spent Bar with Dynamic Warning Fill */}
              <Bar
                dataKey="spent"
                name="Current Spend ($)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.barFill}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Radial / Donut View */
          <div className="h-full flex flex-col md:flex-row items-center justify-around gap-4">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    dataKey="spent"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={entry.barFill}
                        stroke="#0f172a"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomBarTooltip hourlyRate={user.hourlyRate || 32} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Side breakdown list */}
            <div className="w-full md:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredData.map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.barFill }}></span>
                    <span className="font-bold text-white">{item.icon} {item.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-100">{formatCurrency(item.spent)}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.percentage}% of ${item.monthlyBudget}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Chips with Interactive Threshold Status */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {chartData.map((cat) => {
            const isWarning = cat.percentage >= 80;
            const isExceeded = cat.percentage >= 100;

            return (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.name ? null : cat.name);
                  if (isWarning) setIsBudgetModalOpen(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isExceeded
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    : isWarning
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
                title={`Click to inspect or adjust ${cat.name} limit`}
              >
                <span>{cat.icon}</span>
                <span>{cat.shortName}:</span>
                <span className="font-mono font-bold">{cat.percentage}%</span>
                {isWarning && <AlertTriangle className="w-3 h-3 text-amber-400" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsBudgetModalOpen(true)}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
        >
          <span>Adjust 80% Thresholds</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

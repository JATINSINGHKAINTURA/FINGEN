import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency, formatRelativeTime } from '../lib/utils';
import { BudgetAlertBanner } from './BudgetAlertBanner';
import { BudgetRechartsWidget } from './BudgetRechartsWidget';
import { SpendingVelocityChart } from './SpendingVelocityChart';
import { MilestonesWidget } from './MilestonesWidget';
import { 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle,
  Clock, 
  Wallet, 
  Users,
  ChevronRight,
  Sliders,
  DollarSign,
  PieChart,
  Bell,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface CommandCenterProps {
  setActiveTab: (tab: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24
    }
  }
};

const subItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  }
};

const buttonSpring = {
  whileHover: { scale: 1.03, y: -1 },
  whileTap: { scale: 0.96 },
  transition: { type: 'spring' as const, stiffness: 450, damping: 20 }
};

export const CommandCenter: React.FC<CommandCenterProps> = ({ setActiveTab }) => {
  const { 
    user, 
    accounts, 
    transactions, 
    chillLocks, 
    squadVaults, 
    subscriptions, 
    scorePillars,
    budgetAlerts,
    activeBudgetAlerts,
    isAutoCategorizing,
    autoCategorizeAllTransactions,
    setIsAddTxModalOpen,
    setIsImpulseModalOpen,
    setIsAgentDrawerOpen,
    setIsBudgetModalOpen,
    cancelChillLock,
    setHourlyRate,
    setBaselineIncome,
    triggerConfetti,
    activeThemeId,
    activeTheme,
    setThemeById,
    themes
  } = useFinancial();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempHourlyRate, setTempHourlyRate] = useState(user.hourlyRate.toString());
  const [tempBaseline, setTempBaseline] = useState(user.baselineWeeklyIncome.toString());
  const [isExporting, setIsExporting] = useState(false);

  const exportTransactionsToCSV = () => {
    if (!transactions || transactions.length === 0) return;
    setIsExporting(true);

    try {
      const headers = [
        'Transaction ID',
        'Date & Time',
        'Merchant / Description',
        'Category',
        'Type',
        'Amount ($)',
        'Account',
        'AI Category Tag',
        'AI Analysis Reasoning',
        'Work Hours Equivalent',
        'Impulse / Doomspend',
        'Recurring Subscription'
      ];

      const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      const rows = transactions.map(tx => {
        const isIncome = tx.amount > 0;
        const type = isIncome 
          ? 'Income / Inflow' 
          : tx.category === 'Buffer Sweep' 
          ? 'Buffer Sweep' 
          : tx.category === 'Buffer Top-up'
          ? 'Buffer Top-up'
          : 'Expense / Outflow';

        const formattedDate = new Date(tx.date).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        return [
          escapeCSV(tx.id),
          escapeCSV(formattedDate),
          escapeCSV(tx.merchantName),
          escapeCSV(tx.category),
          escapeCSV(type),
          escapeCSV(tx.amount.toFixed(2)),
          escapeCSV(tx.accountName || 'Main Checking'),
          escapeCSV(tx.aiTag || 'Uncategorized'),
          escapeCSV(tx.aiReasoning || ''),
          escapeCSV(tx.workHoursEquivalent ? `${tx.workHoursEquivalent} hrs` : 'N/A'),
          escapeCSV(tx.isImpulse ? 'YES (Doomspend Flagged)' : 'NO'),
          escapeCSV(tx.isRecurring ? 'YES (Reportable)' : 'NO')
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = `pulse_ai_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerConfetti();
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const checkingAcc = accounts.find(a => a.accountType === 'checking');
  const bufferAcc = accounts.find(a => a.accountType === 'buffer_vault');
  const chillAcc = accounts.find(a => a.accountType === 'chill_vault');
  const squadAcc = accounts.find(a => a.accountType === 'squad_vault');

  const totalLiquidNetWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeChillLock = chillLocks.find(l => l.status === 'LOCKED');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(tempHourlyRate);
    const parsedBase = parseFloat(tempBaseline);
    if (!isNaN(parsedRate) && parsedRate > 0) setHourlyRate(parsedRate);
    if (!isNaN(parsedBase) && parsedBase > 0) setBaselineIncome(parsedBase);
    setIsEditingProfile(false);
  };

  // Health Score Color & Grade
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'ELITE BUFFERED', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 65) return { label: 'HEALTHY PACE', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    if (score >= 50) return { label: 'MODERATE RUNWAY', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'VOLATILITY RISK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const scoreBadge = getScoreBadge(scorePillars.total);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      
      {/* Hero Welcome & Quick Settings Banner */}
      <motion.div 
        variants={cardVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 md:p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user.fullName}
              </h1>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${scoreBadge.color}`}>
                {scoreBadge.label}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Freelance Motion & Creator OS • Rate: <span className="font-semibold text-emerald-400 font-mono">${user.hourlyRate}/hr</span> • Baseline: <span className="font-semibold text-teal-400 font-mono">${user.baselineWeeklyIncome}/wk</span>
            </p>
          </div>

          {/* Quick Rate/Baseline Adjuster */}
          <div className="flex items-center gap-3">
            {!isEditingProfile ? (
              <motion.button
                {...buttonSpring}
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 hover:shadow-lg hover:shadow-emerald-500/10 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Adjust Rate & Baseline</span>
              </motion.button>
            ) : (
              <form onSubmit={handleSaveProfile} className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-emerald-500/40">
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">Rate $/hr:</span>
                  <input
                    type="number"
                    value={tempHourlyRate}
                    onChange={e => setTempHourlyRate(e.target.value)}
                    className="w-14 text-xs font-mono text-emerald-400 bg-transparent outline-none font-bold"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">Base $/wk:</span>
                  <input
                    type="number"
                    value={tempBaseline}
                    onChange={e => setTempBaseline(e.target.value)}
                    className="w-16 text-xs font-mono text-teal-400 bg-transparent outline-none font-bold"
                  />
                </div>
                <motion.button
                  {...buttonSpring}
                  type="submit"
                  className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400 shadow-md shadow-emerald-500/30"
                >
                  Save
                </motion.button>
                <motion.button
                  {...buttonSpring}
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </motion.button>
              </form>
            )}

            <motion.button
              {...buttonSpring}
              whileHover={{ scale: 1.04, y: -1 }}
              onClick={() => setIsAgentDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:shadow-violet-500/50 hover:brightness-110 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Pulse AI</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Live Budget Alert Threshold Banner (Triggers if any category exceeds 80%) */}
      <motion.div variants={cardVariants}>
        <BudgetAlertBanner setActiveTab={setActiveTab} />
      </motion.div>

      {/* Dynamic Theme Brand Customizer */}
      <motion.div
        variants={cardVariants}
        className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-primary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Bespoke Brand Palette Studio</span>
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              Pulse AI Bespoke Theme Space
            </h3>
            <p className="text-xs text-slate-400">
              Personalize your entire operating system style with CSS custom properties. Switch dynamically.
            </p>
          </div>

          {/* Palette selections */}
          <div className="flex flex-wrap items-center gap-2">
            {themes.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setThemeById(t.id);
                  triggerConfetti();
                }}
                className={`relative px-3 py-2 rounded-xl border transition-all flex items-center gap-2.5 ${
                  activeThemeId === t.id
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-white shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
                title={t.name}
              >
                <span 
                  className="w-3 h-3 rounded-full inline-block border border-black/35 shadow-sm"
                  style={{ backgroundColor: t.primaryColor }}
                />
                <span className="text-xs font-extrabold font-mono tracking-wide">
                  {t.name.replace('Bespoke ', '').replace('Classic ', '')}
                </span>
                {activeThemeId === t.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-ping absolute -top-0.5 -right-0.5" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4 Core Accounts / Sub-Vaults Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Checking Account */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="glass-panel p-5 rounded-3xl relative group hover:border-emerald-500/40 transition-all cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Checking (Liquid)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{checkingAcc?.mask}</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
            {formatCurrency(checkingAcc?.balance || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Smooth paycheck pace: ${user.baselineWeeklyIncome}/wk
          </p>
        </motion.div>

        {/* 2. Buffer Vault */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setActiveTab('smoother')}
          className="glass-panel p-5 rounded-3xl relative group hover:border-cyan-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Buffer Vault</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              Auto-Sweeping
            </span>
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono tracking-tight">
            {formatCurrency(bufferAcc?.balance || 0)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Runway cushion:</span>
            <span className="font-bold text-cyan-400 font-mono">
              {((bufferAcc?.balance || 0) / user.baselineWeeklyIncome).toFixed(1)} wks
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full"
              style={{ width: `${Math.min(100, ((bufferAcc?.balance || 0) / (user.baselineWeeklyIncome * 4)) * 100)}%` }}
            ></div>
          </div>
        </motion.div>

        {/* 3. 24h Chill Vault */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setActiveTab('impulse')}
          className="glass-panel p-5 rounded-3xl relative group hover:border-violet-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">24h Chill Vault</span>
            </div>
            {activeChillLock && (
              <span className="text-[10px] font-bold text-violet-400 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 animate-pulse">
                1 Active Lock
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-violet-300 font-mono tracking-tight">
            {formatCurrency(chillAcc?.balance || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-violet-400" />
            Impulse shield interceptor active
          </p>
        </motion.div>

        {/* 4. Squad Vaults */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setActiveTab('squad')}
          className="glass-panel p-5 rounded-3xl relative group hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300">Squad Vaults</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {squadVaults.length} vaults
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono tracking-tight">
            {formatCurrency(squadVaults.reduce((sum, v) => sum + v.currentAmount, 0))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Miami Villa + Apt 4B Fiber active
          </p>
        </motion.div>
      </div>

      {/* Main Grid: Pulse Health Score Gauge + Impulse Active Chill Interceptor Banner */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Pulse Health Score Breakdown */}
        <div className="lg:col-span-7 glass-panel-glow p-6 sm:p-7 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Live Telemetry
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Pulse Financial Health Score
              </h2>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                {scorePillars.total}
              </span>
              <span className="text-sm text-slate-400 font-mono">/100</span>
            </div>
          </div>

          {/* 4 Score Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Pillar 1: Buffer Health */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Buffer Health</span>
                <span className="font-bold text-cyan-400 font-mono">{scorePillars.bufferHealth}/25</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scorePillars.bufferHealth / 25) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {((bufferAcc?.balance || 0) / user.baselineWeeklyIncome).toFixed(1)} wks runway
              </p>
            </div>

            {/* Pillar 2: Savings Velocity */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Savings Pace</span>
                <span className="font-bold text-emerald-400 font-mono">{scorePillars.savingsVelocity}/25</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scorePillars.savingsVelocity / 25) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">22% avg savings rate</p>
            </div>

            {/* Pillar 3: Credit Elevator */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Credit Velocity</span>
                <span className="font-bold text-indigo-400 font-mono">{scorePillars.creditElevator}/25</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scorePillars.creditElevator / 25) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {subscriptions.filter(s => s.isReported).length} verified rails
              </p>
            </div>

            {/* Pillar 4: Impulse Discipline */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Impulse Shield</span>
                <span className="font-bold text-violet-400 font-mono">{scorePillars.impulseDiscipline}/25</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-violet-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(scorePillars.impulseDiscipline / 25) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {chillLocks.filter(l => l.status === 'SAVED_CANCELLED').length} intercepted spends
              </p>
            </div>

          </div>

          {/* Quick Action Matrix */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2.5">
            <motion.button
              {...buttonSpring}
              onClick={() => setActiveTab('forecast')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI 4-Wk Income Forecast</span>
            </motion.button>

            <motion.button
              {...buttonSpring}
              onClick={() => setIsImpulseModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 hover:shadow-lg hover:shadow-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              <span>Test Doomspend Interceptor</span>
            </motion.button>

            <motion.button
              {...buttonSpring}
              onClick={() => setActiveTab('smoother')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Simulate Income Smoothing</span>
            </motion.button>

            <motion.button
              {...buttonSpring}
              onClick={() => setActiveTab('credit')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Opt-in Credit Elevator (+42 pts)</span>
            </motion.button>

            <motion.button
              {...buttonSpring}
              onClick={() => setIsBudgetModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 hover:shadow-lg hover:shadow-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Manage 80% Budget Limits</span>
            </motion.button>
          </div>
        </div>

        {/* Right 5 Cols: Active Chill Vault Card or Chill Feature Spotlight */}
        <div className="lg:col-span-5 space-y-4">
          {activeChillLock ? (
            <div className="glass-panel-violet p-6 rounded-3xl space-y-4 relative overflow-hidden border border-violet-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-4 h-4 animate-bounce" />
                  <span>24h Chill Vault In Effect</span>
                </div>
                <span className="text-xs font-mono font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                  {activeChillLock.hoursEquivalent}h Work Equiv
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {activeChillLock.merchant}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-violet-300 font-mono">
                    {formatCurrency(activeChillLock.amount)}
                  </span>
                  <span className="text-xs text-slate-400">
                    ≈ {(activeChillLock.amount / user.hourlyRate).toFixed(1)} hrs of client work
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-violet-500/20 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-violet-300">💡 AI Impulse Intercept:</p>
                <p className="italic text-slate-300">{activeChillLock.aiVerdict}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <motion.button
                  {...buttonSpring}
                  whileHover={{ scale: 1.04, y: -1 }}
                  onClick={() => cancelChillLock(activeChillLock.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-110 transition-all"
                >
                  🎉 Cancel Spend (+5 Score)
                </motion.button>
                <motion.button
                  {...buttonSpring}
                  onClick={() => setActiveTab('impulse')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white transition-all"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Impulse Shield Ready</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">0 Active Locks</span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                No impulsive late-night carts frozen
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you encounter a late-night urge (10 PM – 4 AM) or high dopamine cart, run the Doomspend Interceptor. We convert the price to your freelance hours and freeze it for 24 hours.
              </p>
              <motion.button
                {...buttonSpring}
                onClick={() => setIsImpulseModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:shadow-lg hover:shadow-violet-500/20 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-violet-400" />
                <span>Simulate a $95 Online Cart Drop</span>
              </motion.button>
            </div>
          )}

          {/* Social Split Snapshot */}
          <div 
            onClick={() => setActiveTab('squad')}
            className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-amber-500/30 cursor-pointer transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Miami Basel Villa 🌴</h4>
                <p className="text-[11px] text-slate-400">
                  2 friends pending split ($550 owed to squad)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <span>Settle</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </motion.div>

      {/* Pulse Milestones & Badges Widget */}
      <motion.div variants={cardVariants}>
        <MilestonesWidget />
      </motion.div>

      {/* Recharts Monthly Spending vs Budget Limit Velocity Widget */}
      <motion.div variants={cardVariants}>
        <BudgetRechartsWidget />
      </motion.div>

      {/* Recharts Daily Spending Velocity & Atypical Doomspend Sentinel */}
      <motion.div variants={cardVariants}>
        <SpendingVelocityChart />
      </motion.div>

      {/* Monthly Category Budgets & 80% Threshold Guard Section */}
      <motion.div variants={cardVariants} className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>Budget Sentinel</span>
              </span>
              {activeBudgetAlerts.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  ⚠️ {activeBudgetAlerts.length} Category Alert{activeBudgetAlerts.length > 1 ? 's' : ''} Active (&gt;80%)
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-white tracking-tight mt-1">
              Monthly Category Budgets & 80% Thresholds
            </h3>
            <p className="text-xs text-slate-400">
              Live consumption tracking with automated warning interventions triggered when spending exceeds 80%.
            </p>
          </div>

          <motion.button
            {...buttonSpring}
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 hover:shadow-lg hover:shadow-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all self-start sm:self-auto shadow-md"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Customize Limits</span>
          </motion.button>
        </div>

        {/* Categories 5-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {budgetAlerts.map((b) => {
            const isWarning = b.isWarning;
            const isExceeded = b.isExceeded;

            return (
              <motion.div 
                key={b.category}
                variants={subItemVariants}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={() => setIsBudgetModalOpen(true)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isExceeded
                    ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/20'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">
                    {b.category === 'Food & Drink' ? '🍔' :
                     b.category === 'Shopping' ? '🛍️' :
                     b.category === 'Entertainment' ? '🎮' :
                     b.category === 'Bills & Rent' ? '🏠' : '🔄'}
                  </span>
                  {isExceeded ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      100%+ Over
                    </span>
                  ) : isWarning ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      ⚠️ 80%+ Alert
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                      {b.percentage}%
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white truncate">
                    {b.category}
                  </h4>
                  <div className="text-sm font-extrabold font-mono text-slate-100">
                    {formatCurrency(b.spent)} <span className="text-[10px] text-slate-400 font-normal">/ {formatCurrency(b.monthlyBudget)}</span>
                  </div>
                </div>

                {/* Progress bar with 80% line */}
                <div className="mt-2.5 space-y-1">
                  <div className="relative w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    {/* 80% threshold vertical marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10" 
                      style={{ left: '80%' }}
                      title="80% Alert Threshold"
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

                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>{b.percentage}%</span>
                    <span className={isExceeded ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {b.remaining > 0 ? `${formatCurrency(b.remaining)} left` : `${formatCurrency(b.overAmount)} over`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Real-Time Transaction Stream with AI Context Tags */}
      <motion.div variants={cardVariants} className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Live Smart Transaction Ledger</span>
              <span className="text-xs font-normal text-slate-400">({transactions.length} events)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Transactions tagged with AI context, work-hour conversions, and auto-buffer sweeps.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <motion.button
              {...buttonSpring}
              onClick={exportTransactionsToCSV}
              disabled={isExporting || transactions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 hover:shadow-md hover:shadow-emerald-500/10 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
              title="Export all transactions, AI tags, and work-hour metrics to CSV spreadsheet"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce text-emerald-400' : 'text-slate-400'}`} />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </motion.button>

            <motion.button
              {...buttonSpring}
              onClick={autoCategorizeAllTransactions}
              disabled={isAutoCategorizing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 hover:shadow-md hover:shadow-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold transition-all disabled:opacity-50"
              title="Automatically scan and classify all transactions with Gemini AI"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAutoCategorizing ? 'animate-spin text-violet-400' : 'text-violet-400'}`} />
              <span>{isAutoCategorizing ? 'Categorizing...' : 'AI Auto-Tag All'}</span>
            </motion.button>

            <motion.button
              {...buttonSpring}
              whileHover={{ scale: 1.05, y: -1 }}
              onClick={() => setIsAddTxModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 hover:shadow-md hover:shadow-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
            >
              <span>+ Add Tx</span>
            </motion.button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {transactions.map((tx) => {
            const isPositive = tx.amount > 0;
            const isSweep = tx.category === 'Buffer Sweep';
            const isTopUp = tx.category === 'Buffer Top-up';
            const isDoomspendTag = tx.aiTag?.includes('Doomspend') || tx.isImpulse;

            const getTagBadgeStyle = (tag?: string) => {
              if (!tag) return 'bg-slate-800 text-slate-400';
              if (tag.includes('Gig Earnings') || tag.includes('Feast') || tag.includes('Passive')) {
                return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
              }
              if (tag.includes('Subscription') || tag.includes('Recurring') || tag.includes('Credit Elevator')) {
                return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
              }
              if (tag.includes('Doomspend') || tag.includes('Alert') || tag.includes('Exceeded')) {
                return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
              }
              if (tag.includes('Buffer Sweep') || tag.includes('Reserve')) {
                return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
              }
              if (tag.includes('Fixed Obligation') || tag.includes('Rent')) {
                return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
              }
              return 'bg-slate-800 text-slate-300 border-slate-700';
            };

            return (
              <motion.div 
                key={tx.id} 
                variants={subItemVariants}
                className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-900/40 px-2 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
                    isPositive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : isSweep 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : isTopUp
                      ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      : isDoomspendTag
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isPositive ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {tx.merchantName}
                      </p>
                      {tx.aiTag && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono ${getTagBadgeStyle(tx.aiTag)}`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{tx.aiTag}</span>
                        </span>
                      )}
                      {tx.isImpulse && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold flex-shrink-0">
                          Impulse
                        </span>
                      )}
                      {tx.isRecurring && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex-shrink-0">
                          Recurring
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">{tx.category}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(tx.date)}</span>
                      {tx.aiReasoning && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span className="hidden md:inline text-slate-400 italic truncate max-w-sm">
                            {tx.aiReasoning}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-sm sm:text-base font-extrabold font-mono ${
                    isPositive 
                      ? 'text-emerald-400' 
                      : isSweep 
                      ? 'text-cyan-400'
                      : isTopUp
                      ? 'text-teal-400'
                      : 'text-slate-100'
                  }`}>
                    {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                  </div>
                  {tx.workHoursEquivalent && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      ≈ {tx.workHoursEquivalent}h work
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </motion.div>
  );
};


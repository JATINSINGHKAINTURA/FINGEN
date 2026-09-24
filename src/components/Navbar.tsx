import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/utils';
import { 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  PlusCircle, 
  Building2, 
  RotateCcw,
  Activity,
  Flame,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Sliders,
  Award
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    user, 
    accounts, 
    scorePillars, 
    activeBudgetAlerts,
    unlockedMilestonesCount,
    milestones,
    setIsAddTxModalOpen, 
    setIsImpulseModalOpen, 
    setIsPlaidModalOpen, 
    setIsAgentDrawerOpen,
    setIsBudgetModalOpen,
    setIsMilestoneModalOpen,
    resetToDefaultData
  } = useFinancial();

  const checkingAcc = accounts.find(a => a.accountType === 'checking');
  const bufferAcc = accounts.find(a => a.accountType === 'buffer_vault');
  const chillAcc = accounts.find(a => a.accountType === 'chill_vault');
  const squadAcc = accounts.find(a => a.accountType === 'squad_vault');

  const navItems = [
    { id: 'landing', label: 'Bespoke Luxe', icon: Sparkles, badge: 'Showcase' },
    { id: 'command', label: 'Command Center', icon: Activity },
    { id: 'forecast', label: 'Income Forecast', icon: Sparkles, badge: 'AI 4-Wk' },
    { id: 'smoother', label: 'Income Smoother', icon: TrendingUp },
    { id: 'impulse', label: 'Impulse Shield', icon: ShieldAlert, badge: 'Chill 24h' },
    { id: 'squad', label: 'Squad Vaults', icon: Zap, badge: 'Splits' },
    { id: 'credit', label: 'Credit Elevator', icon: CreditCard, badge: '+42 pts' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[var(--brand-background)]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('command')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] p-[1px] shadow-lg shadow-[var(--brand-primary)]/20 group-hover:shadow-[var(--brand-primary)]/30 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[var(--brand-primary)] group-hover:scale-110 transition-transform" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--brand-primary)]"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-[var(--brand-primary)] bg-clip-text text-transparent">
                    Pulse AI
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
                    Gen Z OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Financial OS for Gig Workers & Creators
                </p>
              </div>
            </button>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-[var(--brand-primary)] text-slate-950 shadow-md shadow-[var(--brand-primary)]/25 font-extrabold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive 
                        ? 'bg-slate-950/20 text-slate-950' 
                        : 'bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Health Score Pill */}
            <button
              onClick={() => setActiveTab('command')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-[var(--brand-primary)]/30 hover:border-[var(--brand-primary)]/50 transition-all group"
              title="Your composite Pulse Financial Health Score"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-primary)] group-hover:rotate-12 transition-transform" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none">
                  Pulse Score
                </span>
                <span className="text-xs font-bold text-[var(--brand-primary)] font-mono">
                  {scorePillars.total}/100
                </span>
              </div>
            </button>

            {/* Milestones & Badges Pill */}
            <button
              onClick={() => setIsMilestoneModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400/50 text-amber-300 text-xs font-bold transition-all group"
              title="View your earned badges and savings milestones"
            >
              <span className="text-sm">🏆</span>
              <span className="hidden sm:inline">Badges</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {unlockedMilestonesCount}/{milestones.length}
              </span>
            </button>

            {/* Budget Alert Indicator if active */}
            {activeBudgetAlerts.length > 0 && (
              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all animate-pulse"
                title={`${activeBudgetAlerts.length} budget categories exceeded the 80% threshold. Click to review.`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{activeBudgetAlerts.length} Budget Alert{activeBudgetAlerts.length > 1 ? 's' : ''} (&gt;80%)</span>
                <span className="sm:hidden">{activeBudgetAlerts.length} Alert</span>
              </button>
            )}

            {/* Plaid Connect */}
            <button
              onClick={() => setIsPlaidModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              title="Simulate Open Banking / Plaid bank linking"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sandbox Bank</span>
            </button>

            {/* Quick Add Tx */}
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              title="Log income or expense"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Tx</span>
            </button>

            {/* Ask AI Coach Button */}
            <button
              onClick={() => setIsAgentDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin text-violet-200" style={{ animationDuration: '6s' }} />
              <span>Pulse Agent</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo vaults, transactions and buffer balance to defaults?')) {
                  resetToDefaultData();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
              title="Reset sample data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center justify-between py-2 overflow-x-auto border-t border-slate-800/60 gap-1">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

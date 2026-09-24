import React, { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Navbar } from './components/Navbar';
import { PaytmLandingExperience } from './components/PaytmLandingExperience';
import { CommandCenter } from './components/CommandCenter';
import { IncomeSmoother } from './components/IncomeSmoother';
import { IncomeForecastTab } from './components/IncomeForecastTab';
import { ImpulseShield } from './components/ImpulseShield';
import { SquadVaults } from './components/SquadVaults';
import { CreditElevator } from './components/CreditElevator';
import { PulseAgentChat } from './components/PulseAgentChat';
import { BankConnectModal } from './components/BankConnectModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ImpulseModal } from './components/ImpulseModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { MilestonesModal } from './components/MilestonesModal';
import { Sparkles, ShieldAlert, TrendingUp, Zap, CreditCard } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const { setIsAgentDrawerOpen, isAgentDrawerOpen, scorePillars } = useFinancial();

  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#171211] text-[#ebe0de] selection:bg-[#f2ca50] selection:text-[#3c2f00] relative">
        <PaytmLandingExperience onLaunchApp={() => setActiveTab('command')} />

        {/* Floating Quick Switcher to Pulse App */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setActiveTab('command')}
            className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-[#efe0cd] via-[#f2ca50] to-[#d4af37] text-[#3c2f00] font-bold text-xs shadow-2xl shadow-[#f2ca50]/30 hover:scale-105 active:scale-95 transition-all border border-[#f2ca50]/50"
          >
            <Sparkles className="w-4 h-4 text-[#3c2f00] animate-spin" style={{ animationDuration: '8s' }} />
            <span>Open Pulse Applet OS →</span>
          </button>
        </div>

        {/* Modals & Agent Assistant still accessible */}
        <PulseAgentChat />
        <BankConnectModal />
        <AddTransactionModal />
        <ImpulseModal />
        <BudgetManagerModal />
        <MilestonesModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-background)] text-[var(--brand-text)] flex flex-col selection:bg-[var(--brand-primary)]/30 selection:text-[var(--brand-primary)]">
      
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {activeTab === 'command' && <CommandCenter setActiveTab={setActiveTab} />}
        {activeTab === 'forecast' && <IncomeForecastTab />}
        {activeTab === 'smoother' && <IncomeSmoother />}
        {activeTab === 'impulse' && <ImpulseShield />}
        {activeTab === 'squad' && <SquadVaults />}
        {activeTab === 'credit' && <CreditElevator />}
      </main>

      {/* Floating Pulse Agent AI Coach Button */}
      {!isAgentDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsAgentDrawerOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-bold text-xs shadow-2xl shadow-violet-600/50 hover:shadow-violet-600/70 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 animate-spin text-violet-200" style={{ animationDuration: '6s' }} />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="tracking-wide">Ask Pulse Coach</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              Score: {scorePillars.total}
            </span>
          </button>
        </div>
      )}

      {/* AI Assistant Side Drawer */}
      <PulseAgentChat />

      {/* Modals */}
      <BankConnectModal />
      <AddTransactionModal />
      <ImpulseModal />
      <BudgetManagerModal />
      <MilestonesModal />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-300">Pulse AI</span>
            <span>— Financial Operating System for Gen Z, Gig Workers & Creators</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <button onClick={() => setActiveTab('landing')} className="hover:text-emerald-400 underline transition-colors">
              View Paytm Luxe Showcase
            </button>
            <span>•</span>
            <span>Dynamic Buffering</span>
            <span>•</span>
            <span>Doomspend Interceptor</span>
            <span>•</span>
            <span>Alt-Credit Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <MainAppContent />
    </FinancialProvider>
  );
}

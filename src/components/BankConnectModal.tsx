import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { 
  Building2, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';

export const BankConnectModal: React.FC = () => {
  const { isPlaidModalOpen, setIsPlaidModalOpen, triggerConfetti } = useFinancial();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isPlaidModalOpen) return null;

  const banks = [
    { id: 'mercury', name: 'Mercury Cash', type: 'Tech & Freelance', logo: '⚡', color: 'from-blue-600 to-indigo-600' },
    { id: 'chase', name: 'Chase Bank', type: 'Traditional Checking', logo: '🏛️', color: 'from-blue-700 to-cyan-600' },
    { id: 'cashapp', name: 'Cash App / Cash Card', type: 'P2P & Direct Deposit', logo: '🟩', color: 'from-emerald-600 to-green-600' },
    { id: 'revolut', name: 'Revolut US', type: 'Multi-Currency', logo: '🌐', color: 'from-slate-700 to-slate-900' },
    { id: 'stripe', name: 'Stripe Payouts Balance', type: 'Creator Invoicing', logo: '💳', color: 'from-violet-600 to-purple-600' }
  ];

  const handleConnect = (bankId: string) => {
    setSelectedBank(bankId);
    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);
      setIsSuccess(true);
      triggerConfetti();

      setTimeout(() => {
        setIsSuccess(false);
        setSelectedBank(null);
        setIsPlaidModalOpen(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-glow w-full max-w-md p-6 rounded-3xl border border-cyan-500/40 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Plaid & Open Banking Sandbox</span>
          </div>
          <button
            onClick={() => setIsPlaidModalOpen(false)}
            className="text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-white">
            Link Your Freelance / Creator Bank
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Simulate 256-bit encrypted bank connection via Plaid API Sandbox.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-white">
              Bank Connected Successfully!
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              Live transaction webhooks & buffer auto-sweeping enabled.
            </p>
          </div>
        ) : isConnecting ? (
          <div className="py-10 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-mono">
              Authenticating OAuth & Token Exchange...
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleConnect(bank.id)}
                className="w-full p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bank.logo}</span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block group-hover:text-cyan-300 transition-colors">
                      {bank.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {bank.type}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-cyan-400 transition-colors font-mono">
                  Connect →
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>Simulated sandbox mode • End-to-end tokenized</span>
        </div>

      </div>
    </div>
  );
};

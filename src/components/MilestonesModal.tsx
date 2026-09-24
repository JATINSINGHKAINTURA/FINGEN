import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  PiggyBank,
  Check
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { MilestoneCategory, PulseMilestone } from '../types';

export const MilestonesModal: React.FC = () => {
  const { 
    isMilestoneModalOpen, 
    setIsMilestoneModalOpen, 
    milestones, 
    unlockedMilestonesCount,
    claimMilestoneReward 
  } = useFinancial();

  const [activeCategory, setActiveCategory] = useState<MilestoneCategory | 'all'>('all');

  if (!isMilestoneModalOpen) return null;

  const categories: { id: MilestoneCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Badges', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'budget', label: 'Budget', icon: <PiggyBank className="w-3.5 h-3.5" /> },
    { id: 'discipline', label: 'Discipline', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'savings', label: 'Savings', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'credit', label: 'Credit', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'squad', label: 'Squad', icon: <Users className="w-3.5 h-3.5" /> }
  ];

  const filteredMilestones = activeCategory === 'all' 
    ? milestones 
    : milestones.filter(m => m.category === activeCategory);

  const getRarityBadge = (rarity: PulseMilestone['rarity']) => {
    switch (rarity) {
      case 'Legendary':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">LEGENDARY</span>;
      case 'Epic':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">EPIC</span>;
      case 'Rare':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">RARE</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">COMMON</span>;
    }
  };

  const totalRewardsClaimable = milestones.filter(m => m.isUnlocked && !m.rewardClaimed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/30 to-purple-500/30 border border-amber-500/40 flex items-center justify-center text-xl shadow-lg shadow-amber-500/10">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Pulse Milestones & Badges</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {unlockedMilestonesCount} / {milestones.length} Unlocked
                </span>
                {totalRewardsClaimable > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {totalRewardsClaimable} Claimable
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn badges for disciplined budgeting, saving streaks, buffer safety, and doomspend resistance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMilestoneModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Pills */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = cat.id === 'all' 
              ? milestones.length 
              : milestones.filter(m => m.category === cat.id).length;
            const unlockedInCat = cat.id === 'all'
              ? unlockedMilestonesCount
              : milestones.filter(m => m.category === cat.id && m.isUnlocked).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'}`}>
                  {unlockedInCat}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredMilestones.map((m) => {
                const isUnlocked = m.isUnlocked;
                const isClaimed = m.rewardClaimed;

                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`relative rounded-xl p-4 border transition-all duration-200 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-slate-900/90 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                        : 'bg-slate-800/30 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Badge Icon / Lock Indicator */}
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl relative shrink-0 border ${
                        isUnlocked
                          ? 'bg-slate-950/80 border-emerald-400/30 shadow-inner'
                          : 'bg-slate-900/50 border-slate-700/40 grayscale'
                      }`}>
                        {m.badgeEmoji}
                        {isUnlocked ? (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-slate-400">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-sm tracking-tight truncate ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                              {m.title}
                            </h3>
                            {getRarityBadge(m.rarity)}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {m.description}
                        </p>

                        {/* Progress Bar & Current Metric */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                            <span className="flex items-center gap-1 font-mono">
                              {m.currentValue} / {m.targetValue} {m.unit}
                            </span>
                            <span className={`font-bold ${isUnlocked ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {m.progressPercentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isUnlocked 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                  : 'bg-gradient-to-r from-indigo-500 to-cyan-500'
                              }`}
                              style={{ width: `${m.progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Reward Action / Unlocked Tag */}
                        <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>+{m.pulseScoreReward} Pulse Score</span>
                          </div>

                          {isUnlocked ? (
                            isClaimed ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                              </span>
                            ) : (
                              <button
                                onClick={() => claimMilestoneReward(m.id)}
                                className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all flex items-center gap-1"
                              >
                                <Sparkles className="w-3.5 h-3.5" /> Claim Reward
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> In Progress
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Milestones dynamically update as you log gig sweeps, avoid doomspending, and stick to budgets.</span>
          </div>
          <button
            onClick={() => setIsMilestoneModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

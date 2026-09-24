import React from 'react';
import { motion } from 'motion/react';
import { Award, Sparkles, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const MilestonesWidget: React.FC = () => {
  const { 
    milestones, 
    unlockedMilestonesCount, 
    setIsMilestoneModalOpen, 
    claimMilestoneReward 
  } = useFinancial();

  // Show top featured milestones (e.g., unlocked first or highest progress)
  const featuredMilestones = [...milestones].sort((a, b) => {
    if (a.isUnlocked && !a.rewardClaimed) return -1;
    if (b.isUnlocked && !b.rewardClaimed) return 1;
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
    return b.progressPercentage - a.progressPercentage;
  }).slice(0, 4);

  const claimableCount = milestones.filter(m => m.isUnlocked && !m.rewardClaimed).length;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-lg shadow-sm">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight">Pulse Milestones</h3>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {unlockedMilestonesCount} / {milestones.length} Earned
              </span>
              {claimableCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> {claimableCount} Claimable
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Unlock badges and boost your Pulse Score by hitting savings and budget goals
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMilestoneModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center gap-1 group"
        >
          <span>All Badges</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of 4 Key Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {featuredMilestones.map((m) => {
          const isUnlocked = m.isUnlocked;
          const isClaimed = m.rewardClaimed;

          return (
            <motion.div
              key={m.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                if (isUnlocked && !isClaimed) {
                  claimMilestoneReward(m.id);
                } else {
                  setIsMilestoneModalOpen(true);
                }
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isUnlocked
                  ? 'bg-slate-800/70 hover:bg-slate-800 border-emerald-500/30 shadow-md shadow-emerald-950/10'
                  : 'bg-slate-900/40 hover:bg-slate-800/40 border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl shrink-0 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    {m.badgeEmoji}
                  </span>
                  <div>
                    <h4 className={`font-semibold text-xs truncate max-w-[130px] ${isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                      {m.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {m.category}
                    </span>
                  </div>
                </div>

                {isUnlocked ? (
                  isClaimed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  ) : (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold rounded-md flex items-center gap-0.5 animate-pulse shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> +{m.pulseScoreReward}
                    </span>
                  )
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-1" />
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                  <span>{m.currentValue}/{m.targetValue} {m.unit}</span>
                  <span className={isUnlocked ? 'text-emerald-400 font-bold' : ''}>
                    {m.progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked 
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-300' 
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${m.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Hint */}
              <div className="mt-2 text-[10px] flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800/60">
                <span className="text-amber-400/90 font-medium">+{m.pulseScoreReward} pts</span>
                {isUnlocked && !isClaimed ? (
                  <span className="text-amber-300 font-bold underline">Click to Claim</span>
                ) : (
                  <span className="text-slate-500 text-[9px]">{isUnlocked ? 'Unlocked' : 'In Progress'}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

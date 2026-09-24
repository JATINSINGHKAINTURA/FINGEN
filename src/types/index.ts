export type AccountType = 'checking' | 'buffer_vault' | 'chill_vault' | 'squad_vault';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  hourlyRate: number; // e.g. $28.00 / hr
  baselineWeeklyIncome: number; // e.g. $850.00 / wk
  pulseHealthScore: number; // 0 - 100
  createdAt: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountType: AccountType;
  balance: number;
  targetAmount?: number;
  mask: string;
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  accountName?: string;
  amount: number; // positive for income, negative for expense
  merchantName: string;
  category: 'Income' | 'Gig Payout' | 'Food & Drink' | 'Shopping' | 'Entertainment' | 'Bills & Rent' | 'Subscriptions' | 'Buffer Sweep' | 'Buffer Top-up';
  date: string;
  isImpulse?: boolean;
  isRecurring?: boolean;
  aiTag?: string; // e.g. 'Gig Earnings', 'Subscription', 'Doomspend', 'Fixed Obligation', 'Buffer Sweep', 'Daily Essential'
  aiConfidence?: number;
  aiReasoning?: string;
  isDoomspend?: boolean;
  workHoursEquivalent?: number;
}

export type TransactionAiTag = 'Gig Earnings' | 'Subscription' | 'Doomspend' | 'Fixed Obligation' | 'Buffer Sweep' | 'Social Split' | 'Daily Essential' | 'Impulse Risk';

export interface TransactionCategorizationResult {
  category: Transaction['category'];
  aiTag: TransactionAiTag | string;
  isDoomspend: boolean;
  isRecurring: boolean;
  confidenceScore: number;
  reasoning: string;
  suggestedAction?: string;
}

export interface ChillLock {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  hoursEquivalent: number;
  category: string;
  lockedAt: string;
  unlocksAt: string;
  status: 'LOCKED' | 'SAVED_CANCELLED' | 'RELEASED_PURCHASED';
  aiVerdict?: string;
  psychologicalTrigger?: string;
}

export interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  sharePercentage: number;
  amountPaid: number;
  amountOwed: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface SquadVault {
  id: string;
  title: string;
  emoji: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: 'Trip' | 'Apartment' | 'Dinner & Party' | 'Project' | 'Festival';
  members: SquadMember[];
  recentSplits: {
    id: string;
    title: string;
    totalAmount: number;
    paidBy: string;
    date: string;
  }[];
  createdAt: string;
}

export interface ReportableSubscription {
  id: string;
  name: string;
  category: 'Rent' | 'Streaming' | 'Utility' | 'Fitness' | 'BNPL';
  monthlyAmount: number;
  consecutiveOnTimeMonths: number;
  isReported: boolean;
  bureauSync: {
    experian: boolean;
    transunion: boolean;
    equifax: boolean;
  };
  impactScore: number; // e.g. +8 pts
  logoUrl?: string;
}

export interface IncomeWeekData {
  week: string;
  earned: number;
  baseline: number;
  sweepAmount: number; // positive if swept to buffer, negative if topped-up from buffer
  bufferResultBalance: number;
  status: 'surplus' | 'deficit' | 'balanced';
}

export interface PulseScorePillars {
  bufferHealth: number; // 0 - 25
  savingsVelocity: number; // 0 - 25
  creditElevator: number; // 0 - 25
  impulseDiscipline: number; // 0 - 25
  total: number; // 0 - 100
}

export type ExpenseCategory = 'Food & Drink' | 'Shopping' | 'Entertainment' | 'Bills & Rent' | 'Subscriptions';

export interface CategoryBudget {
  category: ExpenseCategory;
  monthlyBudget: number;
  icon?: string;
  color?: string;
}

export interface BudgetAlertStatus {
  category: ExpenseCategory;
  spent: number;
  monthlyBudget: number;
  percentage: number; // e.g. 84.5%
  isWarning: boolean; // >= 80% && < 100%
  isExceeded: boolean; // >= 100%
  threshold: number; // 80
  remaining: number;
  overAmount: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  suggestedActions?: { label: string; actionKey: string }[];
}

export type MilestoneCategory = 'budget' | 'discipline' | 'savings' | 'credit' | 'squad';
export type MilestoneRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface PulseMilestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  badgeEmoji: string;
  rarity: MilestoneRarity;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPercentage: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  pulseScoreReward: number;
  rewardClaimed?: boolean;
}

export type ForecastAction = 'SWEEP_TO_BUFFER' | 'TOP_UP_FROM_BUFFER' | 'BALANCED';

export interface ForecastWeekItem {
  weekNumber: number;
  weekLabel: string;
  predictedIncome: number;
  predictedExpenses: number;
  netCashFlow: number;
  recommendedAction: ForecastAction;
  suggestedTransferAmount: number;
  projectedCheckingBalance: number;
  projectedBufferBalance: number;
  confidence: number;
  aiRationale: string;
  incomeSources: string[];
}

export interface ForecastRecommendation {
  title: string;
  desc: string;
  impact: string;
  icon?: string;
}

export interface IncomeForecastData {
  executiveSummary: string;
  projectedTotalIncome: number;
  projectedTotalExpenses: number;
  projectedNetCashFlow: number;
  projectedEndBufferBalance: number;
  projectedRunwayWeeks: number;
  confidenceScore: number;
  forecastWeeks: ForecastWeekItem[];
  strategicRecommendations: ForecastRecommendation[];
}

export interface BrandTheme {
  id: string;
  name: string;
  primaryColor: string;
  primaryRgb: string;
  secondaryColor: string;
  secondaryRgb: string;
  backgroundColor: string;
  backgroundRgb: string;
  surfaceColor: string;
  surfaceRgb: string;
  textColor: string;
  accentColor: string;
  accentRgb: string;
}



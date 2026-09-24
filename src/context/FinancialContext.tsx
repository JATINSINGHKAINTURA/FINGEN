import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  BankAccount,
  Transaction,
  ChillLock,
  SquadVault,
  ReportableSubscription,
  IncomeWeekData,
  PulseScorePillars,
  CategoryBudget,
  BudgetAlertStatus,
  ExpenseCategory,
  PulseMilestone,
  ChatMessage,
  TransactionCategorizationResult,
  BrandTheme
} from '../types';

interface FinancialContextType {
  user: UserProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  chillLocks: ChillLock[];
  squadVaults: SquadVault[];
  subscriptions: ReportableSubscription[];
  incomeWeeks: IncomeWeekData[];
  scorePillars: PulseScorePillars;
  categoryBudgets: CategoryBudget[];
  budgetAlerts: BudgetAlertStatus[];
  activeBudgetAlerts: BudgetAlertStatus[];
  dismissedAlerts: string[];
  milestones: PulseMilestone[];
  unlockedMilestonesCount: number;
  claimedMilestoneIds: string[];
  claimMilestoneReward: (milestoneId: string) => void;
  activeMilestoneToast: PulseMilestone | null;
  dismissMilestoneToast: () => void;
  chatMessages: ChatMessage[];
  isAutoCategorizing: boolean;
  categorizeTransactionWithAI: (merchantName: string, amount: number, date?: string) => Promise<TransactionCategorizationResult>;
  autoCategorizeAllTransactions: () => Promise<void>;
  isPlaidModalOpen: boolean;
  isAddTxModalOpen: boolean;
  isImpulseModalOpen: boolean;
  isAgentDrawerOpen: boolean;
  isBudgetModalOpen: boolean;
  isMilestoneModalOpen: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeThemeId: string;
  activeTheme: BrandTheme;
  setThemeById: (themeId: string) => void;
  themes: BrandTheme[];
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  setBaselineIncome: (amount: number) => void;
  setHourlyRate: (rate: number) => void;
  setCategoryBudget: (category: ExpenseCategory, monthlyBudget: number) => void;
  dismissBudgetAlert: (category: ExpenseCategory) => void;
  resetBudgetAlerts: () => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId'>) => void;
  lockInChillVault: (item: { merchant: string; amount: number; category: string; trigger?: string; verdict?: string }) => void;
  cancelChillLock: (id: string) => void;
  releaseChillLock: (id: string) => void;
  createSquadVault: (vault: Omit<SquadVault, 'id' | 'createdAt' | 'currentAmount'>) => void;
  contributeToSquadVault: (vaultId: string, amount: number) => void;
  toggleSubscriptionReporting: (subId: string) => void;
  toggleAllSubscriptions: (report: boolean) => void;
  simulateIncomeWeek: (earnedAmount: number) => void;
  sendChatMessage: (content: string) => Promise<void>;
  setIsPlaidModalOpen: (open: boolean) => void;
  setIsAddTxModalOpen: (open: boolean) => void;
  setIsImpulseModalOpen: (open: boolean) => void;
  setIsAgentDrawerOpen: (open: boolean) => void;
  setIsBudgetModalOpen: (open: boolean) => void;
  setIsMilestoneModalOpen: (open: boolean) => void;
  triggerConfetti: () => void;
  resetToDefaultData: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const BRAND_THEMES: BrandTheme[] = [
  {
    id: 'luxe_gold',
    name: 'Bespoke Luxe Gold',
    primaryColor: '#f2ca50',
    primaryRgb: '242, 202, 80',
    secondaryColor: '#efe0cd',
    secondaryRgb: '239, 224, 205',
    backgroundColor: '#171211',
    backgroundRgb: '23, 18, 17',
    surfaceColor: '#201a19',
    surfaceRgb: '32, 26, 25',
    textColor: '#ebe0de',
    accentColor: '#713035',
    accentRgb: '113, 48, 53'
  },
  {
    id: 'paytm_blue',
    name: 'Classic Paytm Blue',
    primaryColor: '#00b9f5',
    primaryRgb: '0, 185, 245',
    secondaryColor: '#e6f7ff',
    secondaryRgb: '230, 247, 255',
    backgroundColor: '#041029',
    backgroundRgb: '4, 16, 41',
    surfaceColor: '#071b40',
    surfaceRgb: '7, 27, 64',
    textColor: '#e6f0fa',
    accentColor: '#002e6e',
    accentRgb: '0, 46, 110'
  },
  {
    id: 'pulse_violet',
    name: 'Cyberpunk Violet',
    primaryColor: '#8b5cf6',
    primaryRgb: '139, 92, 246',
    secondaryColor: '#e2e8f0',
    secondaryRgb: '226, 232, 240',
    backgroundColor: '#0b0f17',
    backgroundRgb: '11, 15, 23',
    surfaceColor: '#161d2a',
    surfaceRgb: '22, 29, 42',
    textColor: '#f1f5f9',
    accentColor: '#ec4899',
    accentRgb: '236, 72, 153'
  },
  {
    id: 'emerald_forest',
    name: 'Emerald Forest',
    primaryColor: '#10b981',
    primaryRgb: '16, 185, 129',
    secondaryColor: '#d1fae5',
    secondaryRgb: '209, 250, 229',
    backgroundColor: '#041c15',
    backgroundRgb: '4, 28, 21',
    surfaceColor: '#0b2b21',
    surfaceRgb: '11, 43, 33',
    textColor: '#e6f7f2',
    accentColor: '#047857',
    accentRgb: '4, 120, 87'
  },
  {
    id: 'rose_velvet',
    name: 'Rose Velvet',
    primaryColor: '#f43f5e',
    primaryRgb: '244, 63, 94',
    secondaryColor: '#ffe4e6',
    secondaryRgb: '255, 228, 230',
    backgroundColor: '#1c0d12',
    backgroundRgb: '28, 13, 18',
    surfaceColor: '#2d141b',
    surfaceRgb: '45, 20, 27',
    textColor: '#fbeef2',
    accentColor: '#be123c',
    accentRgb: '190, 18, 60'
  }
];

const INITIAL_CATEGORY_BUDGETS: CategoryBudget[] = [
  { category: 'Food & Drink', monthlyBudget: 220, icon: '🍔', color: '#f59e0b' },
  { category: 'Shopping', monthlyBudget: 160, icon: '🛍️', color: '#8b5cf6' },
  { category: 'Entertainment', monthlyBudget: 120, icon: '🎮', color: '#ec4899' },
  { category: 'Bills & Rent', monthlyBudget: 1350, icon: '🏠', color: '#06b6d4' },
  { category: 'Subscriptions', monthlyBudget: 90, icon: '🔄', color: '#3b82f6' }
];

const INITIAL_USER: UserProfile = {
  id: 'usr_genz_alex',
  email: 'alex.creator@pulse.ai',
  fullName: 'Alex Rivera',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  hourlyRate: 32.0,
  baselineWeeklyIncome: 850.0,
  pulseHealthScore: 79,
  createdAt: '2026-01-15T08:00:00Z',
};

const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc_primary_checking',
    name: 'Main Liquid Checking',
    bankName: 'Mercury Cash',
    accountType: 'checking',
    balance: 1485.50,
    mask: '•• 4821',
    color: 'from-emerald-500/20 to-teal-500/10'
  },
  {
    id: 'acc_buffer_vault',
    name: 'Smart Buffer Vault',
    bankName: 'Pulse AI Reserve',
    accountType: 'buffer_vault',
    balance: 2450.00,
    targetAmount: 3400.00, // 4 weeks of baseline $850
    mask: '•• 9023',
    color: 'from-cyan-500/20 to-blue-500/10'
  },
  {
    id: 'acc_chill_vault',
    name: '24h Chill Vault (Frozen)',
    bankName: 'Pulse Impulse Shield',
    accountType: 'chill_vault',
    balance: 145.00,
    mask: '•• 1104',
    color: 'from-violet-500/20 to-fuchsia-500/10'
  },
  {
    id: 'acc_squad_vaults',
    name: 'Squad Shared Vaults',
    bankName: 'Pulse Multi-Owner',
    accountType: 'squad_vault',
    balance: 1120.00,
    mask: '•• 7734',
    color: 'from-amber-500/20 to-orange-500/10'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: 1250.00,
    merchantName: 'Upwork Global Client Payout',
    category: 'Gig Payout',
    date: '2026-09-23T14:30:00Z',
    aiTag: 'Feast Week Income (+$400 swept to Buffer)'
  },
  {
    id: 'tx_2',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: -400.00,
    merchantName: 'Auto-Buffer Safe Sweep',
    category: 'Buffer Sweep',
    date: '2026-09-23T14:31:00Z',
    aiTag: 'Automated 1099 & Emergency Reserve'
  },
  {
    id: 'tx_shopping_1',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: -138.00,
    merchantName: 'Vintage Japanese Selvedge Denim',
    category: 'Shopping',
    date: '2026-09-23T20:15:00Z',
    isImpulse: true,
    aiTag: '⚠️ 86.3% of $160 Shopping Budget Reached (80% Alert Triggered)',
    workHoursEquivalent: 4.3
  },
  {
    id: 'tx_food_1',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: -142.50,
    merchantName: 'Erewhon Organic Groceries & Cafe',
    category: 'Food & Drink',
    date: '2026-09-23T12:00:00Z',
    aiTag: 'Weekly Grocery Haul'
  },
  {
    id: 'tx_3',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: -45.80,
    merchantName: 'Uber Eats Late-Night Burrito & Boba',
    category: 'Food & Drink',
    date: '2026-09-23T23:45:00Z',
    isImpulse: true,
    aiTag: '⚠️ 85.6% of $220 Food Budget Reached (80% Alert Triggered)',
    workHoursEquivalent: 1.4
  },
  {
    id: 'tx_4',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: -11.99,
    merchantName: 'Spotify Premium',
    category: 'Subscriptions',
    date: '2026-09-22T08:00:00Z',
    isRecurring: true,
    aiTag: 'Credit Elevator Verified • +6 pts'
  },
  {
    id: 'tx_5',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: 320.00,
    merchantName: 'TikTok Creator Rewards',
    category: 'Income',
    date: '2026-09-21T10:15:00Z',
    aiTag: 'Passive Content Revenue'
  },
  {
    id: 'tx_6',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: -85.00,
    merchantName: 'Apt 4B WiFi & Power Split',
    category: 'Bills & Rent',
    date: '2026-09-20T16:00:00Z',
    isRecurring: true,
    aiTag: 'Squad Vault Settled On-Time'
  },
  {
    id: 'tx_7',
    userId: 'usr_genz_alex',
    accountId: 'acc_primary_checking',
    accountName: 'Main Liquid Checking',
    amount: -55.00,
    merchantName: 'Equinox Gym & Spa',
    category: 'Subscriptions',
    date: '2026-09-19T09:00:00Z',
    isRecurring: true,
    aiTag: 'Reported to Experian Boost'
  }
];

const INITIAL_CHILL_LOCKS: ChillLock[] = [
  {
    id: 'lock_1',
    userId: 'usr_genz_alex',
    merchant: 'SSENSE Tokyo Capsule Drop',
    amount: 145.00,
    hoursEquivalent: 4.5,
    category: 'Fashion & Apparel',
    lockedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    unlocksAt: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(), // 10 hours left
    status: 'LOCKED',
    aiVerdict: 'High dopamine late-night cart. 4.5 hours of client revisions needed to cover this.',
    psychologicalTrigger: 'FOMO & Limited drop panic loop (11:30 PM)'
  },
  {
    id: 'lock_2',
    userId: 'usr_genz_alex',
    merchant: 'Zara Midnight Flash Sale',
    amount: 89.00,
    hoursEquivalent: 2.8,
    category: 'Shopping',
    lockedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    unlocksAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'SAVED_CANCELLED',
    aiVerdict: 'Cooled down successfully. $89 returned to checking! +5 Pulse Score awarded.',
    psychologicalTrigger: 'Boredom doomscrolling'
  }
];

const INITIAL_SQUAD_VAULTS: SquadVault[] = [
  {
    id: 'sq_1',
    title: 'Miami Basel Villa 🌴',
    emoji: '🌴',
    description: 'Shared Airbnb rental, boat day & pool club for Art Basel weekend.',
    targetAmount: 2400.00,
    currentAmount: 1850.00,
    category: 'Trip',
    createdAt: '2026-08-01T12:00:00Z',
    members: [
      { id: 'm1', name: 'Alex R. (You)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'admin', sharePercentage: 25, amountPaid: 600, amountOwed: 0, status: 'paid' },
      { id: 'm2', name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', role: 'member', sharePercentage: 25, amountPaid: 600, amountOwed: 0, status: 'paid' },
      { id: 'm3', name: 'Jordan Hayes', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', role: 'member', sharePercentage: 25, amountPaid: 400, amountOwed: 200, status: 'pending' },
      { id: 'm4', name: 'Kai Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', role: 'member', sharePercentage: 25, amountPaid: 250, amountOwed: 350, status: 'overdue' }
    ],
    recentSplits: [
      { id: 'sp_1', title: 'Airbnb Deposit (50%)', totalAmount: 1200, paidBy: 'Alex R.', date: '2026-09-15' },
      { id: 'sp_2', title: 'Groceries & Bevies', totalAmount: 320, paidBy: 'Maya Chen', date: '2026-09-18' }
    ]
  },
  {
    id: 'sq_2',
    title: 'Apartment 4B Utilities & Fiber ⚡',
    emoji: '⚡',
    description: 'Monthly 1Gbps fiber internet, water, trash and shared household consumables.',
    targetAmount: 360.00,
    currentAmount: 360.00,
    category: 'Apartment',
    createdAt: '2026-06-01T10:00:00Z',
    members: [
      { id: 'm1', name: 'Alex R. (You)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'admin', sharePercentage: 50, amountPaid: 180, amountOwed: 0, status: 'paid' },
      { id: 'm5', name: 'Samira Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', role: 'member', sharePercentage: 50, amountPaid: 180, amountOwed: 0, status: 'paid' }
    ],
    recentSplits: [
      { id: 'sp_3', title: 'September Fiber & Electricity', totalAmount: 360, paidBy: 'Alex R.', date: '2026-09-02' }
    ]
  }
];

const INITIAL_SUBSCRIPTIONS: ReportableSubscription[] = [
  {
    id: 'sub_rent',
    name: 'Apartment 4B Rent ($1,250)',
    category: 'Rent',
    monthlyAmount: 1250.00,
    consecutiveOnTimeMonths: 14,
    isReported: true,
    bureauSync: { experian: true, transunion: true, equifax: true },
    impactScore: 24
  },
  {
    id: 'sub_spotify',
    name: 'Spotify Premium Duo',
    category: 'Streaming',
    monthlyAmount: 14.99,
    consecutiveOnTimeMonths: 22,
    isReported: true,
    bureauSync: { experian: true, transunion: true, equifax: false },
    impactScore: 6
  },
  {
    id: 'sub_gym',
    name: 'Equinox Fitness Pass',
    category: 'Fitness',
    monthlyAmount: 55.00,
    consecutiveOnTimeMonths: 9,
    isReported: true,
    bureauSync: { experian: true, transunion: false, equifax: false },
    impactScore: 5
  },
  {
    id: 'sub_klarna',
    name: 'Klarna Pay-in-4 Studio Monitor',
    category: 'BNPL',
    monthlyAmount: 48.50,
    consecutiveOnTimeMonths: 4,
    isReported: true,
    bureauSync: { experian: true, transunion: true, equifax: true },
    impactScore: 7
  },
  {
    id: 'sub_netflix',
    name: 'Netflix 4K Tier',
    category: 'Streaming',
    monthlyAmount: 22.99,
    consecutiveOnTimeMonths: 11,
    isReported: false,
    bureauSync: { experian: false, transunion: false, equifax: false },
    impactScore: 4
  }
];

const INITIAL_INCOME_WEEKS: IncomeWeekData[] = [
  { week: 'Wk 1 (Aug)', earned: 1350, baseline: 850, sweepAmount: 500, bufferResultBalance: 1950, status: 'surplus' },
  { week: 'Wk 2 (Aug)', earned: 620, baseline: 850, sweepAmount: -230, bufferResultBalance: 1720, status: 'deficit' },
  { week: 'Wk 3 (Aug)', earned: 1480, baseline: 850, sweepAmount: 630, bufferResultBalance: 2350, status: 'surplus' },
  { week: 'Wk 4 (Aug)', earned: 850, baseline: 850, sweepAmount: 0, bufferResultBalance: 2350, status: 'balanced' },
  { week: 'Wk 1 (Sep)', earned: 450, baseline: 850, sweepAmount: -400, bufferResultBalance: 1950, status: 'deficit' },
  { week: 'Wk 2 (Sep)', earned: 1250, baseline: 850, sweepAmount: 400, bufferResultBalance: 2350, status: 'surplus' },
  { week: 'Wk 3 (Sep)', earned: 950, baseline: 850, sweepAmount: 100, bufferResultBalance: 2450, status: 'surplus' },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'model',
    content: `👋 Hey Alex! I'm **Pulse Agent**, your AI financial copilot.\n\nI’ve got your financial telemetry hooked in:\n- **Buffer Vault**: **$2,450** (2.9 weeks of guaranteed runway)\n- **Impulse Shield**: 1 active chill lock on *SSENSE Drop* ($145)\n- **Credit Elevator**: +42 pts projected via 4 verified recurring rails\n\nAsk me anything like *"Can I afford a $65 dinner tonight?"*, *"Simulate next month's tax buffer"*, or *"How do I split the Miami AirBnb without being awkward?"*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      { label: '🍕 Can I afford dinner for $60?', actionKey: 'afford_dinner' },
      { label: '🛡️ Check my Impulse Shield', actionKey: 'check_impulse' },
      { label: '📈 How to hit 750 Credit Score?', actionKey: 'boost_credit' },
      { label: '⚡ Run Lean Week Simulation', actionKey: 'simulate_lean' }
    ]
  }
];

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pulse_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('pulse_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pulse_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [chillLocks, setChillLocks] = useState<ChillLock[]>(() => {
    const saved = localStorage.getItem('pulse_chill_locks');
    return saved ? JSON.parse(saved) : INITIAL_CHILL_LOCKS;
  });

  const [squadVaults, setSquadVaults] = useState<SquadVault[]>(() => {
    const saved = localStorage.getItem('pulse_squad_vaults');
    return saved ? JSON.parse(saved) : INITIAL_SQUAD_VAULTS;
  });

  const [subscriptions, setSubscriptions] = useState<ReportableSubscription[]>(() => {
    const saved = localStorage.getItem('pulse_subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [incomeWeeks, setIncomeWeeks] = useState<IncomeWeekData[]>(() => {
    const saved = localStorage.getItem('pulse_income_weeks');
    return saved ? JSON.parse(saved) : INITIAL_INCOME_WEEKS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('pulse_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('pulse_category_budgets');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORY_BUDGETS;
  });

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const [claimedMilestones, setClaimedMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('pulse_claimed_milestones');
    return saved ? JSON.parse(saved) : ['milestone_gig_velocity'];
  });
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [activeMilestoneToast, setActiveMilestoneToast] = useState<PulseMilestone | null>(null);

  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('pulse_active_theme') || 'luxe_gold';
  });

  const activeTheme = useMemo(() => {
    return BRAND_THEMES.find(t => t.id === activeThemeId) || BRAND_THEMES[0];
  }, [activeThemeId]);

  useEffect(() => {
    localStorage.setItem('pulse_active_theme', activeThemeId);
    
    // Apply CSS variables to document.documentElement
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', activeTheme.primaryColor);
    root.style.setProperty('--brand-primary-rgb', activeTheme.primaryRgb);
    root.style.setProperty('--brand-secondary', activeTheme.secondaryColor);
    root.style.setProperty('--brand-secondary-rgb', activeTheme.secondaryRgb);
    root.style.setProperty('--brand-background', activeTheme.backgroundColor);
    root.style.setProperty('--brand-background-rgb', activeTheme.backgroundRgb);
    root.style.setProperty('--brand-surface', activeTheme.surfaceColor);
    root.style.setProperty('--brand-surface-rgb', activeTheme.surfaceRgb);
    root.style.setProperty('--brand-text', activeTheme.textColor);
    root.style.setProperty('--brand-accent', activeTheme.accentColor);
    root.style.setProperty('--brand-accent-rgb', activeTheme.accentRgb);
  }, [activeThemeId, activeTheme]);

  const setThemeById = (themeId: string) => {
    if (BRAND_THEMES.some(t => t.id === themeId)) {
      setActiveThemeId(themeId);
    }
  };

  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isImpulseModalOpen, setIsImpulseModalOpen] = useState(false);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('pulse_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pulse_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('pulse_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pulse_chill_locks', JSON.stringify(chillLocks));
  }, [chillLocks]);

  useEffect(() => {
    localStorage.setItem('pulse_squad_vaults', JSON.stringify(squadVaults));
  }, [squadVaults]);

  useEffect(() => {
    localStorage.setItem('pulse_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('pulse_income_weeks', JSON.stringify(incomeWeeks));
  }, [incomeWeeks]);

  useEffect(() => {
    localStorage.setItem('pulse_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('pulse_category_budgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  useEffect(() => {
    localStorage.setItem('pulse_claimed_milestones', JSON.stringify(claimedMilestones));
  }, [claimedMilestones]);

  // Budget Monitoring & Threshold Evaluation (80% Alert Logic)
  const budgetAlerts: BudgetAlertStatus[] = useMemo(() => {
    return categoryBudgets.map((b) => {
      // Calculate total expense in this category (negative tx amounts)
      const categoryTxs = transactions.filter(
        t => t.category === b.category && t.amount < 0
      );
      const totalSpent = categoryTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const percentage = b.monthlyBudget > 0 ? Number(((totalSpent / b.monthlyBudget) * 100).toFixed(1)) : 0;
      const isWarning = percentage >= 80 && percentage < 100;
      const isExceeded = percentage >= 100;
      const remaining = Math.max(0, Number((b.monthlyBudget - totalSpent).toFixed(2)));
      const overAmount = Math.max(0, Number((totalSpent - b.monthlyBudget).toFixed(2)));

      return {
        category: b.category,
        spent: Number(totalSpent.toFixed(2)),
        monthlyBudget: b.monthlyBudget,
        percentage,
        isWarning,
        isExceeded,
        threshold: 80,
        remaining,
        overAmount,
        color: b.color || '#3b82f6'
      };
    });
  }, [categoryBudgets, transactions]);

  // Active alerts exceeding 80% threshold and not dismissed
  const activeBudgetAlerts = useMemo(() => {
    return budgetAlerts.filter(alert => (alert.isWarning || alert.isExceeded) && !dismissedAlerts.includes(alert.category));
  }, [budgetAlerts, dismissedAlerts]);

  const setCategoryBudget = (category: ExpenseCategory, monthlyBudget: number) => {
    setCategoryBudgets(prev => prev.map(b => b.category === category ? { ...b, monthlyBudget } : b));
    // Re-evaluate dismissed status if budget increased
    setDismissedAlerts(prev => prev.filter(c => c !== category));
    triggerConfetti();
  };

  const dismissBudgetAlert = (category: ExpenseCategory) => {
    setDismissedAlerts(prev => [...prev, category]);
  };

  const resetBudgetAlerts = () => {
    setDismissedAlerts([]);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b']
    });
  };

  // Calculate composite Pulse Health Score
  const bufferAcc = accounts.find(a => a.accountType === 'buffer_vault');
  const bufferBalance = bufferAcc ? bufferAcc.balance : 2450;
  const targetBuffer = user.baselineWeeklyIncome * 4; // 4 weeks target
  const bufferScore = Math.min(25, Math.round((bufferBalance / targetBuffer) * 25));

  const reportedSubsCount = subscriptions.filter(s => s.isReported).length;
  const creditScorePillar = Math.min(25, 12 + reportedSubsCount * 3);

  const savedLocksCount = chillLocks.filter(l => l.status === 'SAVED_CANCELLED').length;
  const impulsePillar = Math.min(25, 15 + savedLocksCount * 2.5);

  const savingsRate = Math.min(25, 20); // healthy 20/25
  const totalScore = Math.min(100, Math.round(bufferScore + creditScorePillar + impulsePillar + savingsRate));

  const scorePillars: PulseScorePillars = {
    bufferHealth: bufferScore,
    savingsVelocity: savingsRate,
    creditElevator: creditScorePillar,
    impulseDiscipline: Math.round(impulsePillar),
    total: totalScore
  };

  // Pulse Milestones System Calculation
  const milestones: PulseMilestone[] = useMemo(() => {
    const categoriesUnder80 = budgetAlerts.filter(b => b.percentage < 80).length;
    const surplusWeeksCount = incomeWeeks.filter(w => w.status === 'surplus').length;
    const chillLocksCount = chillLocks.length;
    const savedChillLocksCount = chillLocks.filter(l => l.status === 'SAVED_CANCELLED').length;
    const currentBuffer = accounts.find(a => a.accountType === 'buffer_vault')?.balance || 0;
    const reportedBills = subscriptions.filter(s => s.isReported).length;
    const squadFundsTotal = squadVaults.reduce((sum, v) => sum + v.currentAmount, 0);
    const gigSweeps = transactions.filter(t => t.category === 'Gig Payout' || t.category === 'Buffer Sweep').length;

    const list: PulseMilestone[] = [
      {
        id: 'milestone_budget_ninja',
        title: 'Budget Ninja',
        description: 'Maintain 4 or more monthly expense categories strictly below the 80% threshold',
        category: 'budget',
        badgeEmoji: '🥷',
        rarity: 'Epic',
        targetValue: 4,
        currentValue: categoriesUnder80,
        unit: 'categories safe',
        progressPercentage: Math.min(100, Math.round((categoriesUnder80 / 4) * 100)),
        isUnlocked: categoriesUnder80 >= 4,
        pulseScoreReward: 5,
        rewardClaimed: claimedMilestones.includes('milestone_budget_ninja'),
        unlockedAt: categoriesUnder80 >= 4 ? 'Active this month' : undefined
      },
      {
        id: 'milestone_savings_streak',
        title: 'Savings Streak',
        description: 'Achieve 3 or more surplus income weeks routed automatically to your safety buffer',
        category: 'savings',
        badgeEmoji: '⚡',
        rarity: 'Rare',
        targetValue: 3,
        currentValue: surplusWeeksCount,
        unit: 'surplus weeks',
        progressPercentage: Math.min(100, Math.round((surplusWeeksCount / 3) * 100)),
        isUnlocked: surplusWeeksCount >= 3,
        pulseScoreReward: 4,
        rewardClaimed: claimedMilestones.includes('milestone_savings_streak'),
        unlockedAt: surplusWeeksCount >= 3 ? '3 consecutive weeks' : undefined
      },
      {
        id: 'milestone_impulse_master',
        title: 'Impulse Shield Master',
        description: 'Intercept and freeze 2 or more emotional doomspending impulses in Chill Vault',
        category: 'discipline',
        badgeEmoji: '🛡️',
        rarity: 'Rare',
        targetValue: 2,
        currentValue: chillLocksCount,
        unit: 'interventions',
        progressPercentage: Math.min(100, Math.round((chillLocksCount / 2) * 100)),
        isUnlocked: chillLocksCount >= 2,
        pulseScoreReward: 3,
        rewardClaimed: claimedMilestones.includes('milestone_impulse_master'),
        unlockedAt: chillLocksCount >= 2 ? 'Shield active' : undefined
      },
      {
        id: 'milestone_chill_guardian',
        title: 'Chill Vault Zen',
        description: 'Cancel a frozen impulse purchase after cooldown and reclaim 100% of your funds',
        category: 'discipline',
        badgeEmoji: '🧘',
        rarity: 'Epic',
        targetValue: 1,
        currentValue: savedChillLocksCount,
        unit: 'impulse cancelled',
        progressPercentage: Math.min(100, Math.round((savedChillLocksCount / 1) * 100)),
        isUnlocked: savedChillLocksCount >= 1,
        pulseScoreReward: 5,
        rewardClaimed: claimedMilestones.includes('milestone_chill_guardian'),
        unlockedAt: savedChillLocksCount >= 1 ? 'Regret averted' : undefined
      },
      {
        id: 'milestone_buffer_fortress',
        title: 'Buffer Fortress',
        description: 'Accumulate $2,000+ in your automated Smart Buffer Vault for emergency runway',
        category: 'savings',
        badgeEmoji: '🏰',
        rarity: 'Legendary',
        targetValue: 2000,
        currentValue: Math.round(currentBuffer),
        unit: '$ saved',
        progressPercentage: Math.min(100, Math.round((currentBuffer / 2000) * 100)),
        isUnlocked: currentBuffer >= 2000,
        pulseScoreReward: 8,
        rewardClaimed: claimedMilestones.includes('milestone_buffer_fortress'),
        unlockedAt: currentBuffer >= 2000 ? 'Runway secured' : undefined
      },
      {
        id: 'milestone_credit_elevator',
        title: 'Credit Elevator Pioneer',
        description: 'Report 4 or more recurring bills & subscriptions to major credit bureaus',
        category: 'credit',
        badgeEmoji: '🚀',
        rarity: 'Rare',
        targetValue: 4,
        currentValue: reportedBills,
        unit: 'bills reported',
        progressPercentage: Math.min(100, Math.round((reportedBills / 4) * 100)),
        isUnlocked: reportedBills >= 4,
        pulseScoreReward: 4,
        rewardClaimed: claimedMilestones.includes('milestone_credit_elevator'),
        unlockedAt: reportedBills >= 4 ? 'Bureau synced' : undefined
      },
      {
        id: 'milestone_squad_champion',
        title: 'Squad Vault Champion',
        description: 'Reach $1,000+ saved across shared group vaults with friends and roommates',
        category: 'squad',
        badgeEmoji: '👥',
        rarity: 'Common',
        targetValue: 1000,
        currentValue: Math.round(squadFundsTotal),
        unit: '$ in vaults',
        progressPercentage: Math.min(100, Math.round((squadFundsTotal / 1000) * 100)),
        isUnlocked: squadFundsTotal >= 1000 || squadVaults.length >= 2,
        pulseScoreReward: 3,
        rewardClaimed: claimedMilestones.includes('milestone_squad_champion'),
        unlockedAt: (squadFundsTotal >= 1000 || squadVaults.length >= 2) ? 'Squad goals' : undefined
      },
      {
        id: 'milestone_gig_velocity',
        title: 'Gig Surge Optimizer',
        description: 'Log 3 or more freelance gig payouts and auto-sweep surplus earnings to buffer',
        category: 'discipline',
        badgeEmoji: '🎯',
        rarity: 'Common',
        targetValue: 3,
        currentValue: gigSweeps,
        unit: 'sweeps',
        progressPercentage: Math.min(100, Math.round((gigSweeps / 3) * 100)),
        isUnlocked: gigSweeps >= 3,
        pulseScoreReward: 3,
        rewardClaimed: claimedMilestones.includes('milestone_gig_velocity'),
        unlockedAt: 'Completed'
      }
    ];

    return list;
  }, [budgetAlerts, incomeWeeks, chillLocks, accounts, subscriptions, squadVaults, transactions, claimedMilestones]);

  const unlockedMilestonesCount = useMemo(() => {
    return milestones.filter(m => m.isUnlocked).length;
  }, [milestones]);

  const claimMilestoneReward = (milestoneId: string) => {
    if (claimedMilestones.includes(milestoneId)) return;
    const target = milestones.find(m => m.id === milestoneId);
    if (!target || !target.isUnlocked) return;

    setClaimedMilestones(prev => [...prev, milestoneId]);
    setUser(prev => ({
      ...prev,
      pulseHealthScore: Math.min(100, prev.pulseHealthScore + target.pulseScoreReward)
    }));
    triggerConfetti();
  };

  const dismissMilestoneToast = () => {
    setActiveMilestoneToast(null);
  };

  const setBaselineIncome = (amount: number) => {
    setUser(prev => ({ ...prev, baselineWeeklyIncome: amount }));
  };

  const setHourlyRate = (rate: number) => {
    setUser(prev => ({ ...prev, hourlyRate: rate }));
  };

  // AI-Driven Transaction Categorization Service
  const categorizeTransactionWithAI = async (
    merchantName: string,
    amount: number,
    date?: string
  ): Promise<TransactionCategorizationResult> => {
    try {
      const response = await fetch('/api/categorize-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName,
          amount,
          date: date || new Date().toISOString(),
          userContext: {
            hourlyRate: user.hourlyRate,
            baselineWeeklyIncome: user.baselineWeeklyIncome
          }
        })
      });
      const data: TransactionCategorizationResult = await response.json();
      return data;
    } catch (err) {
      console.error('Failed to categorize with AI:', err);
      const numAmount = Number(amount) || 0;
      const isIncome = numAmount > 0;
      const lower = (merchantName || '').toLowerCase();
      let category: Transaction['category'] = 'Shopping';
      let aiTag = 'Daily Essential';
      let isDoomspend = false;
      let isRecurring = false;

      if (isIncome || lower.includes('upwork') || lower.includes('payout') || lower.includes('stripe') || lower.includes('creator')) {
        category = 'Gig Payout';
        aiTag = 'Gig Earnings';
      } else if (lower.includes('spotify') || lower.includes('netflix') || lower.includes('chatgpt') || lower.includes('gym')) {
        category = 'Subscriptions';
        aiTag = 'Subscription';
        isRecurring = true;
      } else if (lower.includes('rent') || lower.includes('utilities')) {
        category = 'Bills & Rent';
        aiTag = 'Fixed Obligation';
        isRecurring = true;
      } else if (lower.includes('doordash') || lower.includes('uber eats') || lower.includes('shein') || lower.includes('late night')) {
        category = 'Food & Drink';
        aiTag = 'Doomspend';
        isDoomspend = true;
      }

      return {
        category,
        aiTag,
        isDoomspend,
        isRecurring,
        confidenceScore: 88,
        reasoning: 'AI semantic rules categorizer assigned tag based on merchant pattern.'
      };
    }
  };

  const autoCategorizeAllTransactions = async () => {
    setIsAutoCategorizing(true);
    try {
      const updated = await Promise.all(
        transactions.map(async (tx) => {
          const res = await categorizeTransactionWithAI(tx.merchantName, tx.amount, tx.date);
          return {
            ...tx,
            category: tx.category || res.category,
            aiTag: res.aiTag,
            isImpulse: res.isDoomspend || tx.isImpulse,
            isDoomspend: res.isDoomspend,
            isRecurring: res.isRecurring ?? tx.isRecurring,
            aiConfidence: res.confidenceScore,
            aiReasoning: res.reasoning
          };
        })
      );
      setTransactions(updated);
      triggerConfetti();
    } catch (err) {
      console.error('Batch categorization failed:', err);
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const addTransaction = (newTx: Omit<Transaction, 'id' | 'userId'>) => {
    const id = `tx_${Date.now()}`;
    const tx: Transaction = {
      ...newTx,
      id,
      userId: user.id,
      workHoursEquivalent: Number((Math.abs(newTx.amount) / user.hourlyRate).toFixed(1))
    };

    setTransactions(prev => [tx, ...prev]);

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === newTx.accountId) {
        return { ...acc, balance: Number((acc.balance + newTx.amount).toFixed(2)) };
      }
      return acc;
    }));

    // Auto-enrich tag if not provided or refine with AI
    if (!newTx.aiTag || newTx.aiTag.startsWith('Logged:')) {
      categorizeTransactionWithAI(newTx.merchantName, newTx.amount, newTx.date).then(res => {
        setTransactions(prev => prev.map(t => {
          if (t.id === id) {
            return {
              ...t,
              category: (newTx.category as any) || res.category,
              aiTag: res.aiTag,
              isImpulse: res.isDoomspend || t.isImpulse,
              isDoomspend: res.isDoomspend,
              isRecurring: res.isRecurring ?? t.isRecurring,
              aiConfidence: res.confidenceScore,
              aiReasoning: res.reasoning
            };
          }
          return t;
        }));
      });
    }

    // If gig payout and above baseline, trigger dynamic sweep
    if (newTx.category === 'Gig Payout' || newTx.category === 'Income') {
      if (newTx.amount > user.baselineWeeklyIncome) {
        const surplus = Number((newTx.amount - user.baselineWeeklyIncome).toFixed(2));
        if (surplus > 0) {
          const sweepTx: Transaction = {
            id: `tx_sweep_${Date.now()}`,
            userId: user.id,
            accountId: 'acc_primary_checking',
            accountName: 'Main Liquid Checking',
            amount: -surplus,
            merchantName: 'Auto-Buffer Safe Sweep',
            category: 'Buffer Sweep',
            date: new Date().toISOString(),
            aiTag: 'Buffer Sweep'
          };

          setTimeout(() => {
            setTransactions(prev => [sweepTx, ...prev]);
            setAccounts(prevAccounts => prevAccounts.map(a => {
              if (a.accountType === 'checking') return { ...a, balance: Number((a.balance - surplus).toFixed(2)) };
              if (a.accountType === 'buffer_vault') return { ...a, balance: Number((a.balance + surplus).toFixed(2)) };
              return a;
            }));
            triggerConfetti();
          }, 600);
        }
      }
    }
  };

  const lockInChillVault = (item: { merchant: string; amount: number; category: string; trigger?: string; verdict?: string }) => {
    const hours = Number((item.amount / user.hourlyRate).toFixed(1));
    const newLock: ChillLock = {
      id: `lock_${Date.now()}`,
      userId: user.id,
      merchant: item.merchant,
      amount: item.amount,
      hoursEquivalent: hours,
      category: item.category,
      lockedAt: new Date().toISOString(),
      unlocksAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      status: 'LOCKED',
      aiVerdict: item.verdict || `Moved $${item.amount} to Chill Vault for 24 hours. Represents ${hours} hours of freelance grind.`,
      psychologicalTrigger: item.trigger || 'Late-night impulse trigger intercepted'
    };

    setChillLocks(prev => [newLock, ...prev]);

    // Move funds from checking to chill vault
    setAccounts(prev => prev.map(a => {
      if (a.accountType === 'checking') return { ...a, balance: Math.max(0, Number((a.balance - item.amount).toFixed(2))) };
      if (a.accountType === 'chill_vault') return { ...a, balance: Number((a.balance + item.amount).toFixed(2)) };
      return a;
    }));

    addTransaction({
      accountId: 'acc_primary_checking',
      accountName: 'Main Liquid Checking',
      amount: -item.amount,
      merchantName: `Chill Vault Hold: ${item.merchant}`,
      category: 'Shopping',
      date: new Date().toISOString(),
      isImpulse: true,
      aiTag: `24h Chill Lock Active • ${hours}h hustle equivalent`,
      workHoursEquivalent: hours
    });
  };

  const cancelChillLock = (id: string) => {
    const target = chillLocks.find(l => l.id === id);
    if (!target || target.status !== 'LOCKED') return;

    setChillLocks(prev => prev.map(l => l.id === id ? { ...l, status: 'SAVED_CANCELLED' } : l));

    // Return money to checking
    setAccounts(prev => prev.map(a => {
      if (a.accountType === 'checking') return { ...a, balance: Number((a.balance + target.amount).toFixed(2)) };
      if (a.accountType === 'chill_vault') return { ...a, balance: Math.max(0, Number((a.balance - target.amount).toFixed(2))) };
      return a;
    }));

    // Award +5 score boost
    setUser(prev => ({ ...prev, pulseHealthScore: Math.min(100, prev.pulseHealthScore + 5) }));

    addTransaction({
      accountId: 'acc_primary_checking',
      accountName: 'Main Liquid Checking',
      amount: target.amount,
      merchantName: `Chill Vault Return: ${target.merchant}`,
      category: 'Income',
      date: new Date().toISOString(),
      aiTag: `Saved! Money returned to checking (+5 Pulse Score bonus)`
    });

    triggerConfetti();
  };

  const releaseChillLock = (id: string) => {
    const target = chillLocks.find(l => l.id === id);
    if (!target || target.status !== 'LOCKED') return;

    setChillLocks(prev => prev.map(l => l.id === id ? { ...l, status: 'RELEASED_PURCHASED' } : l));

    // Deduct from chill vault
    setAccounts(prev => prev.map(a => {
      if (a.accountType === 'chill_vault') return { ...a, balance: Math.max(0, Number((a.balance - target.amount).toFixed(2))) };
      return a;
    }));

    addTransaction({
      accountId: 'acc_chill_vault',
      accountName: '24h Chill Vault',
      amount: -target.amount,
      merchantName: `Completed: ${target.merchant}`,
      category: 'Shopping',
      date: new Date().toISOString(),
      aiTag: `Chill period expired • Purchase confirmed deliberately`
    });
  };

  const createSquadVault = (vaultData: Omit<SquadVault, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newVault: SquadVault = {
      ...vaultData,
      id: `sq_${Date.now()}`,
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };
    setSquadVaults(prev => [newVault, ...prev]);
    triggerConfetti();
  };

  const contributeToSquadVault = (vaultId: string, amount: number) => {
    setSquadVaults(prev => prev.map(vault => {
      if (vault.id === vaultId) {
        return {
          ...vault,
          currentAmount: Number((vault.currentAmount + amount).toFixed(2)),
          members: vault.members.map(m => m.id === 'm1' ? { ...m, amountPaid: m.amountPaid + amount } : m)
        };
      }
      return vault;
    }));

    setAccounts(prev => prev.map(a => {
      if (a.accountType === 'checking') return { ...a, balance: Math.max(0, Number((a.balance - amount).toFixed(2))) };
      if (a.accountType === 'squad_vault') return { ...a, balance: Number((a.balance + amount).toFixed(2)) };
      return a;
    }));

    addTransaction({
      accountId: 'acc_primary_checking',
      accountName: 'Main Liquid Checking',
      amount: -amount,
      merchantName: `Squad Vault Deposit: ${squadVaults.find(v => v.id === vaultId)?.title || 'Shared Vault'}`,
      category: 'Bills & Rent',
      date: new Date().toISOString(),
      aiTag: 'Squad Vault Contribution'
    });

    triggerConfetti();
  };

  const toggleSubscriptionReporting = (subId: string) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === subId) {
        const nextState = !sub.isReported;
        return {
          ...sub,
          isReported: nextState,
          bureauSync: {
            experian: nextState,
            transunion: nextState,
            equifax: nextState
          }
        };
      }
      return sub;
    }));
    triggerConfetti();
  };

  const toggleAllSubscriptions = (report: boolean) => {
    setSubscriptions(prev => prev.map(s => ({
      ...s,
      isReported: report,
      bureauSync: { experian: report, transunion: report, equifax: report }
    })));
    if (report) triggerConfetti();
  };

  const simulateIncomeWeek = (earnedAmount: number) => {
    const baseline = user.baselineWeeklyIncome;
    const diff = Number((earnedAmount - baseline).toFixed(2));
    const lastBalance = incomeWeeks.length > 0 ? incomeWeeks[incomeWeeks.length - 1].bufferResultBalance : 2450;
    const newBufferBalance = Number(Math.max(0, lastBalance + diff).toFixed(2));

    const newWeek: IncomeWeekData = {
      week: `Wk ${incomeWeeks.length + 1} (Sim)`,
      earned: earnedAmount,
      baseline: baseline,
      sweepAmount: diff,
      bufferResultBalance: newBufferBalance,
      status: diff > 0 ? 'surplus' : diff < 0 ? 'deficit' : 'balanced'
    };

    setIncomeWeeks(prev => [...prev, newWeek]);

    if (diff > 0) {
      // Swept surplus
      setAccounts(prev => prev.map(a => {
        if (a.accountType === 'buffer_vault') return { ...a, balance: Number((a.balance + diff).toFixed(2)) };
        return a;
      }));
      addTransaction({
        accountId: 'acc_primary_checking',
        accountName: 'Main Liquid Checking',
        amount: earnedAmount,
        merchantName: 'Simulated Gig Contract Payout',
        category: 'Gig Payout',
        date: new Date().toISOString(),
        aiTag: `Feast Week: $${diff} automatically buffered`
      });
      triggerConfetti();
    } else if (diff < 0) {
      // Top-up disbursement from buffer to checking
      const deficit = Math.abs(diff);
      setAccounts(prev => prev.map(a => {
        if (a.accountType === 'buffer_vault') return { ...a, balance: Math.max(0, Number((a.balance - deficit).toFixed(2))) };
        if (a.accountType === 'checking') return { ...a, balance: Number((a.balance + deficit).toFixed(2)) };
        return a;
      }));
      addTransaction({
        accountId: 'acc_primary_checking',
        accountName: 'Main Liquid Checking',
        amount: deficit,
        merchantName: 'Buffer Vault Top-Up Disbursement',
        category: 'Buffer Top-up',
        date: new Date().toISOString(),
        aiTag: `Lean Week Safety Net: Top-up disbursed so checking never dips`
      });
    }
  };

  const sendChatMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);

    try {
      const response = await fetch('/api/pulse-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          userContext: {
            fullName: user.fullName,
            hourlyRate: user.hourlyRate,
            baselineWeeklyIncome: user.baselineWeeklyIncome,
            checkingBalance: accounts.find(a => a.accountType === 'checking')?.balance || 1485,
            bufferVaultBalance: accounts.find(a => a.accountType === 'buffer_vault')?.balance || 2450,
            activeChillLocksCount: chillLocks.filter(l => l.status === 'LOCKED').length,
            chillVaultBalance: accounts.find(a => a.accountType === 'chill_vault')?.balance || 145,
            pulseScore: scorePillars.total,
            squadVaultsSummary: squadVaults.map(v => `${v.title} ($${v.currentAmount}/$${v.targetAmount})`).join(', '),
            recurringSummary: subscriptions.filter(s => s.isReported).map(s => `${s.name} ($${s.monthlyAmount})`).join(', '),
            budgetAlertsSummary: budgetAlerts.map(b => `${b.category}: $${b.spent}/$${b.monthlyBudget} (${b.percentage}%)${b.isExceeded ? ' [100%+ EXCEEDED]' : b.isWarning ? ' [80%+ ALERT]' : ''}`).join(', ')
          }
        })
      });

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: data.reply || "I'm analyzing your finances. You're on track with your buffer and credit velocity!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...newHistory, modelMsg]);
    } catch (err) {
      console.error('Failed to get Pulse Agent response:', err);
      const fallbackMsg: ChatMessage = {
        id: `model_fb_${Date.now()}`,
        role: 'model',
        content: `Based on your **$${user.hourlyRate}/hr** earnings and **$${user.baselineWeeklyIncome}/wk** baseline, your current Buffer Vault of **$${accounts.find(a => a.accountType === 'buffer_vault')?.balance || 2450}** provides great runway. Let me know if you need to simulate an upcoming expense or project budget!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...newHistory, fallbackMsg]);
    }
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setUser(INITIAL_USER);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setChillLocks(INITIAL_CHILL_LOCKS);
    setSquadVaults(INITIAL_SQUAD_VAULTS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setIncomeWeeks(INITIAL_INCOME_WEEKS);
    setChatMessages(INITIAL_MESSAGES);
    setCategoryBudgets(INITIAL_CATEGORY_BUDGETS);
    setDismissedAlerts([]);
    setClaimedMilestones(['milestone_gig_velocity']);
    triggerConfetti();
  };

  return (
    <FinancialContext.Provider
      value={{
        user,
        accounts,
        transactions,
        chillLocks,
        squadVaults,
        subscriptions,
        incomeWeeks,
        scorePillars,
        categoryBudgets,
        budgetAlerts,
        activeBudgetAlerts,
        dismissedAlerts,
        milestones,
        unlockedMilestonesCount,
        claimedMilestoneIds: claimedMilestones,
        claimMilestoneReward,
        activeMilestoneToast,
        dismissMilestoneToast,
        chatMessages,
        isAutoCategorizing,
        categorizeTransactionWithAI,
        autoCategorizeAllTransactions,
        isPlaidModalOpen,
        isAddTxModalOpen,
        isImpulseModalOpen,
        isAgentDrawerOpen,
        isBudgetModalOpen,
        isMilestoneModalOpen,
        theme,
        toggleTheme,
        activeThemeId,
        activeTheme,
        setThemeById,
        themes: BRAND_THEMES,
        setUser,
        setBaselineIncome,
        setHourlyRate,
        setCategoryBudget,
        dismissBudgetAlert,
        resetBudgetAlerts,
        addTransaction,
        lockInChillVault,
        cancelChillLock,
        releaseChillLock,
        createSquadVault,
        contributeToSquadVault,
        toggleSubscriptionReporting,
        toggleAllSubscriptions,
        simulateIncomeWeek,
        sendChatMessage,
        setIsPlaidModalOpen,
        setIsAddTxModalOpen,
        setIsImpulseModalOpen,
        setIsAgentDrawerOpen,
        setIsBudgetModalOpen,
        setIsMilestoneModalOpen,
        triggerConfetti,
        resetToDefaultData
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be used within FinancialProvider');
  return context;
};

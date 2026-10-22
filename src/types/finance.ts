export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Housing & Rent'
  | 'Groceries & Dining'
  | 'Software & Subscriptions'
  | 'Utilities & Internet'
  | 'Transport & Travel'
  | 'Health & Wellness'
  | 'Entertainment'
  | 'Salary & Revenue'
  | 'Investments & Dividends'
  | 'Other';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  isRecurring?: boolean;
  status: 'cleared' | 'pending';
  notes?: string;
}

export interface CategoryBudget {
  category: TransactionCategory;
  allocated: number;
  spent: number;
  currency: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'emergency' | 'investment' | 'purchase' | 'travel';
  priority: 'high' | 'medium' | 'low';
}

export interface SurvivalMetrics {
  dailyBurnActual: number;
  dailyBurnBudget: number;
  dailyEssentialBurn: number;
  dailyDiscretionaryBurn: number;
  survivalDaysActual: number;
  survivalDaysBudget: number;
  survivalDaysEssentialOnly: number;
  essentialMonthlyExpense: number;
  discretionaryMonthlyExpense: number;
  survivalStatus: 'CRITICAL' | 'CAUTION' | 'STABLE' | 'SECURE';
  sustainableWithIncome: boolean;
  netMonthlySurplus: number;
}

export type ActionType =
  | 'REALLOCATE_BUDGET'
  | 'ALLOCATE_SAVINGS'
  | 'RECATEGORIZE_TRANSACTION'
  | 'CREATE_SAVINGS_GOAL'
  | 'SET_SPENDING_CEILING'
  | 'CANCEL_SUBSCRIPTION_ALERT'
  | 'ACTIVATE_SURVIVAL_BUDGET'
  | 'EXTEND_RUNWAY_PLAN'
  | 'OPTIMIZE_DAILY_BURN';

export interface ActionPayload {
  sourceCategory?: TransactionCategory;
  targetCategory?: TransactionCategory;
  goalId?: string;
  goalName?: string;
  transactionId?: string;
  amount?: number;
  newBudget?: number;
  newCategory?: TransactionCategory;
  reason?: string;
  targetSurvivalDays?: number;
  projectedDaysGained?: number;
  trimmedCategories?: {
    category: TransactionCategory;
    previousAmount: number;
    newAmount: number;
  }[];
}

export interface ValidationRuleCheck {
  ruleName: string;
  passed: boolean;
  message: string;
}

export interface ProposedAction {
  id: string;
  timestamp: string;
  type: ActionType;
  title: string;
  description: string;
  expectedEffect: string;
  payload: ActionPayload;
  validationRules: ValidationRuleCheck[];
  allRulesPassed: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'FAILED_RECOVERED';
  rejectionReason?: string;
  recoveryNote?: string;
}

export interface AgentPlanStep {
  stepNumber: number;
  phase: 'PLAN' | 'ACT' | 'VERIFY' | 'RECOVER';
  title: string;
  detail: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export interface AgentExecutionLog {
  id: string;
  timestamp: string;
  userPrompt: string;
  planSummary: string;
  actionTaken?: string;
  verificationOutcome: 'VERIFIED_SUCCESS' | 'REJECTED_BY_USER' | 'FAILED_VALIDATION' | 'RECOVERED_SAFELY';
  notes: string;
}

export interface FinancialInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'achievement' | 'tip';
  title: string;
  description: string;
  impactScore: number;
  actionRecommendation?: string;
  actionType?: ActionType;
  actionPayload?: ActionPayload;
}

export interface FinancialProfile {
  name: string;
  currency: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  emergencyFundMonths: number;
  savingsRate: number;
  transactions: Transaction[];
  budgets: CategoryBudget[];
  savingsGoals: SavingsGoal[];
  insights: FinancialInsight[];
  survivalMetrics?: SurvivalMetrics;
}

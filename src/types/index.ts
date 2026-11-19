export type UserRole = 'owner';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  monthlySalary: number;
  annualSavingsTarget: number;
  currency: string;
  timezone: string;
  createdAt: string;
}

export type IncomeType = 'salary' | 'bonus' | 'freelance' | 'investment' | 'other';

export interface Income {
  id: string;
  amount: number;
  sourceName: string;
  type: IncomeType;
  date: string; // YYYY-MM-DD
  monthYear: string; // YYYY-MM
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Food and groceries'
  | 'Shopping'
  | 'Entertainment'
  | 'Travel'
  | 'Fuel and transportation'
  | 'Online subscriptions'
  | 'Gadgets and electronics'
  | 'Personal expenses'
  | 'Medical expenses'
  | 'Miscellaneous';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash';

export interface Expense {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  paymentMethod: PaymentMethod;
  isUnnecessary?: boolean;
  notes?: string;
  createdAt: string;
}

export type LoanStatus = 'active' | 'completed' | 'overdue';

export interface Loan {
  id: string;
  loanName: string;
  lender: string;
  originalAmount: number;
  outstandingAmount: number;
  monthlyEmi: number;
  interestRate: number; // annual percentage e.g. 10.5
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  dueDateDay: number; // day of the month 1-31
  remainingInstallments: number;
  totalInstallments: number;
  status: LoanStatus;
  notes?: string;
  createdAt: string;
}

export type EmiPaymentStatus = 'paid' | 'pending' | 'missed' | 'overdue';

export interface EmiPaymentRecord {
  id: string;
  loanId: string;
  loanName: string;
  amount: number;
  principalComponent: number;
  interestComponent: number;
  paymentDate?: string;
  dueDate: string; // YYYY-MM-DD
  status: EmiPaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  category: 'Emergency Fund' | 'Wealth Creation' | 'Retirement' | 'Tax Saving' | 'General';
  isCompleted: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  itemName: string;
  targetPrice: number;
  amountSaved: number;
  targetDate: string; // YYYY-MM-DD
  monthlyContribution: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  isAchieved: boolean;
  notes?: string;
  createdAt: string;
}

export type NotificationType =
  | 'emi_due'
  | 'emi_upcoming'
  | 'overdue'
  | 'savings_milestone'
  | 'wishlist'
  | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  isRead: boolean;
  relatedEntityId?: string;
}

export interface MonthlyFinancialSummary {
  monthYear: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  totalEmi: number;
  plannedSavings: number;
  availableBalance: number;
  actualSavings: number;
  debtReduced: number;
}

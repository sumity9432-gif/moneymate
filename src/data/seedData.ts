import {
  UserProfile,
  Income,
  Expense,
  Loan,
  EmiPaymentRecord,
  SavingsGoal,
  WishlistItem,
  AppNotification,
} from '@/types';

export const initialProfile: UserProfile = {
  id: 'usr_sumit_owner',
  email: 'Sumity9432@gmail.com',
  fullName: 'Sumit',
  avatarUrl: '',
  monthlySalary: 0,
  annualSavingsTarget: 0,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  createdAt: new Date().toISOString(),
};

// Completely empty collections for fresh production use
export const initialIncomes: Income[] = [];
export const initialLoans: Loan[] = [];
export const initialEmiPayments: EmiPaymentRecord[] = [];
export const initialExpenses: Expense[] = [];
export const initialSavingsGoals: SavingsGoal[] = [];
export const initialWishlist: WishlistItem[] = [];
export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_welcome',
    title: 'Welcome to MoneyMate!',
    message: 'Your private financial ledger is clean and ready. Add your salary, expenses, or EMIs to get started.',
    type: 'system',
    date: new Date().toISOString(),
    isRead: false,
  },
];

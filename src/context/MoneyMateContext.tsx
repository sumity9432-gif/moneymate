'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import {
  initialProfile,
  initialIncomes,
  initialExpenses,
  initialLoans,
  initialEmiPayments,
  initialSavingsGoals,
  initialWishlist,
  initialNotifications,
} from '@/data/seedData';
import { getCurrentMonthYear, calculateEmiSplit, OWNER_EMAIL } from '@/lib/utils';
import { isAuthorizedOwner } from '@/lib/supabase';

interface MoneyMateContextType {
  // Authentication & Profile
  profile: UserProfile;
  isOwnerAuthenticated: boolean;
  authEmail: string;
  loginAsOwner: () => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;

  // Selected Month Filter
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;

  // Data Collections
  incomes: Income[];
  expenses: Expense[];
  loans: Loan[];
  emiPayments: EmiPaymentRecord[];
  savingsGoals: SavingsGoal[];
  wishlist: WishlistItem[];
  notifications: AppNotification[];

  // Computed Financial Metrics
  monthlyIncomeTotal: number;
  monthlyExpenseTotal: number;
  monthlyEmiCommitmentTotal: number;
  monthlyPlannedSavingsTotal: number;
  availableSpendingBalance: number;
  totalOutstandingDebt: number;
  totalAccumulatedSavings: number;
  annualSavingsProgressPct: number;
  unnecessarySpendingTotal: number;

  // CRUD Operations
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  deleteIncome: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void;
  updateLoan: (id: string, updated: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  recordEmiPayment: (loanId: string, amount: number, dueDate: string, paymentDate?: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'isCompleted'>) => void;
  depositToSavings: (goalId: string, amount: number) => void;
  updateSavingsGoal: (id: string, updated: Partial<SavingsGoal>) => void;

  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'isAchieved'>) => void;
  depositToWishlist: (itemId: string, amount: number) => void;
  deleteWishlistItem: (id: string) => void;
  updateWishlistItem: (id: string, updated: Partial<WishlistItem>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => void;

  // Utility Actions
  resetToDemoData: () => void;
  exportDataJSON: () => void;
}

const MoneyMateContext = createContext<MoneyMateContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: 'moneymate_profile_v1',
  INCOMES: 'moneymate_incomes_v1',
  EXPENSES: 'moneymate_expenses_v1',
  LOANS: 'moneymate_loans_v1',
  EMI_PAYMENTS: 'moneymate_emi_payments_v1',
  SAVINGS: 'moneymate_savings_v1',
  WISHLIST: 'moneymate_wishlist_v1',
  NOTIFICATIONS: 'moneymate_notifications_v1',
  AUTH: 'moneymate_auth_status_v1',
};

export const MoneyMateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [authEmail, setAuthEmail] = useState<string>(OWNER_EMAIL);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');

  // Collections
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [emiPayments, setEmiPayments] = useState<EmiPaymentRecord[]>(initialEmiPayments);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  // Initialize and load from LocalStorage
  useEffect(() => {
    setIsClient(true);
    setSelectedMonth(getCurrentMonthYear());
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedIncomes = localStorage.getItem(STORAGE_KEYS.INCOMES);
      if (storedIncomes) setIncomes(JSON.parse(storedIncomes));

      const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));

      const storedLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
      if (storedLoans) setLoans(JSON.parse(storedLoans));

      const storedPayments = localStorage.getItem(STORAGE_KEYS.EMI_PAYMENTS);
      if (storedPayments) setEmiPayments(JSON.parse(storedPayments));

      const storedSavings = localStorage.getItem(STORAGE_KEYS.SAVINGS);
      if (storedSavings) setSavingsGoals(JSON.parse(storedSavings));

      const storedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications));

      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        setAuthEmail(parsed.email || OWNER_EMAIL);
        setIsOwnerAuthenticated(isAuthorizedOwner(parsed.email));
      }
    } catch (e) {
      console.error('Error loading stored MoneyMate state:', e);
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
      localStorage.setItem(STORAGE_KEYS.EMI_PAYMENTS, JSON.stringify(emiPayments));
      localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savingsGoals));
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(
        STORAGE_KEYS.AUTH,
        JSON.stringify({ email: authEmail, authenticated: isOwnerAuthenticated })
      );
    } catch (e) {
      console.error('Error persisting MoneyMate state:', e);
    }
  }, [
    isClient,
    profile,
    incomes,
    expenses,
    loans,
    emiPayments,
    savingsGoals,
    wishlist,
    notifications,
    authEmail,
    isOwnerAuthenticated,
  ]);

  // Auth Handlers
  const loginAsOwner = () => {
    setAuthEmail(OWNER_EMAIL);
    setIsOwnerAuthenticated(true);
  };

  const logout = () => {
    setIsOwnerAuthenticated(false);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // Financial Calculations for Selected Month
  const monthlyIncomeTotal = useMemo(() => {
    const monthIncomes = incomes.filter((i) => i.monthYear === selectedMonth);
    // If no specific extra entries for this month yet, use default monthlySalary
    if (monthIncomes.length === 0) {
      return profile.monthlySalary;
    }
    return monthIncomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [incomes, selectedMonth, profile.monthlySalary]);

  const monthlyExpenseTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(selectedMonth))
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [expenses, selectedMonth]);

  const monthlyEmiCommitmentTotal = useMemo(() => {
    return loans
      .filter((l) => l.status === 'active')
      .reduce((acc, curr) => acc + Number(curr.monthlyEmi), 0);
  }, [loans]);

  const monthlyPlannedSavingsTotal = useMemo(() => {
    const savingsContr = savingsGoals
      .filter((s) => !s.isCompleted)
      .reduce((acc, curr) => acc + Number(curr.monthlyContribution || 0), 0);
    const wishlistContr = wishlist
      .filter((w) => !w.isAchieved)
      .reduce((acc, curr) => acc + Number(curr.monthlyContribution || 0), 0);
    return savingsContr + wishlistContr;
  }, [savingsGoals, wishlist]);

  // Formula as requested in specification:
  // Available Spending Balance = Total Income – Expenses – EMI Commitments – Planned Savings
  const availableSpendingBalance = useMemo(() => {
    return (
      monthlyIncomeTotal -
      monthlyExpenseTotal -
      monthlyEmiCommitmentTotal -
      monthlyPlannedSavingsTotal
    );
  }, [
    monthlyIncomeTotal,
    monthlyExpenseTotal,
    monthlyEmiCommitmentTotal,
    monthlyPlannedSavingsTotal,
  ]);

  const totalOutstandingDebt = useMemo(() => {
    return loans
      .filter((l) => l.status === 'active')
      .reduce((acc, curr) => acc + Number(curr.outstandingAmount), 0);
  }, [loans]);

  const totalAccumulatedSavings = useMemo(() => {
    return savingsGoals.reduce((acc, curr) => acc + Number(curr.currentAmount), 0);
  }, [savingsGoals]);

  const annualSavingsProgressPct = useMemo(() => {
    if (profile.annualSavingsTarget <= 0) return 0;
    return Math.min(100, Math.round((totalAccumulatedSavings / profile.annualSavingsTarget) * 100));
  }, [totalAccumulatedSavings, profile.annualSavingsTarget]);

  const unnecessarySpendingTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(selectedMonth) && e.isUnnecessary)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [expenses, selectedMonth]);

  // Income CRUD
  const addIncome = (income: Omit<Income, 'id' | 'createdAt'>) => {
    const newEntry: Income = {
      ...income,
      id: `inc_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setIncomes((prev) => [newEntry, ...prev]);
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // Expense CRUD
  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newEntry: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newEntry, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Loan & EMI CRUD
  const addLoan = (loan: Omit<Loan, 'id' | 'createdAt'>) => {
    const newLoan: Loan = {
      ...loan,
      id: `loan_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLoans((prev) => [...prev, newLoan]);
  };

  const updateLoan = (id: string, updated: Partial<Loan>) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated } : l))
    );
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  // Record EMI Payment with realistic amortization & debt reduction
  const recordEmiPayment = (
    loanId: string,
    amount: number,
    dueDate: string,
    paymentDate: string = new Date().toISOString().split('T')[0]
  ) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    // Calculate interest & principal breakdown
    const { principalComponent, interestComponent } = calculateEmiSplit(
      loan.outstandingAmount,
      loan.interestRate,
      amount
    );

    // New outstanding balance
    const newOutstanding = Math.max(0, loan.outstandingAmount - principalComponent);
    const newRemainingInstallments = Math.max(0, loan.remainingInstallments - 1);
    const newStatus = newRemainingInstallments === 0 || newOutstanding === 0 ? 'completed' : 'active';

    // Update Loan
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              outstandingAmount: newOutstanding,
              remainingInstallments: newRemainingInstallments,
              status: newStatus,
            }
          : l
      )
    );

    // Add or update EMI payment record
    const paymentRecord: EmiPaymentRecord = {
      id: `pay_${Date.now()}`,
      loanId: loan.id,
      loanName: loan.loanName,
      amount,
      principalComponent,
      interestComponent,
      dueDate,
      paymentDate,
      status: 'paid',
      notes: `Payment recorded on ${paymentDate}. Outstanding reduced by ₹${principalComponent.toLocaleString('en-IN')}`,
      createdAt: new Date().toISOString(),
    };

    setEmiPayments((prev) => [paymentRecord, ...prev]);

    // Push notification
    addNotification({
      title: `EMI Paid: ${loan.loanName}`,
      message: `Successfully recorded EMI of ₹${amount.toLocaleString('en-IN')}. Remaining debt: ₹${newOutstanding.toLocaleString('en-IN')}.`,
      type: 'emi_due',
      relatedEntityId: loan.id,
    });
  };

  // Savings CRUD
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `sav_${Date.now()}`,
      isCompleted: goal.currentAmount >= goal.targetAmount,
      createdAt: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const depositToSavings = (goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((s) => {
        if (s.id !== goalId) return s;
        const newTotal = s.currentAmount + amount;
        const isCompleted = newTotal >= s.targetAmount;
        return {
          ...s,
          currentAmount: newTotal,
          isCompleted,
        };
      })
    );
  };

  const updateSavingsGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  // Wishlist CRUD
  const addWishlistItem = (item: Omit<WishlistItem, 'id' | 'createdAt' | 'isAchieved'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: `wish_${Date.now()}`,
      isAchieved: item.amountSaved >= item.targetPrice,
      createdAt: new Date().toISOString(),
    };
    setWishlist((prev) => [...prev, newItem]);
  };

  const depositToWishlist = (itemId: string, amount: number) => {
    setWishlist((prev) =>
      prev.map((w) => {
        if (w.id !== itemId) return w;
        const newTotal = w.amountSaved + amount;
        const isAchieved = newTotal >= w.targetPrice;
        return {
          ...w,
          amountSaved: newTotal,
          isAchieved,
        };
      })
    );
  };

  const deleteWishlistItem = (id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWishlistItem = (id: string, updated: Partial<WishlistItem>) => {
    setWishlist((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updated } : w))
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      date: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Utility Actions
  const resetToDemoData = () => {
    setProfile(initialProfile);
    setIncomes(initialIncomes);
    setExpenses(initialExpenses);
    setLoans(initialLoans);
    setEmiPayments(initialEmiPayments);
    setSavingsGoals(initialSavingsGoals);
    setWishlist(initialWishlist);
    setNotifications(initialNotifications);
    setAuthEmail(OWNER_EMAIL);
    setIsOwnerAuthenticated(true);
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const fullBackup = {
      version: '1.0',
      owner: OWNER_EMAIL,
      exportedAt: new Date().toISOString(),
      profile,
      incomes,
      expenses,
      loans,
      emiPayments,
      savingsGoals,
      wishlist,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoneyMate_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MoneyMateContext.Provider
      value={{
        profile,
        isOwnerAuthenticated,
        authEmail,
        loginAsOwner,
        logout,
        updateProfile,
        selectedMonth,
        setSelectedMonth,
        incomes,
        expenses,
        loans,
        emiPayments,
        savingsGoals,
        wishlist,
        notifications,
        monthlyIncomeTotal,
        monthlyExpenseTotal,
        monthlyEmiCommitmentTotal,
        monthlyPlannedSavingsTotal,
        availableSpendingBalance,
        totalOutstandingDebt,
        totalAccumulatedSavings,
        annualSavingsProgressPct,
        unnecessarySpendingTotal,
        addIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addLoan,
        updateLoan,
        deleteLoan,
        recordEmiPayment,
        addSavingsGoal,
        depositToSavings,
        updateSavingsGoal,
        addWishlistItem,
        depositToWishlist,
        deleteWishlistItem,
        updateWishlistItem,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        resetToDemoData,
        exportDataJSON,
      }}
    >
      {children}
    </MoneyMateContext.Provider>
  );
};

export const useMoneyMate = () => {
  const context = useContext(MoneyMateContext);
  if (!context) {
    throw new Error('useMoneyMate must be used within a MoneyMateProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  Income,
  Expense,
  Loan,
  EmiPaymentRecord,
  SavingsGoal,
  WishlistItem,
  AppNotification,
  OnboardingData,
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
import { getCurrentMonthYear, calculateEmiSplit } from '@/lib/utils';

interface MoneyMateContextType {
  // Authentication & Profile
  profile: UserProfile;
  isOwnerAuthenticated: boolean;
  authEmail: string;
  signUp: (email: string, fullName: string, password?: string) => Promise<boolean>;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signInWithGoogle: (email?: string, fullName?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  completeOnboarding: (data: OnboardingData) => void;

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
  clearAllData: () => void;
  resetToDemoData: () => void;
  exportDataJSON: () => void;
}

const MoneyMateContext = createContext<MoneyMateContextType | null>(null);

const REGISTRY_KEY = 'moneymate_users_registry_v1';
const CURRENT_SESSION_KEY = 'moneymate_active_session_v1';

export const MoneyMateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(false);

  // Active User Profile
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  // Collections for Active User
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [emiPayments, setEmiPayments] = useState<EmiPaymentRecord[]>(initialEmiPayments);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  // Helper to load a user's isolated data
  const loadUserData = useCallback((userId: string, userProf: UserProfile) => {
    setProfile(userProf);
    try {
      const storedIncomes = localStorage.getItem(`moneymate_${userId}_incomes`);
      setIncomes(storedIncomes ? JSON.parse(storedIncomes) : []);

      const storedExpenses = localStorage.getItem(`moneymate_${userId}_expenses`);
      setExpenses(storedExpenses ? JSON.parse(storedExpenses) : []);

      const storedLoans = localStorage.getItem(`moneymate_${userId}_loans`);
      setLoans(storedLoans ? JSON.parse(storedLoans) : []);

      const storedPayments = localStorage.getItem(`moneymate_${userId}_emi_payments`);
      setEmiPayments(storedPayments ? JSON.parse(storedPayments) : []);

      const storedSavings = localStorage.getItem(`moneymate_${userId}_savings`);
      setSavingsGoals(storedSavings ? JSON.parse(storedSavings) : []);

      const storedWishlist = localStorage.getItem(`moneymate_${userId}_wishlist`);
      setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);

      const storedNotifications = localStorage.getItem(`moneymate_${userId}_notifications`);
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : []);
    } catch (e) {
      console.error('Error reading user data:', e);
    }
  }, []);

  // Initialize and check active session
  useEffect(() => {
    setIsClient(true);
    setSelectedMonth(getCurrentMonthYear());
    try {
      const activeSession = localStorage.getItem(CURRENT_SESSION_KEY);
      if (activeSession) {
        const sessionUser = JSON.parse(activeSession) as UserProfile;
        if (sessionUser && sessionUser.id) {
          loadUserData(sessionUser.id, sessionUser);
          setIsOwnerAuthenticated(true);
        }
      }
    } catch (e) {
      console.error('Error loading session:', e);
    }
  }, [loadUserData]);

  // Save changes to current user's isolated storage
  useEffect(() => {
    if (!isClient || !profile?.id || !isOwnerAuthenticated) return;
    try {
      const uid = profile.id;
      localStorage.setItem(`moneymate_${uid}_profile`, JSON.stringify(profile));
      localStorage.setItem(`moneymate_${uid}_incomes`, JSON.stringify(incomes));
      localStorage.setItem(`moneymate_${uid}_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`moneymate_${uid}_loans`, JSON.stringify(loans));
      localStorage.setItem(`moneymate_${uid}_emi_payments`, JSON.stringify(emiPayments));
      localStorage.setItem(`moneymate_${uid}_savings`, JSON.stringify(savingsGoals));
      localStorage.setItem(`moneymate_${uid}_wishlist`, JSON.stringify(wishlist));
      localStorage.setItem(`moneymate_${uid}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error persisting active user state:', e);
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
    isOwnerAuthenticated,
  ]);

  // Auth Operations
  const signUp = async (email: string, fullName: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProfile: UserProfile = {
      id: userId,
      email: cleanEmail,
      fullName: fullName || cleanEmail.split('@')[0],
      monthlySalary: 0,
      annualSavingsTarget: 0,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      isOnboarded: false, // Triggers Onboarding Wizard!
      createdAt: new Date().toISOString(),
    };

    // Save to registry
    try {
      const existingRaw = localStorage.getItem(REGISTRY_KEY);
      const registry: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
      registry.push(newProfile);
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } catch (e) {
      console.error(e);
    }

    loadUserData(userId, newProfile);
    setIsOwnerAuthenticated(true);
    return true;
  };

  const signIn = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const existingRaw = localStorage.getItem(REGISTRY_KEY);
      const registry: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
      const user = registry.find((u) => u.email.toLowerCase() === cleanEmail);

      if (user) {
        loadUserData(user.id, user);
        setIsOwnerAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const signInWithGoogle = async (email?: string, fullName?: string): Promise<boolean> => {
    const targetEmail = (email || 'Sumity9432@gmail.com').trim().toLowerCase();
    const targetName = fullName || targetEmail.split('@')[0];

    try {
      const existingRaw = localStorage.getItem(REGISTRY_KEY);
      const registry: UserProfile[] = existingRaw ? JSON.parse(existingRaw) : [];
      let user = registry.find((u) => u.email.toLowerCase() === targetEmail);

      if (!user) {
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        user = {
          id: userId,
          email: targetEmail,
          fullName: targetName,
          monthlySalary: 0,
          annualSavingsTarget: 0,
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          isOnboarded: false,
          createdAt: new Date().toISOString(),
        };
        registry.push(user);
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
      }

      loadUserData(user.id, user);
      setIsOwnerAuthenticated(true);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = () => {
    setIsOwnerAuthenticated(false);
    try {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // Complete Onboarding Wizard with Custom Baseline
  const completeOnboarding = (data: OnboardingData) => {
    const updatedProf: UserProfile = {
      ...profile,
      monthlySalary: data.monthlySalary,
      annualSavingsTarget: data.annualSavingsTarget,
      isOnboarded: true,
    };
    setProfile(updatedProf);

    // If user entered a first loan during onboarding
    if (data.firstLoan) {
      const newLoan: Loan = {
        id: `loan_${Date.now()}`,
        loanName: data.firstLoan.loanName,
        lender: data.firstLoan.lender,
        originalAmount: data.firstLoan.outstandingAmount,
        outstandingAmount: data.firstLoan.outstandingAmount,
        monthlyEmi: data.firstLoan.monthlyEmi,
        interestRate: 10.5,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2028-12-31',
        dueDateDay: data.firstLoan.dueDateDay,
        remainingInstallments: 12,
        totalInstallments: 12,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setLoans([newLoan]);
    }

    // If user entered a first wishlist goal during onboarding
    if (data.firstWishlist) {
      const newWish: WishlistItem = {
        id: `wish_${Date.now()}`,
        itemName: data.firstWishlist.itemName,
        targetPrice: data.firstWishlist.targetPrice,
        amountSaved: 0,
        targetDate: data.firstWishlist.targetDate,
        monthlyContribution: data.firstWishlist.monthlyContribution,
        priority: 'high',
        category: 'Personal Goal',
        isAchieved: false,
        createdAt: new Date().toISOString(),
      };
      setWishlist([newWish]);
    }

    // Welcome Notification
    addNotification({
      title: 'Ledger Setup Complete!',
      message: `Welcome ${profile.fullName}! Your custom monthly salary (₹${data.monthlySalary.toLocaleString('en-IN')}) and targets are active.`,
      type: 'system',
    });
  };

  // Financial Calculations for Selected Month
  const monthlyIncomeTotal = useMemo(() => {
    const monthIncomes = incomes.filter((i) => i.monthYear === selectedMonth);
    if (monthIncomes.length === 0) {
      return profile.monthlySalary || 0;
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

  // Formula: Available Spending Balance = Total Income – Expenses – EMI Commitments – Planned Savings
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
    if (!profile.annualSavingsTarget || profile.annualSavingsTarget <= 0) return 0;
    return Math.min(100, Math.round((totalAccumulatedSavings / profile.annualSavingsTarget) * 100));
  }, [totalAccumulatedSavings, profile.annualSavingsTarget]);

  const unnecessarySpendingTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(selectedMonth) && e.isUnnecessary)
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [expenses, selectedMonth]);

  // CRUD Operations
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

  const recordEmiPayment = (
    loanId: string,
    amount: number,
    dueDate: string,
    paymentDate: string = new Date().toISOString().split('T')[0]
  ) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const { principalComponent, interestComponent } = calculateEmiSplit(
      loan.outstandingAmount,
      loan.interestRate,
      amount
    );

    const newOutstanding = Math.max(0, loan.outstandingAmount - principalComponent);
    const newRemainingInstallments = Math.max(0, loan.remainingInstallments - 1);
    const newStatus = newRemainingInstallments === 0 || newOutstanding === 0 ? 'completed' : 'active';

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

    addNotification({
      title: `EMI Paid: ${loan.loanName}`,
      message: `Successfully recorded EMI of ₹${amount.toLocaleString('en-IN')}. Remaining debt: ₹${newOutstanding.toLocaleString('en-IN')}.`,
      type: 'emi_due',
      relatedEntityId: loan.id,
    });
  };

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
        return {
          ...s,
          currentAmount: newTotal,
          isCompleted: newTotal >= s.targetAmount,
        };
      })
    );
  };

  const updateSavingsGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

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
        return {
          ...w,
          amountSaved: newTotal,
          isAchieved: newTotal >= w.targetPrice,
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

  const clearAllData = () => {
    setIncomes([]);
    setExpenses([]);
    setLoans([]);
    setEmiPayments([]);
    setSavingsGoals([]);
    setWishlist([]);
    setNotifications([]);
    setProfile((prev) => ({
      ...prev,
      monthlySalary: 0,
      annualSavingsTarget: 0,
    }));

    if (profile?.id) {
      const uid = profile.id;
      localStorage.removeItem(`moneymate_${uid}_incomes`);
      localStorage.removeItem(`moneymate_${uid}_expenses`);
      localStorage.removeItem(`moneymate_${uid}_loans`);
      localStorage.removeItem(`moneymate_${uid}_emi_payments`);
      localStorage.removeItem(`moneymate_${uid}_savings`);
      localStorage.removeItem(`moneymate_${uid}_wishlist`);
      localStorage.removeItem(`moneymate_${uid}_notifications`);
    }
  };

  const resetToDemoData = () => {
    clearAllData();
  };

  const exportDataJSON = () => {
    const fullBackup = {
      version: '1.0',
      owner: profile.email,
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
    link.download = `MoneyMate_${profile.fullName || 'User'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MoneyMateContext.Provider
      value={{
        profile,
        isOwnerAuthenticated,
        authEmail: profile.email,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        updateProfile,
        completeOnboarding,
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
        clearAllData,
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

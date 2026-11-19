'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  CalendarClock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate, getDaysRemaining } from '@/lib/utils';
import { NavTab } from '@/components/layout/Sidebar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface OverviewViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenRecordEmi: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food and groceries': '#10b981', // emerald
  'Shopping': '#ec4899', // pink
  'Entertainment': '#8b5cf6', // purple
  'Travel': '#3b82f6', // blue
  'Fuel and transportation': '#f59e0b', // amber
  'Online subscriptions': '#06b6d4', // cyan
  'Gadgets and electronics': '#6366f1', // indigo
  'Personal expenses': '#14b8a6', // teal
  'Medical expenses': '#ef4444', // red
  'Miscellaneous': '#64748b', // slate
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenRecordEmi,
}) => {
  const {
    profile,
    monthlyIncomeTotal,
    monthlyExpenseTotal,
    monthlyEmiCommitmentTotal,
    monthlyPlannedSavingsTotal,
    availableSpendingBalance,
    totalOutstandingDebt,
    totalAccumulatedSavings,
    annualSavingsProgressPct,
    expenses,
    loans,
    incomes,
    selectedMonth,
  } = useMoneyMate();

  // Find nearest upcoming EMI
  const activeLoans = loans.filter((l) => l.status === 'active');
  const upcomingLoans = [...activeLoans].sort((a, b) => a.dueDateDay - b.dueDateDay);
  const nextEmi = upcomingLoans[0];

  // Category breakdown for current month
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const categoryTotals: Record<string, number> = {};
  currentMonthExpenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || '#94a3b8',
  }));

  // Bar Chart Data: Income vs Expense vs EMI vs Savings
  const comparisonData = [
    { name: 'Income', amount: monthlyIncomeTotal, fill: '#10b981' },
    { name: 'Expenses', amount: monthlyExpenseTotal, fill: '#ef4444' },
    { name: 'EMIs', amount: monthlyEmiCommitmentTotal, fill: '#f59e0b' },
    { name: 'Savings Plan', amount: monthlyPlannedSavingsTotal, fill: '#6366f1' },
  ];

  // 6-Month Trend Data (Simulated progression based on current month)
  const trendData = [
    { month: 'Jun', income: 85000, expenses: 31000, debt: 185000 },
    { month: 'Jul', income: 85000, expenses: 29000, debt: 172000 },
    { month: 'Aug', income: 90000, expenses: 34000, debt: 161000 },
    { month: 'Sep', income: 85000, expenses: 27500, debt: 153000 },
    { month: 'Oct', income: 85000, expenses: 26000, debt: 147000 },
    {
      month: 'Nov',
      income: monthlyIncomeTotal,
      expenses: monthlyExpenseTotal,
      debt: totalOutstandingDebt,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Philosophy & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 rounded-3xl border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {profile.fullName}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Centralized snapshot of your income, debts, EMIs, and savings for this month.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Expense
          </button>
          <button
            onClick={onOpenAddIncome}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Income
          </button>
          <button
            onClick={onOpenRecordEmi}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Pay EMI
          </button>
        </div>
      </div>

      {/* 8 Primary Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Income */}
        <div
          onClick={() => onNavigate('income')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Monthly Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {formatINR(monthlyIncomeTotal)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>Includes salary + incentives</span>
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Card 2: Monthly Expenses */}
        <div
          onClick={() => onNavigate('expenses')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-rose-500/50 hover:bg-zinc-900 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Monthly Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {formatINR(monthlyExpenseTotal)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span>{currentMonthExpenses.length} transactions recorded</span>
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Card 3: Available Spending Balance (Core Formula) */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-zinc-900 to-zinc-900 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                Safe To Spend
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl sm:text-2xl font-bold ${availableSpendingBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {formatINR(availableSpendingBalance)}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              After EMIs, bills & planned savings
            </p>
          </div>
        </div>

        {/* Card 4: Total Outstanding Debt */}
        <div
          onClick={() => onNavigate('loans')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-amber-500/50 hover:bg-zinc-900 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Outstanding Debt</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {formatINR(totalOutstandingDebt)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-400">
              <span>{activeLoans.length} active loans/EMIs</span>
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Card 5: Monthly EMI Commitments */}
        <div
          onClick={() => onNavigate('loans')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-amber-500/50 hover:bg-zinc-900 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Monthly EMI Commitments</span>
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 group-hover:scale-105 transition-transform">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {formatINR(monthlyEmiCommitmentTotal)}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Required monthly debt outflow
            </p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Card 6: Upcoming EMI Payment */}
        <div
          onClick={() => onNavigate('calendar')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-blue-500/50 hover:bg-zinc-900 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Next Due EMI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
              Calendar
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-zinc-200 truncate">
              {nextEmi ? nextEmi.loanName : 'No active EMI'}
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {nextEmi ? formatINR(nextEmi.monthlyEmi) : '₹0'}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {nextEmi ? `Due on ${nextEmi.dueDateDay}th of month` : 'All cleared'}
            </p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Card 7: Total Accumulated Savings */}
        <div
          onClick={() => onNavigate('savings')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-violet-500/50 hover:bg-zinc-900 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Accumulated Savings</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {formatINR(totalAccumulatedSavings)}
            </div>
            <p className="mt-1 text-[11px] text-violet-300">
              Across emergency & wealth funds
            </p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Card 8: Annual Savings Progress */}
        <div
          onClick={() => onNavigate('savings')}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Annual Savings Goal</span>
            <span className="text-xs font-bold text-emerald-400">
              {annualSavingsProgressPct}%
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold text-zinc-200">
              Target: {formatINR(profile.annualSavingsTarget)}
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, annualSavingsProgressPct)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-400">
              {formatINR(totalAccumulatedSavings)} achieved so far
            </p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Outflow Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Monthly Cash Flow Breakdown</h2>
              <p className="text-xs text-zinc-400">Income vs Expenses vs EMIs vs Savings</p>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Available: <span className="text-emerald-400 font-bold">{formatINR(availableSpendingBalance)}</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: unknown) => [formatINR(Number(val) || 0), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Donut */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white">Expense Distribution</h2>
              <span className="text-xs font-mono text-zinc-400">{formatINR(monthlyExpenseTotal)}</span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">Category-wise spending this month</p>
          </div>

          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-zinc-500">
              No expenses recorded this month
            </div>
          ) : (
            <>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [formatINR(Number(val) || 0), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-300 truncate">{item.name}</span>
                    </div>
                    <span className="text-zinc-400 font-mono shrink-0">{formatINR(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 6-Month Trend & Active Loans Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Debt Reduction & Expense Trend</h2>
              <p className="text-xs text-zinc-400">Tracking debt reduction against living expenses</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: unknown) => [formatINR(Number(val) || 0), '']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="debt"
                  name="Outstanding Debt"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Monthly Expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Debts Quick Tracker */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white">Active Loan Tracker</h2>
              <button
                onClick={() => onNavigate('loans')}
                className="text-xs text-emerald-400 hover:underline"
              >
                View all
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              {activeLoans.length} active commitments
            </p>

            <div className="space-y-3">
              {activeLoans.slice(0, 3).map((loan) => (
                <div key={loan.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200 truncate">{loan.loanName}</span>
                    <span className="text-xs font-bold text-amber-400">{formatINR(loan.monthlyEmi)}/mo</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                    <span>Due: {loan.dueDateDay}th of month</span>
                    <span>{loan.remainingInstallments} EMIs left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('calendar')}
            className="w-full mt-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors text-center"
          >
            Open Full EMI Calendar →
          </button>
        </div>
      </div>
    </div>
  );
};

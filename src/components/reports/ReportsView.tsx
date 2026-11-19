'use client';

import React, { useRef } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate, formatMonthYear, exportToCSV, OWNER_EMAIL } from '@/lib/utils';

export const ReportsView: React.FC = () => {
  const {
    profile,
    incomes,
    expenses,
    loans,
    emiPayments,
    savingsGoals,
    selectedMonth,
    monthlyIncomeTotal,
    monthlyExpenseTotal,
    monthlyEmiCommitmentTotal,
    monthlyPlannedSavingsTotal,
    availableSpendingBalance,
    totalOutstandingDebt,
    totalAccumulatedSavings,
  } = useMoneyMate();

  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const currentMonthIncomes = incomes.filter((i) => i.monthYear === selectedMonth);

  // Category totals
  const categorySummary: Record<string, number> = {};
  currentMonthExpenses.forEach((e) => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
  });

  // Annual Totals (cumulative across all records)
  const annualIncomeTotal = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const annualExpenseTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const annualEmiPaidTotal = emiPayments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportFullCSV = () => {
    const reportData = [
      {
        Metric: 'Monthly Income',
        Amount: monthlyIncomeTotal,
        Period: selectedMonth,
      },
      {
        Metric: 'Monthly Expenses',
        Amount: monthlyExpenseTotal,
        Period: selectedMonth,
      },
      {
        Metric: 'Monthly EMI Commitments',
        Amount: monthlyEmiCommitmentTotal,
        Period: selectedMonth,
      },
      {
        Metric: 'Planned Savings',
        Amount: monthlyPlannedSavingsTotal,
        Period: selectedMonth,
      },
      {
        Metric: 'Safe Available Balance',
        Amount: availableSpendingBalance,
        Period: selectedMonth,
      },
      {
        Metric: 'Total Outstanding Debt',
        Amount: totalOutstandingDebt,
        Period: 'Current',
      },
      {
        Metric: 'Total Accumulated Savings',
        Amount: totalAccumulatedSavings,
        Period: 'Current',
      },
    ];

    exportToCSV(`MoneyMate_Financial_Statement_${selectedMonth}`, reportData);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:m-0 print:space-y-4">
      {/* Top Header - Hidden during print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Financial Reports & Statements
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Generate monthly summaries, annual performance reports, and export print-ready statements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportFullCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print / PDF Statement
          </button>
        </div>
      </div>

      {/* Printable Statement Container */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Statement Header */}
        <div className="flex items-start justify-between pb-6 border-b border-zinc-800 print:border-zinc-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-400 print:text-emerald-700">₹</span>
              <h2 className="text-2xl font-bold text-white print:text-black tracking-tight">
                MoneyMate Financial Statement
              </h2>
            </div>
            <p className="text-xs text-zinc-400 print:text-zinc-600 mt-1">
              Private Ledger of {profile.fullName} ({OWNER_EMAIL})
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-zinc-400 print:text-zinc-600 block">
              Reporting Month:
            </span>
            <span className="text-sm font-bold text-white print:text-black font-mono">
              {formatMonthYear(selectedMonth)}
            </span>
            <span className="text-[10px] text-zinc-500 print:text-zinc-500 block mt-0.5">
              Timezone: Asia/Kolkata
            </span>
          </div>
        </div>

        {/* Monthly Summary Ledger */}
        <div className="my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-zinc-700 mb-3">
            1. Monthly Cashflow & Obligation Summary
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-100 print:border-zinc-300">
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 block">
                Total Income
              </span>
              <span className="text-lg font-bold text-emerald-400 print:text-emerald-700 font-mono mt-1 block">
                {formatINR(monthlyIncomeTotal)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-100 print:border-zinc-300">
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 block">
                Total Expenses
              </span>
              <span className="text-lg font-bold text-rose-400 print:text-rose-700 font-mono mt-1 block">
                {formatINR(monthlyExpenseTotal)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-100 print:border-zinc-300">
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 block">
                EMI Commitments
              </span>
              <span className="text-lg font-bold text-amber-400 print:text-amber-700 font-mono mt-1 block">
                {formatINR(monthlyEmiCommitmentTotal)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 print:bg-emerald-50 print:border-emerald-300">
              <span className="text-[11px] text-emerald-400 print:text-emerald-800 font-semibold block">
                Safe Available Balance
              </span>
              <span className="text-lg font-bold text-emerald-300 print:text-emerald-800 font-mono mt-1 block">
                {formatINR(availableSpendingBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="my-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-zinc-700 mb-3">
            2. Category-Wise Expenditure Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-950 text-zinc-400 print:bg-zinc-100 print:text-zinc-700 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Transactions</th>
                  <th className="py-2.5 px-3">Percentage of Spend</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200 font-mono text-zinc-300 print:text-zinc-800">
                {Object.entries(categorySummary).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-zinc-500">
                      No expenditure recorded for {formatMonthYear(selectedMonth)}.
                    </td>
                  </tr>
                ) : (
                  Object.entries(categorySummary).map(([cat, amount]) => {
                    const pct = monthlyExpenseTotal > 0 ? Math.round((amount / monthlyExpenseTotal) * 100) : 0;
                    const count = currentMonthExpenses.filter((e) => e.category === cat).length;
                    return (
                      <tr key={cat}>
                        <td className="py-2.5 px-3 font-sans font-medium text-zinc-100 print:text-black">
                          {cat}
                        </td>
                        <td className="py-2.5 px-3">{count}</td>
                        <td className="py-2.5 px-3">{pct}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white print:text-black">
                          {formatINR(amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debt and Savings Position */}
        <div className="my-6 pt-4 border-t border-zinc-800 print:border-zinc-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-zinc-700 mb-3">
            3. Debt Position & Cumulative Savings Target
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-100 print:border-zinc-300">
              <span className="text-zinc-400 print:text-zinc-600 block text-[11px]">
                Outstanding Borrowings Balance:
              </span>
              <span className="text-xl font-bold text-amber-400 print:text-amber-800 font-mono block mt-1">
                {formatINR(totalOutstandingDebt)}
              </span>
              <p className="text-[10px] text-zinc-500 print:text-zinc-500 mt-1">
                {loans.filter((l) => l.status === 'active').length} active borrowings being amortized.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 print:bg-zinc-100 print:border-zinc-300">
              <span className="text-zinc-400 print:text-zinc-600 block text-[11px]">
                Cumulative Accumulated Savings:
              </span>
              <span className="text-xl font-bold text-emerald-400 print:text-emerald-800 font-mono block mt-1">
                {formatINR(totalAccumulatedSavings)}
              </span>
              <p className="text-[10px] text-zinc-500 print:text-zinc-500 mt-1">
                Annual Goal: {formatINR(profile.annualSavingsTarget)} (
                {Math.round((totalAccumulatedSavings / profile.annualSavingsTarget) * 100)}% Achieved)
              </p>
            </div>
          </div>
        </div>

        {/* Statement Footer */}
        <div className="pt-6 border-t border-zinc-800 print:border-zinc-300 flex items-center justify-between text-[11px] text-zinc-500 print:text-zinc-500">
          <span>Generated by MoneyMate 1.0 • Private Financial Application</span>
          <span>Verified for Owner: {OWNER_EMAIL}</span>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  TrendingUp,
  Trash2,
  Calendar,
  Briefcase,
  Gift,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate, formatMonthYear } from '@/lib/utils';
import { IncomeType } from '@/types';

export const IncomeView: React.FC = () => {
  const {
    incomes,
    profile,
    addIncome,
    deleteIncome,
    selectedMonth,
    monthlyIncomeTotal,
    monthlyExpenseTotal,
    monthlyEmiCommitmentTotal,
    monthlyPlannedSavingsTotal,
    availableSpendingBalance,
  } = useMoneyMate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [type, setType] = useState<IncomeType>('salary');
  const [date, setDate] = useState('2026-11-19');
  const [notes, setNotes] = useState('');

  const currentMonthIncomes = incomes.filter((i) => i.monthYear === selectedMonth);

  // Annual earnings accumulator (last 12 months)
  const annualEarnings = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !sourceName) return;

    const monthYear = date.substring(0, 7);
    addIncome({
      amount: Number(amount),
      sourceName,
      type,
      date,
      monthYear,
      notes,
    });

    setAmount('');
    setSourceName('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Salary & Income Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Maintain your monthly salary, incentives, bonuses, and calculate your true safe-to-spend balance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add Income / Bonus
        </button>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Total Income ({formatMonthYear(selectedMonth)})</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {formatINR(monthlyIncomeTotal)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Base Salary + Additional Credits</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Cumulative Recorded Incomes</span>
          <div className="text-2xl font-bold text-white mt-1">
            {formatINR(annualEarnings)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Across all logged paychecks</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-zinc-900 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Available Spending Balance</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl font-bold mt-1 ${availableSpendingBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatINR(availableSpendingBalance)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Unencumbered money you can spend safely</p>
        </div>
      </div>

      {/* Automatic Calculation Blueprint Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">
            Available Spending Balance Calculation
          </h2>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Core rule: <span className="font-mono text-zinc-200">Total Income – Expenses – EMI Commitments – Planned Savings</span>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">Total Income</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block font-mono">
              +{formatINR(monthlyIncomeTotal)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">Expenses</span>
            <span className="text-sm font-bold text-rose-400 mt-1 block font-mono">
              -{formatINR(monthlyExpenseTotal)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">EMI Commitments</span>
            <span className="text-sm font-bold text-amber-400 mt-1 block font-mono">
              -{formatINR(monthlyEmiCommitmentTotal)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">Planned Savings</span>
            <span className="text-sm font-bold text-violet-400 mt-1 block font-mono">
              -{formatINR(monthlyPlannedSavingsTotal)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-emerald-400 font-semibold block">Safe Balance</span>
            <span className="text-sm font-bold text-emerald-300 mt-1 block font-mono">
              ={formatINR(availableSpendingBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Income Records History */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">
            Income History ({incomes.length} records)
          </h2>
          <span className="text-xs text-zinc-400 font-mono">Currency: INR (₹)</span>
        </div>

        <div className="divide-y divide-zinc-800 overflow-x-auto">
          {incomes.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No income entries recorded yet.
            </div>
          ) : (
            incomes.map((inc) => (
              <div key={inc.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700/60 text-emerald-400">
                    {inc.type === 'bonus' ? <Gift className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-100">{inc.sourceName}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                        {inc.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {formatDate(inc.date)}
                      </span>
                      {inc.notes && <span className="italic text-zinc-500">({inc.notes})</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      +{formatINR(inc.amount)}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">{inc.monthYear}</span>
                  </div>

                  <button
                    onClick={() => deleteIncome(inc.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Income or Incentive</h3>
            <p className="text-xs text-zinc-400 mb-4">Record salary, freelance earnings, or festive bonus.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Source / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Tech Salary, Performance Bonus"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="85000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Income Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as IncomeType)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="salary">Salary</option>
                    <option value="bonus">Bonus / Incentive</option>
                    <option value="freelance">Freelance</option>
                    <option value="investment">Investment / Dividend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Payment Date (Asia/Kolkata) *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 bonus credited to HDFC"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

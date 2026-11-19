'use client';

import React, { useState } from 'react';
import {
  PiggyBank,
  PlusCircle,
  Sparkles,
  Target,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate } from '@/lib/utils';
import { SavingsGoal } from '@/types';

export const SavingsView: React.FC = () => {
  const {
    savingsGoals,
    profile,
    updateProfile,
    addSavingsGoal,
    depositToSavings,
    totalAccumulatedSavings,
    annualSavingsProgressPct,
  } = useMoneyMate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // New Goal Fields
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [category, setCategory] = useState<SavingsGoal['category']>('Wealth Creation');

  // Annual Target Editing State
  const [isEditingAnnualTarget, setIsEditingAnnualTarget] = useState(false);
  const [newAnnualTarget, setNewAnnualTarget] = useState(String(profile.annualSavingsTarget));

  // Required monthly savings to achieve annual target of ₹2,00,000
  const remainingAnnualAmount = Math.max(0, profile.annualSavingsTarget - totalAccumulatedSavings);
  const calculatedMonthlyRequired = Math.round(remainingAnnualAmount / 12);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    addSavingsGoal({
      title,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate,
      monthlyContribution: monthlyContribution ? Number(monthlyContribution) : 0,
      category,
    });

    setIsModalOpen(false);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setMonthlyContribution('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal || !depositAmount) return;

    depositToSavings(depositModalGoal.id, Number(depositAmount));
    setDepositModalGoal(null);
    setDepositAmount('');
  };

  const handleSaveAnnualTarget = () => {
    if (Number(newAnnualTarget) > 0) {
      updateProfile({ annualSavingsTarget: Number(newAnnualTarget) });
      setIsEditingAnnualTarget(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Savings Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Build wealth, maintain an emergency cushion, and track your annual ₹2,00,000 savings roadmap.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Create Savings Bucket
        </button>
      </div>

      {/* Annual Savings Target Milestone Spotlight (Specification Highlight) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/30 via-zinc-900 to-zinc-900 border border-violet-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Annual Blueprint Target
              </span>
              <span className="text-xs text-zinc-400">Target Year: 2026</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatINR(totalAccumulatedSavings)}
              </h2>
              <span className="text-sm text-zinc-400">
                accumulated of{' '}
                <strong className="text-violet-300">
                  {formatINR(profile.annualSavingsTarget)}
                </strong>
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              To hit your annual target of {formatINR(profile.annualSavingsTarget)}, you need a sustained monthly contribution of approx{' '}
              <strong className="text-emerald-400 font-mono">
                {formatINR(calculatedMonthlyRequired)}/month
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shrink-0 w-full sm:w-48 text-center">
            <span className="text-3xl font-black text-violet-400">
              {annualSavingsProgressPct}%
            </span>
            <span className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
              Goal Completion
            </span>
            <span className="text-[10px] text-zinc-500 mt-1">
              {formatINR(remainingAnnualAmount)} remaining
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/80 rounded-full h-3 mt-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 via-teal-400 to-emerald-400 h-3 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, annualSavingsProgressPct)}%` }}
          />
        </div>
      </div>

      {/* Savings Buckets Cards */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">
          Dedicated Savings Goals & Buckets ({savingsGoals.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((goal) => {
            const pct = Math.min(
              100,
              Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg flex flex-col justify-between hover:border-violet-500/30 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{goal.title}</h3>
                        {goal.isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            COMPLETED
                          </span>
                        )}
                      </div>
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                        {goal.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Target</span>
                      <span className="text-base font-bold text-white font-mono">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="my-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-400">Current Balance:</span>
                      <span className="text-violet-400 font-bold font-mono">
                        {formatINR(goal.currentAmount)} ({pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500 block">Monthly Contribution:</span>
                      <strong className="text-zinc-200 font-mono">
                        {formatINR(goal.monthlyContribution)}/mo
                      </strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Target Date:</span>
                      <strong className="text-zinc-200">
                        {formatDate(goal.targetDate)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    Remaining: {formatINR(Math.max(0, goal.targetAmount - goal.currentAmount))}
                  </span>

                  <button
                    onClick={() => {
                      setDepositModalGoal(goal);
                      setDepositAmount(String(goal.monthlyContribution || '5000'));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Deposit Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Deposit to Savings</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Adding funds to <strong className="text-violet-400">{depositModalGoal.title}</strong>
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Deposit Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold shadow-lg shadow-violet-500/20"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Savings Bucket</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Define a dedicated target for emergency fund or long-term wealth.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Bucket Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Rainy Day, Wealth Fund"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Target Goal (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="250000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Initial Saved (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Monthly Contribution (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SavingsGoal['category'])}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Wealth Creation">Wealth Creation</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Tax Saving">Tax Saving</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
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
                  className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold shadow-lg shadow-violet-500/20"
                >
                  Save Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

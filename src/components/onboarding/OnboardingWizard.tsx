'use client';

import React, { useState } from 'react';
import {
  Wallet,
  PiggyBank,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR } from '@/lib/utils';
import { OnboardingData } from '@/types';

export const OnboardingWizard: React.FC = () => {
  const { profile, completeOnboarding } = useMoneyMate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Baseline
  const [monthlySalary, setMonthlySalary] = useState('');
  const [annualSavingsTarget, setAnnualSavingsTarget] = useState('');

  // Step 2: Loan (Optional)
  const [hasLoan, setHasLoan] = useState(false);
  const [loanName, setLoanName] = useState('');
  const [lender, setLender] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [dueDateDay, setDueDateDay] = useState('5');

  // Step 3: Wishlist (Optional)
  const [hasWishlist, setHasWishlist] = useState(false);
  const [wishlistName, setWishlistName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [wishlistDate, setWishlistDate] = useState('2026-12-31');

  const handleFinish = () => {
    const onboardingPayload: OnboardingData = {
      monthlySalary: Number(monthlySalary) || 0,
      annualSavingsTarget: Number(annualSavingsTarget) || 0,
    };

    if (hasLoan && loanName && Number(outstandingAmount) > 0) {
      onboardingPayload.firstLoan = {
        loanName,
        lender: lender || 'Bank',
        outstandingAmount: Number(outstandingAmount),
        monthlyEmi: Number(monthlyEmi) || Math.round(Number(outstandingAmount) / 12),
        dueDateDay: Number(dueDateDay) || 5,
      };
    }

    if (hasWishlist && wishlistName && Number(targetPrice) > 0) {
      const price = Number(targetPrice);
      onboardingPayload.firstWishlist = {
        itemName: wishlistName,
        targetPrice: price,
        monthlyContribution: Math.round(price / 6),
        targetDate: wishlistDate,
      };
    }

    completeOnboarding(onboardingPayload);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Header with step progress indicator */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-black flex items-center justify-center text-lg">
              ₹
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Welcome, {profile.fullName || 'User'}!</h1>
              <p className="text-xs text-zinc-400">Let&apos;s set up your custom financial profile</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Step {step} of 3
          </div>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex gap-2 my-6">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-emerald-400' : 'bg-zinc-800'}`} />
        </div>

        {/* STEP 1: Salary & Savings Baseline */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Your Income & Savings Baseline</h2>
              </div>
              <p className="text-xs text-zinc-400">
                These numbers power your real-time Available Spending Balance and annual targets.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Monthly Take-Home Salary (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Your regular primary salary credited every month.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Annual Savings Goal for 2026 (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 200000"
                    value={annualSavingsTarget}
                    onChange={(e) => setAnnualSavingsTarget(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  How much wealth you want to accumulate this year (you can leave 0 if not sure).
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Continue to Debts & EMIs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Loans & Debts (Optional) */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Active Loans & EMIs (Optional)</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Do you have any current borrowings or purchase installments to track?
              </p>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <input
                type="checkbox"
                id="loanCheck"
                checked={hasLoan}
                onChange={(e) => setHasLoan(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-900 border-zinc-700 cursor-pointer"
              />
              <label htmlFor="loanCheck" className="text-xs font-medium text-zinc-200 cursor-pointer">
                I have an active loan or EMI I want to track right now
              </label>
            </div>

            {hasLoan && (
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Loan / Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Car Loan, Phone EMI"
                      value={loanName}
                      onChange={(e) => setLoanName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Lender / Bank</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC, SBI, Bajaj"
                      value={lender}
                      onChange={(e) => setLender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Outstanding (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={outstandingAmount}
                      onChange={(e) => setOutstandingAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Monthly EMI (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 4500"
                      value={monthlyEmi}
                      onChange={(e) => setMonthlyEmi(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Due Day (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDateDay}
                      onChange={(e) => setDueDateDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md"
              >
                <span>Continue to Wishlist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Wishlist Goal (Optional) */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold text-white">Wishlist & Future Goals (Optional)</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Is there a specific purchase (PlayStation 5, smartphone, vacation) you want to plan for?
              </p>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <input
                type="checkbox"
                id="wishlistCheck"
                checked={hasWishlist}
                onChange={(e) => setHasWishlist(e.target.checked)}
                className="w-4 h-4 rounded text-violet-500 focus:ring-0 bg-zinc-900 border-zinc-700 cursor-pointer"
              />
              <label htmlFor="wishlistCheck" className="text-xs font-medium text-zinc-200 cursor-pointer">
                I want to add a target purchase goal right now
              </label>
            </div>

            {hasWishlist && (
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Item / Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony PlayStation 5, New iPhone, Goa Trip"
                    value={wishlistName}
                    onChange={(e) => setWishlistName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Estimated Cost (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 54990"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Target Date</label>
                    <input
                      type="date"
                      value={wishlistDate}
                      onChange={(e) => setWishlistDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Setup & Launch MoneyMate</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

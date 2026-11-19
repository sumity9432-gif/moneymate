'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Building2,
  Calendar,
  Percent,
  TrendingDown,
  CheckCircle2,
  Clock,
  History,
  Trash2,
  Edit2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate, calculateMonthlyEmi, calculateEmiSplit } from '@/lib/utils';
import { Loan, LoanStatus } from '@/types';

export const LoansEmiView: React.FC = () => {
  const {
    loans,
    emiPayments,
    addLoan,
    updateLoan,
    deleteLoan,
    recordEmiPayment,
    totalOutstandingDebt,
    monthlyEmiCommitmentTotal,
  } = useMoneyMate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedLoanForPay, setSelectedLoanForPay] = useState<Loan | null>(null);
  const [selectedLoanForAmortization, setSelectedLoanForAmortization] = useState<Loan | null>(null);

  // New Loan Form States
  const [loanName, setLoanName] = useState('');
  const [lender, setLender] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('2026-11-19');
  const [dueDateDay, setDueDateDay] = useState('5');
  const [totalInstallments, setTotalInstallments] = useState('24');
  const [remainingInstallments, setRemainingInstallments] = useState('24');
  const [notes, setNotes] = useState('');

  // Payment Modal States
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-11-19');
  const [dueDate, setDueDate] = useState('');

  const activeLoans = loans.filter((l) => l.status === 'active');
  const completedLoans = loans.filter((l) => l.status === 'completed');

  const openPayModal = (loan: Loan) => {
    setSelectedLoanForPay(loan);
    setPaymentAmount(String(loan.monthlyEmi));
    setPaymentDate(new Date().toISOString().split('T')[0]);
    // construct due date for current month
    const now = new Date();
    const currentDueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      loan.dueDateDay
    ).padStart(2, '0')}`;
    setDueDate(currentDueDate);
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForPay || !paymentAmount) return;

    recordEmiPayment(
      selectedLoanForPay.id,
      Number(paymentAmount),
      dueDate,
      paymentDate
    );

    setIsPayModalOpen(false);
    setSelectedLoanForPay(null);
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName || !lender || !originalAmount) return;

    const orig = Number(originalAmount);
    const out = outstandingAmount ? Number(outstandingAmount) : orig;
    const rate = Number(interestRate) || 0;
    const totInst = Number(totalInstallments) || 12;
    const remInst = remainingInstallments ? Number(remainingInstallments) : totInst;

    // auto calculate EMI if not manually typed
    const emi = monthlyEmi
      ? Number(monthlyEmi)
      : calculateMonthlyEmi(orig, rate, totInst);

    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + totInst);
    const endDateStr = end.toISOString().split('T')[0];

    addLoan({
      loanName,
      lender,
      originalAmount: orig,
      outstandingAmount: out,
      monthlyEmi: emi,
      interestRate: rate,
      startDate,
      endDate: endDateStr,
      dueDateDay: Number(dueDateDay) || 5,
      totalInstallments: totInst,
      remainingInstallments: remInst,
      status: 'active',
      notes,
    });

    setIsAddModalOpen(false);
    // Reset
    setLoanName('');
    setLender('');
    setOriginalAmount('');
    setOutstandingAmount('');
    setMonthlyEmi('');
    setInterestRate('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              EMI and Debt Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Centralized hub for loans, interest-adjusted amortization, repayment schedules & progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Loan / EMI
        </button>
      </div>

      {/* Debt Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Total Outstanding Debt</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {formatINR(totalOutstandingDebt)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Across {activeLoans.length} active borrowings
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Total Monthly EMI Burden</span>
          <div className="text-2xl font-bold text-white mt-1">
            {formatINR(monthlyEmiCommitmentTotal)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Mandatory monthly outflow</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Completed / Closed Loans</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {completedLoans.length}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Fully repaid financial milestones</p>
        </div>
      </div>

      {/* Active Loans Cards Grid */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">
          Active Loans & EMIs ({activeLoans.length})
        </h2>

        {activeLoans.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <CreditCard className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-300">No active loans or debts</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
              You are currently debt-free, or haven&apos;t added your borrowings yet. Add loans to track EMIs and interest-adjusted repayments.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md"
            >
              + Add First Loan / EMI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeLoans.map((loan) => {
            const paidPct = Math.round(
              ((loan.originalAmount - loan.outstandingAmount) / loan.originalAmount) * 100
            );
            const { interestComponent, principalComponent } = calculateEmiSplit(
              loan.outstandingAmount,
              loan.interestRate,
              loan.monthlyEmi
            );

            return (
              <div
                key={loan.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg flex flex-col justify-between hover:border-zinc-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{loan.loanName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {loan.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        Lender: <span className="text-zinc-200 font-medium">{loan.lender}</span>
                        {loan.interestRate > 0 ? (
                          <span className="ml-2 font-mono text-zinc-400 text-[11px]">
                            ({loan.interestRate}% p.a.)
                          </span>
                        ) : (
                          <span className="ml-2 px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-emerald-400">
                            0% No-Cost EMI
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Monthly EMI</span>
                      <span className="text-lg font-bold text-amber-400 font-mono">
                        {formatINR(loan.monthlyEmi)}
                      </span>
                    </div>
                  </div>

                  {/* Loan Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Original</span>
                      <span className="font-semibold text-zinc-300 font-mono">
                        {formatINR(loan.originalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Outstanding</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {formatINR(loan.outstandingAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Remaining</span>
                      <span className="font-semibold text-zinc-300">
                        {loan.remainingInstallments} / {loan.totalInstallments} EMIs
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                      <span>Repayment Progress</span>
                      <span className="font-semibold text-emerald-400 font-mono">{paidPct}% Repaid</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, paidPct))}%` }}
                      />
                    </div>
                  </div>

                  {/* Amortization Split Insight */}
                  <div className="mt-3 text-[11px] text-zinc-400 flex items-center justify-between bg-zinc-950/60 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                    <span>
                      Next Split: <strong className="text-emerald-400">₹{principalComponent.toLocaleString('en-IN')}</strong> Principal
                    </span>
                    <span>
                      <strong className="text-amber-400">₹{interestComponent.toLocaleString('en-IN')}</strong> Interest
                    </span>
                    <span className="text-zinc-500">Due {loan.dueDateDay}th</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-800">
                  <button
                    onClick={() => setSelectedLoanForAmortization(loan)}
                    className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Amortization Table
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteLoan(loan.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800"
                      title="Delete Loan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openPayModal(loan)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Record Payment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* EMI Payment History Log */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Payment & Repayment Log</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {emiPayments.length} entries recorded
          </span>
        </div>

        <div className="divide-y divide-zinc-800 overflow-x-auto">
          {emiPayments.map((pay) => (
            <div key={pay.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-200">{pay.loanName}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {pay.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                  <span>Due: {formatDate(pay.dueDate)}</span>
                  {pay.paymentDate && (
                    <span className="text-emerald-400">
                      Paid: {formatDate(pay.paymentDate)}
                    </span>
                  )}
                  {pay.notes && <span className="text-zinc-500 italic">({pay.notes})</span>}
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold text-white font-mono">
                  {formatINR(pay.amount)}
                </span>
                <span className="text-[11px] text-zinc-400 block font-mono">
                  Princ: ₹{pay.principalComponent.toLocaleString('en-IN')} | Int: ₹{pay.interestComponent.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPayModalOpen && selectedLoanForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              Record EMI Payment
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Recording payment for{' '}
              <strong className="text-amber-400">{selectedLoanForPay.loanName}</strong>. This updates
              outstanding debt according to actual principal and interest calculation.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Installment Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Actual Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Current Outstanding:</span>
                  <span className="font-mono text-white">
                    {formatINR(selectedLoanForPay.outstandingAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span className="font-mono text-amber-400">
                    {selectedLoanForPay.interestRate}% p.a.
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-zinc-800">
                  <span>Remaining after payment:</span>
                  <span className="font-mono">
                    {formatINR(
                      Math.max(
                        0,
                        selectedLoanForPay.outstandingAmount -
                          calculateEmiSplit(
                            selectedLoanForPay.outstandingAmount,
                            selectedLoanForPay.interestRate,
                            Number(paymentAmount) || 0
                          ).principalComponent
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Confirm Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Add New Loan or EMI</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter loan terms to maintain automated monthly schedules and calendar markers.
            </p>

            <form onSubmit={handleAddLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Loan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Car Loan, iPhone EMI"
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Lender / Bank *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC, Bajaj Finserv, SBI"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Original Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="100000"
                    value={originalAmount}
                    onChange={(e) => setOriginalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Current Outstanding (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Leave blank if newly started"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Auto-calculated if blank"
                    value={monthlyEmi}
                    onChange={(e) => setMonthlyEmi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Annual Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.5 (or 0 for no-cost)"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Total Tenor (Months)
                  </label>
                  <input
                    type="number"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Remaining Months
                  </label>
                  <input
                    type="number"
                    value={remainingInstallments}
                    onChange={(e) => setRemainingInstallments(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Due Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Create Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Amortization Table Modal */}
      {selectedLoanForAmortization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Amortization Schedule: {selectedLoanForAmortization.loanName}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedLoanForAmortization.lender} • {selectedLoanForAmortization.interestRate}% Interest
                </p>
              </div>
              <button
                onClick={() => setSelectedLoanForAmortization(null)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 pr-1">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Inst #</th>
                    <th className="py-2.5 px-3">EMI Amount</th>
                    <th className="py-2.5 px-3">Principal</th>
                    <th className="py-2.5 px-3">Interest</th>
                    <th className="py-2.5 px-3">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
                  {(() => {
                    const rows = [];
                    let balance = selectedLoanForAmortization.outstandingAmount;
                    const count = Math.min(selectedLoanForAmortization.remainingInstallments, 24);

                    for (let i = 1; i <= count; i++) {
                      const { principalComponent, interestComponent } = calculateEmiSplit(
                        balance,
                        selectedLoanForAmortization.interestRate,
                        selectedLoanForAmortization.monthlyEmi
                      );
                      balance = Math.max(0, balance - principalComponent);
                      rows.push(
                        <tr key={i} className="hover:bg-zinc-800/30">
                          <td className="py-2 px-3 text-zinc-500">#{i}</td>
                          <td className="py-2 px-3 font-semibold text-white">
                            {formatINR(selectedLoanForAmortization.monthlyEmi)}
                          </td>
                          <td className="py-2 px-3 text-emerald-400">
                            {formatINR(principalComponent)}
                          </td>
                          <td className="py-2 px-3 text-amber-400">
                            {formatINR(interestComponent)}
                          </td>
                          <td className="py-2 px-3 text-zinc-300">
                            {formatINR(balance)}
                          </td>
                        </tr>
                      );
                    }
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

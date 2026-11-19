'use client';

import React, { useState, useMemo } from 'react';
import {
  ReceiptText,
  PlusCircle,
  Filter,
  Search,
  Trash2,
  Calendar,
  AlertOctagon,
  Download,
  CreditCard,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate, exportToCSV } from '@/lib/utils';
import { ExpenseCategory, PaymentMethod, Expense } from '@/types';

const CATEGORIES: ExpenseCategory[] = [
  'Food and groceries',
  'Shopping',
  'Entertainment',
  'Travel',
  'Fuel and transportation',
  'Online subscriptions',
  'Gadgets and electronics',
  'Personal expenses',
  'Medical expenses',
  'Miscellaneous',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
];

export const ExpenseView: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    selectedMonth,
    monthlyExpenseTotal,
    unnecessarySpendingTotal,
  } = useMoneyMate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-11-19');
  const [category, setCategory] = useState<ExpenseCategory>('Food and groceries');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isUnnecessary, setIsUnnecessary] = useState(false);
  const [notes, setNotes] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterUnnecessaryOnly, setFilterUnnecessaryOnly] = useState(false);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Month match
      const monthMatch = e.date.startsWith(selectedMonth);
      if (!monthMatch) return false;

      // Category match
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;

      // Payment method match
      if (filterPayment !== 'all' && e.paymentMethod !== filterPayment) return false;

      // Unnecessary spend match
      if (filterUnnecessaryOnly && !e.isUnnecessary) return false;

      // Search match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = e.description.toLowerCase().includes(query);
        const matchesNotes = e.notes ? e.notes.toLowerCase().includes(query) : false;
        if (!matchesDesc && !matchesNotes) return false;
      }

      return true;
    });
  }, [
    expenses,
    selectedMonth,
    filterCategory,
    filterPayment,
    filterUnnecessaryOnly,
    searchQuery,
  ]);

  const openAddModal = () => {
    setEditingExpenseId(null);
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Food and groceries');
    setDescription('');
    setPaymentMethod('UPI');
    setIsUnnecessary(false);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setAmount(String(exp.amount));
    setDate(exp.date);
    setCategory(exp.category);
    setDescription(exp.description);
    setPaymentMethod(exp.paymentMethod);
    setIsUnnecessary(Boolean(exp.isUnnecessary));
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description) return;

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        amount: Number(amount),
        date,
        category,
        description,
        paymentMethod,
        isUnnecessary,
        notes,
      });
    } else {
      addExpense({
        amount: Number(amount),
        date,
        category,
        description,
        paymentMethod,
        isUnnecessary,
        notes,
      });
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(`MoneyMate_Expenses_${selectedMonth}`, filteredExpenses);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Expense Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Track daily living expenses, monitor category trends, and detect unnecessary spending.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Expense Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Total Monthly Spending</span>
          <div className="text-2xl font-bold text-white mt-1">
            {formatINR(monthlyExpenseTotal)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {filteredExpenses.length} transactions for this month
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Discretionary / Unnecessary</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {formatINR(unnecessarySpendingTotal)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {monthlyExpenseTotal > 0
              ? `${Math.round((unnecessarySpendingTotal / monthlyExpenseTotal) * 100)}% of total monthly spend`
              : '0%'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span className="text-xs text-zinc-400">Top Spend Category</span>
          <div className="text-lg font-bold text-emerald-400 mt-1 truncate">
            {filteredExpenses.length > 0 ? filteredExpenses[0].category : 'No data'}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">10 structured categories tracked</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Unnecessary Only Button */}
          <button
            onClick={() => setFilterUnnecessaryOnly(!filterUnnecessaryOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              filterUnnecessaryOnly
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Unnecessary Only
          </button>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">
            Expenses List ({filteredExpenses.length})
          </h2>
          <span className="text-xs text-zinc-400 font-mono">
            Sum: <span className="text-white font-bold">{formatINR(filteredExpenses.reduce((a, b) => a + b.amount, 0))}</span>
          </span>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No expenses match the selected filters or month.
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 px-3 -mx-3 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300 shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-100">
                        {exp.description}
                      </p>
                      {exp.isUnnecessary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Discretionary
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 mt-1">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px]">
                        {exp.category}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        {formatDate(exp.date)}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        via {exp.paymentMethod}
                      </span>
                      {exp.notes && (
                        <span className="text-zinc-500 italic text-[11px]">
                          • {exp.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <span className="text-sm font-bold text-rose-400 font-mono">
                    -{formatINR(exp.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(exp)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                      title="Edit Expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter expense details accurately to maintain your budget.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery run, Petrol, Netflix, Dinner"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
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
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    {PAYMENT_METHODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="Additional context or invoice details"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="unnecessaryCheck"
                  checked={isUnnecessary}
                  onChange={(e) => setIsUnnecessary(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-0 bg-zinc-900 border-zinc-700 cursor-pointer"
                />
                <label htmlFor="unnecessaryCheck" className="text-xs text-zinc-300 cursor-pointer">
                  Mark as unnecessary / impulse spend (helps track budget leaks)
                </label>
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
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-500/20"
                >
                  {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

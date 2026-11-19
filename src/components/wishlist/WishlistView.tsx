'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  PlusCircle,
  Gamepad2,
  Laptop,
  Plane,
  Smartphone,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Gift,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate, getDaysRemaining } from '@/lib/utils';
import { WishlistItem } from '@/types';

export const WishlistView: React.FC = () => {
  const {
    wishlist,
    addWishlistItem,
    depositToWishlist,
    deleteWishlistItem,
    availableSpendingBalance,
  } = useMoneyMate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositModalItem, setDepositModalItem] = useState<WishlistItem | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // New Item Fields
  const [itemName, setItemName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [amountSaved, setAmountSaved] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [priority, setPriority] = useState<WishlistItem['priority']>('high');
  const [category, setCategory] = useState('Gaming & Tech');
  const [notes, setNotes] = useState('');

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCreateWishlistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !targetPrice) return;

    const price = Number(targetPrice);
    const saved = amountSaved ? Number(amountSaved) : 0;
    const remaining = Math.max(0, price - saved);

    // Calculate approximate monthly contribution if left blank
    const days = getDaysRemaining(targetDate);
    const months = Math.max(1, Math.ceil(days / 30));
    const autoMonthly = monthlyContribution
      ? Number(monthlyContribution)
      : Math.round(remaining / months);

    addWishlistItem({
      itemName,
      targetPrice: price,
      amountSaved: saved,
      targetDate,
      monthlyContribution: autoMonthly,
      priority,
      category,
      notes,
    });

    setIsModalOpen(false);
    setItemName('');
    setTargetPrice('');
    setAmountSaved('');
    setMonthlyContribution('');
    setNotes('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalItem || !depositAmount) return;

    const added = Number(depositAmount);
    depositToWishlist(depositModalItem.id, added);

    if (depositModalItem.amountSaved + added >= depositModalItem.targetPrice) {
      triggerCelebration();
    }

    setDepositModalItem(null);
    setDepositAmount('');
  };

  const getItemIcon = (name: string, cat: string) => {
    const text = (name + ' ' + cat).toLowerCase();
    if (text.includes('playstation') || text.includes('ps5') || text.includes('game')) {
      return <Gamepad2 className="w-4 h-4 text-emerald-400" />;
    }
    if (text.includes('laptop') || text.includes('macbook') || text.includes('pc')) {
      return <Laptop className="w-4 h-4 text-cyan-400" />;
    }
    if (text.includes('phone') || text.includes('iphone')) {
      return <Smartphone className="w-4 h-4 text-blue-400" />;
    }
    if (text.includes('trip') || text.includes('vacation') || text.includes('holiday')) {
      return <Plane className="w-4 h-4 text-amber-400" />;
    }
    return <Gift className="w-4 h-4 text-violet-400" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Wishlist & Future Purchase Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Plan aspirational purchases (PS5, gadgets, travel) with real-time affordability guidance.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add Wishlist Goal
        </button>
      </div>

      {/* Affordability Engine Banner */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Smart Purchase Affordability Advisor
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Every wishlist goal calculates whether its planned savings fit inside your current safe spending balance (
              <strong className="text-emerald-400 font-mono">
                {formatINR(availableSpendingBalance)}
              </strong>
              ) without starving your essentials or delaying EMI repayments.
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wishlist.map((item) => {
          const pct = Math.min(
            100,
            Math.round((item.amountSaved / item.targetPrice) * 100)
          );
          const remainingAmount = Math.max(0, item.targetPrice - item.amountSaved);
          const daysLeft = getDaysRemaining(item.targetDate);

          // Affordability Check: Does monthlyContribution fit in availableSpendingBalance?
          const isAffordable = availableSpendingBalance >= item.monthlyContribution;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-lg flex flex-col justify-between transition-all ${
                item.isAchieved
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {getItemIcon(item.itemName, item.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {item.itemName}
                      </h3>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>

                {/* Price and Progress */}
                <div className="my-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Accumulated</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {formatINR(item.amountSaved)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block">Target Price</span>
                      <span className="text-sm font-semibold text-zinc-200 font-mono">
                        {formatINR(item.targetPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.isAchieved
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5">
                    <span>{pct}% Funded</span>
                    <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Target reached'}</span>
                  </div>
                </div>

                {/* Affordability Advisor Pill */}
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 mb-3 ${
                    item.isAchieved
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isAffordable
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {item.isAchieved ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : isAffordable ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                  )}

                  <div className="text-[11px] leading-tight">
                    {item.isAchieved ? (
                      <span className="font-bold">Afforded & Achieved! 🎉</span>
                    ) : isAffordable ? (
                      <span>
                        <strong>Safe to Save:</strong> {formatINR(item.monthlyContribution)}/mo fits in your available balance.
                      </span>
                    ) : (
                      <span>
                        <strong>Budget Tight:</strong> Monthly {formatINR(item.monthlyContribution)} exceeds safe balance.
                      </span>
                    )}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-zinc-500 italic mb-2 line-clamp-1">
                    &quot;{item.notes}&quot;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => deleteWishlistItem(item.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Remove Goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDepositModalItem(item);
                      setDepositAmount(String(item.monthlyContribution || '5000'));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    + Add Rupee Deposit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit to Wishlist Modal */}
      {depositModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Deposit for Wishlist</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Allocating savings towards <strong className="text-emerald-400">{depositModalItem.itemName}</strong>
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  Deposit & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Wishlist Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Wishlist Item</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Plan for a PlayStation 5, smartphone, gadget, or vacation.
            </p>

            <form onSubmit={handleCreateWishlistItem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Item / Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony PlayStation 5, MacBook Pro"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Target Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="54990"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Initial Amount Saved (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={amountSaved}
                    onChange={(e) => setAmountSaved(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Planned Monthly Savings (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Auto-calculated if blank"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as WishlistItem['priority'])}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gaming, Tech, Travel"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wait for festive sale before buying"
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
                  Save Wishlist Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, formatDate, formatMonthYear } from '@/lib/utils';
import { Loan, EmiPaymentRecord, Expense } from '@/types';

interface CalendarEvent {
  id: string;
  type: 'emi_due' | 'emi_paid' | 'upcoming' | 'other_bill' | 'salary';
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  day: number;
  statusText: string;
  loanId?: string;
  outstandingAmount?: number;
}

export const CalendarView: React.FC = () => {
  const {
    loans,
    emiPayments,
    expenses,
    incomes,
    recordEmiPayment,
    selectedMonth,
    setSelectedMonth,
  } = useMoneyMate();

  const [todayDateStr, setTodayDateStr] = useState<string>('2026-11-19');

  useEffect(() => {
    setTodayDateStr(new Date().toISOString().split('T')[0]);
  }, []);

  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    dayNum: number;
    events: CalendarEvent[];
  } | null>(null);

  // Month navigation
  const [yearNum, monthNum] = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return [y, m];
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    const d = new Date(yearNum, monthNum - 2, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const d = new Date(yearNum, monthNum, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  // Days in selected month
  const totalDaysInMonth = useMemo(() => {
    return new Date(yearNum, monthNum, 0).getDate();
  }, [yearNum, monthNum]);

  // First day of the week (0 = Sunday, 1 = Monday)
  const firstDayOfWeek = useMemo(() => {
    return new Date(yearNum, monthNum - 1, 1).getDay();
  }, [yearNum, monthNum]);

  // Generate calendar events for current selected month
  const monthEventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};

    // 1. Incomes / Salary on 1st or credited date
    incomes
      .filter((i) => i.date.startsWith(selectedMonth))
      .forEach((inc) => {
        const day = parseInt(inc.date.split('-')[2], 10);
        if (!map[day]) map[day] = [];
        map[day].push({
          id: inc.id,
          type: 'salary',
          title: inc.sourceName,
          amount: inc.amount,
          date: inc.date,
          day,
          statusText: 'Credit Received',
        });
      });

    // 2. Active Loans recurring on their dueDateDay
    const activeLoans = loans.filter((l) => l.status === 'active');
    activeLoans.forEach((loan) => {
      const day = Math.min(loan.dueDateDay, totalDaysInMonth);
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;

      // Check if already paid for this month
      const paymentThisMonth = emiPayments.find(
        (p) => p.loanId === loan.id && p.dueDate.startsWith(selectedMonth) && p.status === 'paid'
      );

      if (!map[day]) map[day] = [];

      if (paymentThisMonth) {
        map[day].push({
          id: paymentThisMonth.id,
          type: 'emi_paid',
          title: `${loan.loanName} (Paid)`,
          amount: paymentThisMonth.amount,
          date: dateStr,
          day,
          statusText: 'EMI Paid',
          loanId: loan.id,
          outstandingAmount: loan.outstandingAmount,
        });
      } else {
        // Calculate if upcoming (within next 5 days of current date)
        const today = new Date(todayDateStr);
        const eventDate = new Date(yearNum, monthNum - 1, day);
        const diffDays = Math.ceil(
          (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isUpcoming = diffDays >= 0 && diffDays <= 5;

        map[day].push({
          id: `emi_sched_${loan.id}_${selectedMonth}`,
          type: isUpcoming ? 'upcoming' : 'emi_due',
          title: loan.loanName,
          amount: loan.monthlyEmi,
          date: dateStr,
          day,
          statusText: isUpcoming ? 'Upcoming in 5 Days' : 'EMI Due',
          loanId: loan.id,
          outstandingAmount: loan.outstandingAmount,
        });
      }
    });

    // 3. Subscriptions / Other bills from expenses
    expenses
      .filter(
        (e) =>
          e.date.startsWith(selectedMonth) &&
          (e.category === 'Online subscriptions' || e.description.toLowerCase().includes('bill'))
      )
      .forEach((exp) => {
        const day = parseInt(exp.date.split('-')[2], 10);
        if (!map[day]) map[day] = [];
        map[day].push({
          id: exp.id,
          type: 'other_bill',
          title: exp.description,
          amount: exp.amount,
          date: exp.date,
          day,
          statusText: 'Recurring Bill',
        });
      });

    return map;
  }, [incomes, loans, emiPayments, expenses, selectedMonth, totalDaysInMonth, yearNum, monthNum]);

  const handleDayClick = (dayNum: number) => {
    const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const events = monthEventsByDay[dayNum] || [];
    setSelectedDayEvents({
      dateStr,
      dayNum,
      events,
    });
  };

  const handleQuickPayFromCalendar = (event: CalendarEvent) => {
    if (!event.loanId) return;
    recordEmiPayment(event.loanId, event.amount, event.date);
    // refresh modal
    setSelectedDayEvents(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Full Monthly EMI Calendar
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Visual calendar with color markers for upcoming EMIs, cleared payments, and bill due dates.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-2xl border border-zinc-800 shadow-inner">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white px-3 font-mono">
            {formatMonthYear(selectedMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Color System Legend (Mandatory as per specification) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
        <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
          Calendar Color System:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 shadow-sm shadow-rose-500/30" />
            <span className="text-zinc-200">Red: EMI Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm shadow-emerald-500/30" />
            <span className="text-zinc-200">Green: EMI Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500 shadow-sm shadow-amber-500/30" />
            <span className="text-zinc-200">Orange: Upcoming Payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-500 shadow-sm shadow-blue-500/30" />
            <span className="text-zinc-200">Blue: Other Financial Events</span>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6 shadow-xl">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-zinc-400 uppercase tracking-wider pb-3 border-b border-zinc-800">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[75px] sm:min-h-[105px] rounded-xl bg-zinc-950/30 p-1 sm:p-2 border border-transparent"
            />
          ))}

          {/* Days of month */}
          {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const events = monthEventsByDay[dayNum] || [];
            const isToday =
              todayDateStr === `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => handleDayClick(dayNum)}
                className={`min-h-[75px] sm:min-h-[105px] rounded-xl p-1.5 sm:p-2 border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : events.length > 0
                    ? 'bg-zinc-900 border-zinc-700/80 hover:border-zinc-500'
                    : 'bg-zinc-950/70 border-zinc-800/60 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md'
                        : 'text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {events.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>

                {/* Event Badges on calendar day */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {events.slice(0, 2).map((evt) => {
                    let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                    if (evt.type === 'emi_due') {
                      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                    } else if (evt.type === 'emi_paid') {
                      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                    } else if (evt.type === 'upcoming') {
                      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                    }

                    return (
                      <div
                        key={evt.id}
                        className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold border truncate ${badgeColor}`}
                        title={`${evt.title}: ${formatINR(evt.amount)}`}
                      >
                        <span className="hidden sm:inline">{evt.title} </span>
                        <span>{formatINR(evt.amount)}</span>
                      </div>
                    );
                  })}
                  {events.length > 2 && (
                    <div className="text-[9px] text-zinc-500 font-semibold text-center">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Drawer / Modal */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Financial Events on Day {selectedDayEvents.dayNum}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {formatDate(selectedDayEvents.dateStr)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDayEvents.events.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No payment commitments or incomes recorded on this date.
                </div>
              ) : (
                selectedDayEvents.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {evt.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Status: {evt.statusText}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {formatINR(evt.amount)}
                      </span>
                    </div>

                    {evt.outstandingAmount !== undefined && (
                      <div className="text-[11px] text-zinc-400">
                        Remaining Loan Debt:{' '}
                        <strong className="text-zinc-200">
                          {formatINR(evt.outstandingAmount)}
                        </strong>
                      </div>
                    )}

                    {evt.type !== 'emi_paid' && evt.loanId && (
                      <button
                        onClick={() => handleQuickPayFromCalendar(evt)}
                        className="w-full mt-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all"
                      >
                        Mark as Paid Now ({formatINR(evt.amount)})
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedDayEvents(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

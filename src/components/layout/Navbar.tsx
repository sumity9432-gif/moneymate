'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar as CalendarIcon,
  Menu,
  X,
  Wallet,
  LogOut,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatMonthYear, OWNER_EMAIL } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { selectedMonth, setSelectedMonth, profile, logout } = useMoneyMate();

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl"
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 shadow-lg shadow-emerald-500/20 font-black text-lg">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">MoneyMate</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                Private
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Every Rupee Under Control
            </p>
          </div>
        </div>
      </div>

      {/* Center: Month Selector */}
      <div className="flex items-center gap-1 sm:gap-2 bg-zinc-900/90 border border-zinc-800/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-2xl shadow-inner">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 px-1 sm:px-2 cursor-pointer" onClick={handleResetToCurrentMonth}>
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-400 hidden xs:block" />
          <span className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-wide select-none">
            {formatMonthYear(selectedMonth)}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Notifications & Owner Profile Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationDropdown />

        <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs font-bold text-white border border-zinc-500/40">
            {(profile.fullName || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-zinc-200">{profile.fullName}</span>
              <span className="text-[10px] text-emerald-400 font-mono">(User)</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
              {profile.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="ml-2 p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

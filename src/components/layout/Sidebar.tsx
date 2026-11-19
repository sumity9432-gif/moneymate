'use client';

import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  CreditCard,
  CalendarDays,
  PiggyBank,
  HeartHandshake,
  BarChart3,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';

export type NavTab =
  | 'overview'
  | 'income'
  | 'expenses'
  | 'loans'
  | 'calendar'
  | 'savings'
  | 'wishlist'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { logout } = useMoneyMate();
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'income' as NavTab, label: 'Income & Salary', icon: Wallet },
    { id: 'expenses' as NavTab, label: 'Expenses', icon: ReceiptText },
    { id: 'loans' as NavTab, label: 'EMIs & Debts', icon: CreditCard },
    { id: 'calendar' as NavTab, label: 'EMI Calendar', icon: CalendarDays },
    { id: 'savings' as NavTab, label: 'Savings Goals', icon: PiggyBank },
    { id: 'wishlist' as NavTab, label: 'Wishlist Planner', icon: Sparkles },
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings & Security', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950/95 backdrop-blur-xl pt-16 lg:static lg:z-auto lg:pt-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 px-3 py-4 gap-1.5 overflow-y-auto">
          <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Financial Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'calendar' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all mt-2"
          >
            <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-rose-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Bottom philosophy quote */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Core Philosophy
            </p>
            <p className="text-xs text-zinc-300 mt-1 italic">
              &quot;Every rupee should have a purpose.&quot;
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

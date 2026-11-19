'use client';

import React, { useState, Suspense } from 'react';
import { MoneyMateProvider } from '@/context/MoneyMateContext';
import { SecurityGate } from '@/components/auth/SecurityGate';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { IncomeView } from '@/components/income/IncomeView';
import { ExpenseView } from '@/components/expenses/ExpenseView';
import { LoansEmiView } from '@/components/loans/LoansEmiView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { SavingsView } from '@/components/savings/SavingsView';
import { WishlistView } from '@/components/wishlist/WishlistView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';

function MoneyMateApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick action modal triggers
  const handleOpenAddExpense = () => {
    setCurrentTab('expenses');
  };

  const handleOpenAddIncome = () => {
    setCurrentTab('income');
  };

  const handleOpenRecordEmi = () => {
    setCurrentTab('loans');
  };

  const renderActiveView = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <OverviewView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAddExpense={handleOpenAddExpense}
            onOpenAddIncome={handleOpenAddIncome}
            onOpenRecordEmi={handleOpenRecordEmi}
          />
        );
      case 'income':
        return <IncomeView />;
      case 'expenses':
        return <ExpenseView />;
      case 'loans':
        return <LoansEmiView />;
      case 'calendar':
        return <CalendarView />;
      case 'savings':
        return <SavingsView />;
      case 'wishlist':
        return <WishlistView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <OverviewView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAddExpense={handleOpenAddExpense}
            onOpenAddIncome={handleOpenAddIncome}
            onOpenRecordEmi={handleOpenRecordEmi}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-400 font-bold">
          Loading MoneyMate...
        </div>
      }
    >
      <MoneyMateProvider>
        <SecurityGate>
          <MoneyMateApp />
        </SecurityGate>
      </MoneyMateProvider>
    </Suspense>
  );
}

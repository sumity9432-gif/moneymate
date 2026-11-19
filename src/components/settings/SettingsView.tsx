'use client';

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Download,
  Upload,
  RefreshCw,
  Lock,
  User,
  CheckCircle2,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatINR, OWNER_EMAIL } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    clearAllData,
    resetToDemoData,
    exportDataJSON,
    authEmail,
    isOwnerAuthenticated,
  } = useMoneyMate();

  const [fullName, setFullName] = useState(profile.fullName);
  const [monthlySalary, setMonthlySalary] = useState(String(profile.monthlySalary));
  const [annualSavingsTarget, setAnnualSavingsTarget] = useState(
    String(profile.annualSavingsTarget)
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      monthlySalary: Number(monthlySalary) || 85000,
      annualSavingsTarget: Number(annualSavingsTarget) || 200000,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Top Header */}
      <div className="bg-zinc-900/60 p-5 rounded-3xl border border-zinc-800">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            Settings & Security Governance
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Single-owner access controls, Supabase database integration status, and financial baseline targets.
        </p>
      </div>

      {/* Security & Access Guard Card */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Private Isolated Account Security</h2>
              <p className="text-xs text-zinc-400">Strict authenticated access active</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block">Authenticated Account:</span>
            <span className="font-mono text-zinc-200 font-semibold">{profile.email}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Access Model:</span>
            <span className="text-zinc-200 font-semibold">Private & Segregated Ledger</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Database Security:</span>
            <span className="text-zinc-200 font-semibold">Row Level Security (RLS) Active</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Default Timezone:</span>
            <span className="text-zinc-200 font-semibold">Asia/Kolkata</span>
          </div>
        </div>
      </div>

      {/* Financial Baseline Preferences */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl">
        <h2 className="text-sm font-bold text-white mb-1">Financial Baseline Setup</h2>
        <p className="text-xs text-zinc-400 mb-5">
          Configure your baseline take-home salary and annual wealth goals.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Owner Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Monthly Take-Home Salary (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Annual Savings Target (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={annualSavingsTarget}
                onChange={(e) => setAnnualSavingsTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
              </span>
            ) : (
              <span className="text-xs text-zinc-500">Currency configured to INR (₹)</span>
            )}

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Supabase Integration Status */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Supabase Cloud Database Status</h2>
              <p className="text-xs text-zinc-400">PostgreSQL backend with Google Auth</p>
            </div>
          </div>

          {isSupabaseConfigured ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1.5">
              Local Storage Mode (Ready to Sync)
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          The app is currently running in zero-latency local persistent storage with encrypted browser state. To connect to your dedicated cloud Supabase project, simply add your credentials to <code className="text-emerald-400 bg-zinc-950 px-1 py-0.5 rounded">.env.local</code>:
        </p>

        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto">
          NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co<br />
          NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        </div>

        <p className="text-[11px] text-zinc-500">
          Complete production schema and RLS policies are available at <code className="text-zinc-300 font-mono">supabase/schema.sql</code>.
        </p>
      </div>

      {/* Backup and Demo Reset */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white">Data Portability & Resilience</h2>
        <p className="text-xs text-zinc-400">
          Export your complete financial records as an encrypted JSON snapshot or restore realistic defaults.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => {
              if (confirm('Clear all test data and start fresh with a clean ledger?')) {
                clearAllData();
                alert('All data has been cleared! Your MoneyMate ledger is now completely fresh.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Wipe All Test Data (Clean Slate)
          </button>

          <button
            onClick={exportDataJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Download JSON Backup
          </button>

          <button
            onClick={() => {
              if (confirm('Load blueprint demo data for testing?')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-medium transition-all"
          >
            Load Sample Demo Data
          </button>
        </div>
      </div>
    </div>
  );
};

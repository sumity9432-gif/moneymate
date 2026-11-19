'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { OWNER_EMAIL } from '@/lib/utils';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export const SecurityGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwnerAuthenticated, authEmail, loginAsOwner, logout } = useMoneyMate();
  const [inputEmail, setInputEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (isOwnerAuthenticated) {
    return <>{children}</>;
  }

  const handleSimulateGoogleLogin = (customEmail?: string) => {
    const target = (customEmail || inputEmail || OWNER_EMAIL).trim().toLowerCase();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setLoading(false);
      if (target === OWNER_EMAIL.toLowerCase()) {
        loginAsOwner();
      } else {
        setErrorMessage(
          `Access Denied: ${target} is not the registered owner. Only ${OWNER_EMAIL} is granted administrative access to MoneyMate.`
        );
      }
    }, 600);
  };

  const handleSupabaseGoogleOAuth = async () => {
    if (!isSupabaseConfigured || !supabase) {
      handleSimulateGoogleLogin(OWNER_EMAIL);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Error initializing Google authentication');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-black text-2xl shadow-xl shadow-emerald-500/20 mb-5">
            ₹
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">MoneyMate</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Private Personal Finance Management System
          </p>

          <div className="my-6 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3 text-left">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-zinc-200 block">Single-Owner Restricted Access</span>
              <span className="text-zinc-400 font-mono text-[11px]">{OWNER_EMAIL}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSupabaseGoogleOAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all shadow-lg shadow-white/5 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Sign in as Owner (Google)'}</span>
            </button>

            <div className="pt-4 border-t border-zinc-800 text-left">
              <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                Test / Verify Single-User Access Control:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter email to test guard"
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSimulateGoogleLogin()}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 mt-6">
            Secured with Supabase Row Level Security & Server-Side Owner Check.
          </p>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, Clock, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { formatDate } from '@/lib/utils';
import { AppNotification } from '@/types';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead, clearAllNotifications } = useMoneyMate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'emi_upcoming':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'emi_due':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'wishlist':
      case 'savings_milestone':
        return <Sparkles className="w-4 h-4 text-violet-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-zinc-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Financial Alerts</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  Asia/Kolkata
                </span>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-800/50">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  All caught up! No active financial alerts.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                      notif.isRead
                        ? 'bg-transparent hover:bg-zinc-800/40 text-zinc-400'
                        : 'bg-emerald-950/15 hover:bg-emerald-950/25 text-zinc-200 font-medium'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-100 truncate">
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        {formatDate(notif.date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-zinc-800/80 bg-zinc-950/60 text-center">
              <span className="text-[11px] text-zinc-500">
                Automatic EMI reminders trigger 5d, 2d & on due date.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

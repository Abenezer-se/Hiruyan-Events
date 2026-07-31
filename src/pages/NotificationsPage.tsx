import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Ticket, Lock, User, AlertCircle, Check } from 'lucide-react';
import { Notification } from '../types.js';
import { api } from '../lib/api.js';
import { EmptyState } from '../components/EmptyState.tsx';

interface NotificationsPageProps {
  onNavigate: (route: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifs = notifications.filter(n => (filter === 'unread' ? !n.read : true));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-xs text-slate-500">Real-time alerts for registrations, ticket pass updates, and check-ins.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filter === 'unread'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl hover:bg-indigo-100 transition"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You are all caught up! System alerts and ticket updates will appear here."
          icon="folder"
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) handleMarkRead(n.id);
                if (n.linkUrl) onNavigate(n.linkUrl);
              }}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-4 ${
                n.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-slate-900 dark:text-white shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                  {n.type === 'checkin' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : n.type === 'ticket' || n.type === 'registration' ? (
                    <Ticket className="h-5 w-5 text-indigo-500" />
                  ) : n.type === 'password' ? (
                    <Lock className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Bell className="h-5 w-5 text-indigo-500" />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleMarkRead(n.id);
                  }}
                  className="p-1.5 rounded-xl text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

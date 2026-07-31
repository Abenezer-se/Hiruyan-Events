import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, CheckCircle2, Ticket, Award } from 'lucide-react';
import { api } from '../lib/api.js';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAnalytics();
      setStats(res.stats || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Organizer Analytics</h1>
        <p className="text-xs text-slate-500">Track total revenue, ticket sales distribution, and attendance performance across all events.</p>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-5 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-indigo-300">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Gross Revenue</span>
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-3xl font-extrabold">${stats?.totalRevenue || 0}</p>
          <span className="text-[11px] text-indigo-300 block">From paid ticket sales</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registrations</span>
            <Ticket className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.totalRegistrations || 0}</p>
          <span className="text-[11px] text-slate-400 block">Issued ticket passes</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Events</span>
            <Award className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats?.totalEvents || 0}</p>
          <span className="text-[11px] text-slate-400 block">Active in catalog</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Check-in Rate</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats?.checkInRate || 0}%</p>
          <span className="text-[11px] text-slate-400 block">Venue attendance percentage</span>
        </div>

      </div>

      {/* Revenue & Ticket Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Performance Overview
        </h3>
        <p className="text-xs text-slate-500">
          All stats are continuously calculated dynamically from real-time database ticket registrations and event capacity tracking.
        </p>
      </div>

    </div>
  );
};

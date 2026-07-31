import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Globe,
  UserCheck,
  FileText,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { SuperAdminStats, Registration, AuditLog } from '../../types.js';

export const AdminDashboard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStats();
      setStats(res.stats);
      setRecentRegistrations(res.recentRegistrations || []);
      setRecentAuditLogs(res.recentAuditLogs || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Super Admin Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Highest Platform Authority
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Super Admin Command Center</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Full control over platform users, events, CMS content, security logs, and financial transactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/admin/cms')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Globe className="h-4 w-4" />
              Edit CMS / Website
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="text-emerald-500 font-bold">{stats?.totalOrganizers || 0} Organizers</span>
            <span>•</span>
            <span>{stats?.totalAttendees || 0} Attendees</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Events</span>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalEvents || 0}</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="text-indigo-500 font-bold">{stats?.publishedEvents || 0} Published</span>
            <span>•</span>
            <span>{stats?.upcomingEvents || 0} Upcoming</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ticket Sales</span>
            <Ticket className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalTicketSales || 0}</p>
          <p className="text-[10px] text-slate-500">Across all platform events</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${(stats?.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" /> System Status: Optimal
          </p>
        </div>
      </div>

      {/* Quick Admin Actions Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Quick Super Admin Shortcuts
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('/admin/users')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            Manage Users & Status
          </button>
          <button
            onClick={() => onNavigate('/admin/events')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            Moderate Events
          </button>
          <button
            onClick={() => onNavigate('/admin/sponsors')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            Sponsors & Partners
          </button>
          <button
            onClick={() => onNavigate('/admin/audit-logs')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Grid of Recent Transactions & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Platform Registrations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ticket className="h-4 w-4 text-emerald-500" />
              Recent Ticket Registrations
            </h2>
            <button
              onClick={() => onNavigate('/admin/reports')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              View Reports <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentRegistrations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No registrations logged yet.</p>
            ) : (
              recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{reg.attendeeName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{reg.eventTitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      ${reg.ticketPrice || 0}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(reg.registeredAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Platform Audit Stream
            </h2>
            <button
              onClick={() => onNavigate('/admin/audit-logs')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              Full Audit Logs <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No audit activity logged.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {log.userName} ({log.userRole})
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

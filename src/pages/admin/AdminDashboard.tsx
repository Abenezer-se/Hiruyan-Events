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
  FolderTree,
  UserPlus,
  FolderPlus,
  PlusCircle,
  Tag,
  Award,
  BarChart2,
  Settings,
  Lock,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { SuperAdminStats, Registration, AuditLog, UserRole } from '../../types.js';

export const AdminDashboard: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Modal States for Add User & Add Category directly on Admin Dashboard
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('attendee');

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminUser({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        fullName: newFullName,
        role: newRole,
        status: 'active',
      });
      setMessage({ type: 'success', text: `User "${newFullName}" created successfully!` });
      setShowAddUserModal(false);
      setNewUsername('');
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create user' });
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCategory({
        name: catName,
        description: catDescription,
      });
      setMessage({ type: 'success', text: `Category "${catName}" created successfully!` });
      setShowAddCategoryModal(false);
      setCatName('');
      setCatDescription('');
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create category' });
    }
  };

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
      {/* Top Banner Header with Quick Action Buttons */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              Highest Platform Authority (Super Admin)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Command Center
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              As Super Admin, you hold full authority across all modules: create events, manage users, add categories, configure CMS pages, track revenue, and monitor security logs.
            </p>
          </div>

          {/* Primary Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('/dashboard/create-event')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Event</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </button>

            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Add Category</span>
            </button>

            <button
              onClick={() => onNavigate('/admin/cms')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Globe className="h-4 w-4" />
              <span>CMS Builder</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metric Telemetry Grid */}
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

      {/* Admin Modules Navigation Hub */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-500" />
          Super Admin Workspace Shortcuts
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigate('/admin/users')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 transition text-left space-y-1 group"
          >
            <Users className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Users & Roles</h3>
            <p className="text-[10px] text-slate-500">Manage all accounts</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/categories')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-violet-500/50 transition text-left space-y-1 group"
          >
            <FolderTree className="h-5 w-5 text-violet-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Categories</h3>
            <p className="text-[10px] text-slate-500">Add & edit categories</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/events')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500/50 transition text-left space-y-1 group"
          >
            <Calendar className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Events Moderation</h3>
            <p className="text-[10px] text-slate-500">Approve & feature events</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/cms')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 transition text-left space-y-1 group"
          >
            <Globe className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">CMS & Pages</h3>
            <p className="text-[10px] text-slate-500">Website & landing pages</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/coupons')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500/50 transition text-left space-y-1 group"
          >
            <Tag className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Coupons</h3>
            <p className="text-[10px] text-slate-500">Discounts & promos</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/sponsors')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 transition text-left space-y-1 group"
          >
            <Award className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Sponsors</h3>
            <p className="text-[10px] text-slate-500">Partners & logos</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/reports')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500/50 transition text-left space-y-1 group"
          >
            <BarChart2 className="h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Reports</h3>
            <p className="text-[10px] text-slate-500">Analytics & sales</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/audit-logs')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/50 transition text-left space-y-1 group"
          >
            <FileText className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Audit Logs</h3>
            <p className="text-[10px] text-slate-500">System event trails</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/security-logs')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-rose-500/50 transition text-left space-y-1 group"
          >
            <Lock className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Security Logs</h3>
            <p className="text-[10px] text-slate-500">Auth & IP records</p>
          </button>

          <button
            onClick={() => onNavigate('/admin/settings')}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-400 transition text-left space-y-1 group"
          >
            <Settings className="h-5 w-5 text-slate-400 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Settings</h3>
            <p className="text-[10px] text-slate-500">Platform configs</p>
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

      {/* QUICK MODAL 1: ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-500" />
                Add New User Account
              </h2>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. abebe"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="attendee">Attendee</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. abebe@hiruyan.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK MODAL 2: ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-violet-500" />
                Add Event Category
              </h2>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Cultural & Music Festival"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Short description of this event category..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

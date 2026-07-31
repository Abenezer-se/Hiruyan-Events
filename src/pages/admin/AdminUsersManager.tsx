import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Key,
  Trash2,
  RefreshCw,
  Award,
  UserX,
  UserCheck,
  MoreVertical,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { User, UserRole, UserStatus } from '../../types.js';

export const AdminUsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New user modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('attendee');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'prefer_not_to_say'>('male');

  // Delete user modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Password reset modal
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPasswordText, setResetPasswordText] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      setUsers(res.users);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminUser({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        fullName: newFullName,
        role: newRole,
        gender: newGender,
        status: 'active',
      });
      setMessage({ type: 'success', text: `Created user ${newFullName} successfully` });
      setShowAddModal(false);
      setNewUsername('');
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      loadUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Create user failed' });
    }
  };

  const handleUpdateStatus = async (id: string, status: UserStatus) => {
    try {
      await api.updateAdminUser(id, { status });
      setMessage({ type: 'success', text: `User status changed to ${status}` });
      loadUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Status update failed' });
    }
  };

  const handleToggleVerified = async (user: User) => {
    try {
      await api.updateAdminUser(user.id, { verified: !user.verified });
      setMessage({ type: 'success', text: `Organizer verification status updated` });
      loadUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Verification update failed' });
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !resetPasswordText) return;
    try {
      await api.resetAdminUserPassword(resetUserId, resetPasswordText);
      setMessage({ type: 'success', text: 'User password reset successfully' });
      setResetUserId(null);
      setResetPasswordText('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Password reset failed' });
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteAdminUser(deleteTargetUser.id);
      setMessage({ type: 'success', text: res.message || `User "${deleteTargetUser.name}" permanently deleted from database.` });
      setDeleteTargetUser(null);
      await loadUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete user account' });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" />
            User & Role Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full authority over user accounts, permissions, organizer verification, and status controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create New User</span>
        </button>
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

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="all">All Roles</option>
            <option value="admin">Super Admins</option>
            <option value="organizer">Organizers</option>
            <option value="attendee">Attendees</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <button
            onClick={loadUsers}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Gender</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Verified</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading users list...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No users match search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {u.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {u.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold uppercase text-[10px]">
                          Super Admin
                        </span>
                      ) : u.role === 'organizer' ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px]">
                          Organizer
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                          Attendee
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300 capitalize font-medium">
                      {u.gender || 'neutral'}
                    </td>

                    <td className="p-3.5">
                      {u.status === 'active' || !u.status ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : u.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          <AlertTriangle className="h-3 w-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                          <XCircle className="h-3 w-3" /> Banned
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleVerified(u)}
                        className={`p-1 rounded-lg border transition ${
                          u.verified
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                        title={u.verified ? 'Organizer Verified' : 'Click to Verify Organizer'}
                      >
                        <Award className="h-4 w-4" />
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.status === 'active' || !u.status ? (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'suspended')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                            title="Suspend User"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'active')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                            title="Activate User"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setResetUserId(u.id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTargetUser({ id: u.id, name: u.fullName, email: u.email })}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Delete User Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" /> Reset User Password
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                New Password
              </label>
              <input
                type="text"
                placeholder="Enter new password (min 6 chars)..."
                value={resetPasswordText}
                onChange={(e) => setResetPasswordText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetUserId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-500" /> Create Platform User
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="attendee">Attendee</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="male">Male 👨</option>
                    <option value="female">Female 👩</option>
                    <option value="prefer_not_to_say">Neutral 🧑</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Delete User Account</h3>
                <p className="text-xs text-slate-500">Permanent Database Action</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p><span className="font-bold text-slate-900 dark:text-white">User Name:</span> {deleteTargetUser.name}</p>
              <p><span className="font-bold text-slate-900 dark:text-white">Email:</span> {deleteTargetUser.email}</p>
              <p><span className="font-bold text-slate-900 dark:text-white">ID:</span> <code className="font-mono text-[10px]">{deleteTargetUser.id}</code></p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete this user? This action will erase their account profile, tickets, and platform access from the database.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting User...' : 'Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

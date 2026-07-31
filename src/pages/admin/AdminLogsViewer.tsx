import React, { useEffect, useState } from 'react';
import { FileText, Lock, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { AuditLog, SecurityLog } from '../../types.js';

export const AdminLogsViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'security'>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([api.getAuditLogs(), api.getSecurityLogs()]);
      setAuditLogs(aRes.auditLogs || []);
      setSecurityLogs(sRes.securityLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-500" />
            Security & Audit Trail Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking of all platform administrative actions, security login attempts, and policy enforcement.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Administrative Audit Logs ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'security' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Lock className="h-3.5 w-3.5" /> Security Telemetry Logs ({securityLogs.length})
        </button>
      </div>

      {activeTab === 'audit' ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No audit logs recorded.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{log.userName}</td>
                      <td className="p-3.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Identifier / Email</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {securityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No security logs recorded.
                    </td>
                  </tr>
                ) : (
                  securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{log.email}</td>
                      <td className="p-3.5">
                        {log.eventType === 'login_success' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Login Success
                          </span>
                        ) : log.eventType === 'account_suspended' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <AlertTriangle className="h-3.5 w-3.5" /> Account Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                            <AlertTriangle className="h-3.5 w-3.5" /> Auth Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{log.userAgent || 'Mozilla/5.0'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

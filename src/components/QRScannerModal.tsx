import React, { useState } from 'react';
import { X, QrCode, Loader2, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { api } from '../lib/api.js';
import { Registration } from '../types.js';

interface QRScannerModalProps {
  eventId?: string;
  onClose: () => void;
  onSuccess: (reg: Registration) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  eventId,
  onClose,
  onSuccess,
}) => {
  const [ticketInput, setTicketInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReg, setSuccessReg] = useState<Registration | null>(null);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessReg(null);

    try {
      const res = await api.qrCheckIn(ticketInput.trim(), eventId);
      setSuccessReg(res.registration);
      onSuccess(res.registration);
      setTicketInput('');
    } catch (err: any) {
      setErrorMsg(err.message || 'QR Scan verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">Live Ticket QR Check-In</h2>
              <p className="text-xs text-slate-500">Scan or enter ticket code to validate entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ticket Number or QR Code Payload
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. HIRU-482910 or paste scanned payload"
                value={ticketInput}
                onChange={e => setTicketInput(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !ticketInput.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Ticket...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Validate & Check In</span>
              </>
            )}
          </button>
        </form>

        {/* Success Alert Card */}
        {successReg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Check-in Confirmed!
              </p>
              <p className="text-emerald-700 dark:text-emerald-300">
                Attendee: <strong>{successReg.userName}</strong> ({successReg.ticketTypeName})
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                Ticket #{successReg.ticketNumber} • Event: {successReg.eventTitle}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert Card */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3 animate-in zoom-in-95 duration-200">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-rose-900 dark:text-rose-200">Scan Verification Error</p>
              <p className="text-rose-700 dark:text-rose-300">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

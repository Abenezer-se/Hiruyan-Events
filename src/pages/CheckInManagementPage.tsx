import React, { useState, useEffect } from 'react';
import { QrCode, Search, CheckCircle2, AlertCircle, RefreshCw, Loader2, Users } from 'lucide-react';
import { Event, Registration } from '../types.js';
import { api } from '../lib/api.js';
import { QRScannerModal } from '../components/QRScannerModal.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

export const CheckInManagementPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual code input
  const [manualTicketInput, setManualTicketInput] = useState('');
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Scanner Modal
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    loadMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventData(selectedEventId);
    }
  }, [selectedEventId]);

  const loadMyEvents = async () => {
    try {
      const res = await api.getOrganizerEvents();
      setEvents(res.events || []);

      const params = new URLSearchParams(window.location.search);
      const urlEventId = params.get('eventId');
      if (urlEventId && res.events.some(e => e.id === urlEventId)) {
        setSelectedEventId(urlEventId);
      } else if (res.events.length > 0) {
        setSelectedEventId(res.events[0].id);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const loadEventData = async (eventId: string) => {
    setIsLoading(true);
    try {
      const res = await api.getEventAttendees(eventId);
      setAttendees(res.attendees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketInput.trim()) return;

    setIsVerifyingManual(true);
    setVerifyMessage(null);

    try {
      const payload = manualTicketInput.trim();
      const res = await api.verifyCheckIn(payload);

      setVerifyMessage({
        type: 'success',
        text: `SUCCESS! Ticket ${res.registration.ticketNumber} verified for ${res.registration.userName}!`,
      });
      setManualTicketInput('');
      loadEventData(selectedEventId);

    } catch (err: any) {
      setVerifyMessage({
        type: 'error',
        text: err.message || 'Verification failed: invalid or duplicate ticket.',
      });
    } finally {
      setIsVerifyingManual(false);
    }
  };

  const checkedInCount = attendees.filter(a => a.checkInStatus === 'checked_in').length;
  const pendingCount = attendees.length - checkedInCount;
  const percentage = attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Live Event Check-In</h1>
          <p className="text-xs text-slate-500">Scan QR passes or manually verify ticket codes at the door.</p>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Event:</span>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate"
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="Create an event first to perform venue check-ins."
          icon="event"
        />
      ) : (
        <div className="space-y-6">
          
          {/* Live Check-In Metrics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{attendees.length}</p>
            </div>

            <div className="p-5 bg-emerald-500 text-white rounded-3xl shadow-lg space-y-1">
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Checked In</span>
              <p className="text-2xl font-extrabold">{checkedInCount}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Entrance</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{pendingCount}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-in Rate</span>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{percentage}%</p>
            </div>

          </div>

          {/* Action Trigger Box: Camera Scanner + Code Entry */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/60 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 uppercase border border-indigo-400/30">
                  Door Verification System
                </span>
                <h2 className="text-xl font-extrabold">Scan Attendee Ticket Pass</h2>
                <p className="text-xs text-slate-300">Use live device camera QR scanner or enter 8-character ticket code.</p>
              </div>

              <button
                onClick={() => setShowScanner(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2.5 shrink-0"
              >
                <QrCode className="h-5 w-5" />
                <span>Launch Camera QR Scanner</span>
              </button>
            </div>

            {/* Manual Verification Form */}
            <form onSubmit={handleManualVerify} className="space-y-3 pt-2 border-t border-indigo-800/60">
              <label className="text-xs font-semibold text-slate-200 block">
                Or Type Ticket Code (e.g., TKT-8F2A9B1C):
              </label>

              <div className="flex gap-2 max-w-xl">
                <input
                  type="text"
                  value={manualTicketInput}
                  onChange={e => setManualTicketInput(e.target.value)}
                  placeholder="Enter Ticket Number or payload..."
                  className="flex-1 px-4 py-2.5 text-xs font-mono bg-slate-950/80 border border-indigo-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  disabled={isVerifyingManual}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                >
                  {isVerifyingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Verify Ticket</span>
                </button>
              </div>

              {verifyMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  verifyMessage.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                }`}>
                  {verifyMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
                  <span>{verifyMessage.text}</span>
                </div>
              )}
            </form>
          </div>

          {/* Checked-in Log List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Entrance Log
            </h3>

            {attendees.filter(a => a.checkInStatus === 'checked_in').length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No attendees have checked in yet for this event.</p>
            ) : (
              <div className="space-y-2">
                {attendees
                  .filter(a => a.checkInStatus === 'checked_in')
                  .map(a => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{a.userName}</p>
                          <p className="text-[11px] font-mono text-slate-500">{a.ticketNumber} ({a.ticketTypeName})</p>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString() : 'Checked In'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onSuccessCheckIn={() => {
            loadEventData(selectedEventId);
          }}
        />
      )}
    </div>
  );
};

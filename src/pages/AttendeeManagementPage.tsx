import React, { useState, useEffect } from 'react';
import { Users, Search, Download, Printer, CheckCircle2, XCircle, Filter, FileText, QrCode } from 'lucide-react';
import { Registration, Event } from '../types.js';
import { api } from '../lib/api.js';
import { EmptyState } from '../components/EmptyState.tsx';

export const AttendeeManagementPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [checkInFilter, setCheckInFilter] = useState<string>('all');

  useEffect(() => {
    loadMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadAttendees(selectedEventId);
    }
  }, [selectedEventId]);

  const loadMyEvents = async () => {
    try {
      const res = await api.getOrganizerEvents();
      setEvents(res.events || []);

      // Parse eventId from URL if present
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

  const loadAttendees = async (eventId: string) => {
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

  const handleManualToggleCheckIn = async (reg: Registration) => {
    const nextStatus = reg.checkInStatus === 'checked_in' ? 'not_checked_in' : 'checked_in';
    try {
      const res = await api.manualCheckIn(reg.id, nextStatus);
      setAttendees(prev => prev.map(a => (a.id === reg.id ? res.registration : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (attendees.length === 0) return;

    const headers = ['Ticket Number', 'Attendee Name', 'Email', 'Phone', 'Ticket Type', 'Price', 'Payment Status', 'Check-In Status', 'Registered Date'];
    const rows = attendees.map(a => [
      a.ticketNumber,
      `"${a.userName}"`,
      a.userEmail,
      a.userPhone || '',
      `"${a.ticketTypeName}"`,
      a.ticketPrice,
      a.paymentStatus,
      a.checkInStatus,
      new Date(a.registeredAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees-${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = !searchQuery ||
      a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment = paymentFilter === 'all' || a.paymentStatus === paymentFilter;
    const matchesCheckIn = checkInFilter === 'all' || a.checkInStatus === checkInFilter;

    return matchesSearch && matchesPayment && matchesCheckIn;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Attendee Management</h1>
          <p className="text-xs text-slate-500">Search attendees, manage payment & check-in statuses, and export CSV/PDF reports.</p>
        </div>

        {/* Event Select Dropdown */}
        {events.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Select Event:</span>
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
          description="Create an event first to start accepting registrations and managing attendees."
          icon="event"
        />
      ) : (
        <div className="space-y-4">
          
          {/* Controls & Export Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 print:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search attendee name, email, ticket code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={exportCSV}
                  disabled={attendees.length === 0}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  disabled={attendees.length === 0}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-200 transition flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print List</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Payment:</span>
                <select
                  value={paymentFilter}
                  onChange={e => setPaymentFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="free">Free</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Check-In:</span>
                <select
                  value={checkInFilter}
                  onChange={e => setCheckInFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Attendance</option>
                  <option value="checked_in">Checked In</option>
                  <option value="not_checked_in">Not Checked In</option>
                </select>
              </div>

              <span className="text-slate-400 ml-auto">
                Showing <strong>{filteredAttendees.length}</strong> of <strong>{attendees.length}</strong> attendees
              </span>
            </div>
          </div>

          {/* Attendee Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading attendee records...</div>
            ) : filteredAttendees.length === 0 ? (
              <EmptyState
                title="No Attendees Found"
                description="No attendee registrations match the current search filters."
                icon="folder"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3.5 px-4">Attendee</th>
                      <th className="py-3.5 px-4">Ticket Pass</th>
                      <th className="py-3.5 px-4">Tier Price</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Check-In Status</th>
                      <th className="py-3.5 px-4 text-right print:hidden">Manual Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {filteredAttendees.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{a.userName}</p>
                          <p className="text-[11px] text-slate-500">{a.userEmail}</p>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold">{a.ticketNumber}</span>
                          <span className="text-[11px] block text-slate-400 font-sans">{a.ticketTypeName}</span>
                        </td>

                        <td className="py-3 px-4 font-semibold">
                          {a.ticketPrice === 0 ? 'Free' : `$${a.ticketPrice}`}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.paymentStatus === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          }`}>
                            {a.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {a.checkInStatus === 'checked_in' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" /> Checked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
                              <XCircle className="h-4 w-4 text-slate-300" /> Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right print:hidden">
                          <button
                            onClick={() => handleManualToggleCheckIn(a)}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] transition ${
                              a.checkInStatus === 'checked_in'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            {a.checkInStatus === 'checked_in' ? 'Undo Check-In' : 'Mark Checked-In'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

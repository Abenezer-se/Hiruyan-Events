import React, { useState, useEffect } from 'react';
import { CalendarCheck, QrCode, Navigation, History, Ticket, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Registration } from '../types.js';
import { api } from '../lib/api.js';
import { QRModal } from '../components/QRModal.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

export const RegisteredEventsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedPass, setSelectedPass] = useState<Registration | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyTickets();
      setRegistrations(res.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();
  const upcomingRegs = registrations.filter(r => new Date(r.eventDate) >= now);
  const pastRegs = registrations.filter(r => new Date(r.eventDate) < now);

  const displayedList = activeTab === 'upcoming' ? upcomingRegs : pastRegs;

  const openDirections = (reg: Registration) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${reg.eventLatitude},${reg.eventLongitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Registered Events</h1>
          <p className="text-xs text-slate-500">View and manage your upcoming event registrations & ticket passes.</p>
        </div>

        {/* Tab Switch */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Upcoming ({upcomingRegs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'past'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Past History ({pastRegs.length})</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <EmptyState
          title={activeTab === 'upcoming' ? 'No Upcoming Event Registrations' : 'No Past Events'}
          description={
            activeTab === 'upcoming'
              ? 'You are not registered for any upcoming events. Explore the event catalog to reserve tickets!'
              : 'You have no historical event registrations.'
          }
          icon="ticket"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedList.map(reg => (
            <div
              key={reg.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-indigo-500 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                    {reg.ticketTypeName}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    #{reg.ticketNumber}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                  {reg.eventTitle}
                </h3>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>{new Date(reg.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{reg.eventVenue}, {reg.eventCity}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => openDirections(reg)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Navigation className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Directions</span>
                </button>

                <button
                  onClick={() => setSelectedPass(reg)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <QrCode className="h-4 w-4" />
                  <span>QR Ticket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPass && (
        <QRModal registration={selectedPass} onClose={() => setSelectedPass(null)} />
      )}
    </div>
  );
};

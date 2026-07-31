import React, { useState, useEffect } from 'react';
import { Ticket, QrCode, Navigation, Calendar, MapPin, Printer } from 'lucide-react';
import { Registration } from '../types.js';
import { api } from '../lib/api.js';
import { QRModal } from '../components/QRModal.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

export const MyTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMyTickets();
      setTickets(res.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Tickets</h1>
        <p className="text-xs text-slate-500">Access and print your event passes with QR codes for fast venue entrance.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No Tickets Found"
          description="You don't have any registered event passes yet. Browse upcoming events to claim your ticket!"
          icon="ticket"
        />
      ) : (
        <div className="space-y-4">
          {tickets.map(tkt => (
            <div
              key={tkt.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-500 transition"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Ticket className="h-8 w-8" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] rounded-full uppercase">
                      {tkt.ticketTypeName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      #{tkt.ticketNumber}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {tkt.eventTitle}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500 inline" />
                    {new Date(tkt.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => setSelectedTicket(tkt)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <QrCode className="h-4 w-4" />
                  <span>View Ticket & QR</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <QRModal registration={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  );
};

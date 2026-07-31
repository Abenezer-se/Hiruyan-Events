import React, { useState, useEffect } from 'react';
import { Ticket, CalendarCheck, Heart, Bell, PlusCircle, ArrowRight, User as UserIcon, QrCode, Sparkles } from 'lucide-react';
import { User, Registration, Event } from '../types.js';
import { api } from '../lib/api.js';
import { EventCard } from '../components/EventCard.tsx';

interface UserDashboardProps {
  user: User;
  onNavigate: (route: string) => void;
  onSelectEvent: (event: Event) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onNavigate,
  onSelectEvent,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [regsRes, favsRes] = await Promise.all([
        api.getMyTickets(),
        api.getFavorites(),
      ]);
      setRegistrations(regsRes.registrations || []);
      setFavoriteEvents(favsRes.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingRegistrations = registrations.filter(
    r => new Date(r.eventDate).getTime() >= new Date().getTime()
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-800/50">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.fullName}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/30"
            />
            <div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 uppercase">
                {user.role} Dashboard
              </span>
              <h1 className="text-2xl font-extrabold mt-1">
                Welcome back, {user.fullName}!
              </h1>
              <p className="text-xs text-slate-300">
                Manage your registered event passes, tickets, preferences, and notifications.
              </p>
            </div>
          </div>

          {(user.role === 'organizer' || user.role === 'admin') && (
            <button
              onClick={() => onNavigate('/dashboard/create-event')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div
          onClick={() => onNavigate('/dashboard/registered')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500 transition cursor-pointer flex items-center gap-4"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Upcoming Registrations</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {upcomingRegistrations.length}
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('/dashboard/tickets')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500 transition cursor-pointer flex items-center gap-4"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">My Total Tickets</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {registrations.length}
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('/dashboard/favorites')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-500 transition cursor-pointer flex items-center gap-4"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Saved Favorites</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {favoriteEvents.length}
            </p>
          </div>
        </div>

      </div>

      {/* Upcoming Event Passes Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Upcoming Event Passes
          </h2>
          <button
            onClick={() => onNavigate('/dashboard/registered')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All Passes →
          </button>
        </div>

        {upcomingRegistrations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p>You haven't registered for any upcoming events yet.</p>
            <button
              onClick={() => onNavigate('/events')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs inline-block"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingRegistrations.slice(0, 3).map(reg => (
              <div
                key={reg.id}
                onClick={() => onNavigate('/dashboard/tickets')}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {reg.ticketTypeName}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {reg.eventTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(reg.eventDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {reg.eventVenue}, {reg.eventCity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    #{reg.ticketNumber}
                  </span>
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
                    View Pass
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

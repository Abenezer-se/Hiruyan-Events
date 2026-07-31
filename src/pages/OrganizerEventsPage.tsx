import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, Edit3, Copy, Trash2, Users, QrCode, Eye, Globe, Lock } from 'lucide-react';
import { Event } from '../types.js';
import { api } from '../lib/api.js';
import { EmptyState } from '../components/EmptyState.tsx';

interface OrganizerEventsPageProps {
  onNavigate: (route: string) => void;
  onSelectEvent: (event: Event) => void;
}

export const OrganizerEventsPage: React.FC<OrganizerEventsPageProps> = ({
  onNavigate,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrganizerEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateEvent(id);
      loadMyEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (event: Event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateEvent(event.id, { status: newStatus });
      setEvents(prev => prev.map(e => (e.id === event.id ? { ...e, status: newStatus } : e)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Published Events</h1>
          <p className="text-xs text-slate-500">Manage, edit, duplicate, or inspect attendee registrations for your events.</p>
        </div>

        <button
          onClick={() => onNavigate('/dashboard/create-event')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-2 self-start"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(n => (
            <div key={n} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No Organized Events Found"
          description="You haven't created any events yet. Host your first event to start accepting registrations!"
          actionText="Create First Event"
          onAction={() => onNavigate('/dashboard/create-event')}
          icon="event"
        />
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-indigo-500 transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => handleTogglePublish(event)}
                      className={`px-2.5 py-0.5 font-bold text-[10px] rounded-full uppercase cursor-pointer ${
                        event.status === 'published'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                      title="Click to toggle status"
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-slate-400">• {event.category}</span>
                  </div>

                  <h3
                    onClick={() => onSelectEvent(event)}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 transition cursor-pointer"
                  >
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {new Date(event.startDate).toLocaleDateString()} • {event.venueName}, {event.city}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                <button
                  onClick={() => onNavigate(`/dashboard/attendees?eventId=${event.id}`)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Attendees ({event.registeredCount || 0})</span>
                </button>

                <button
                  onClick={() => onNavigate(`/dashboard/check-in?eventId=${event.id}`)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Check-In</span>
                </button>

                <button
                  onClick={() => onNavigate(`/dashboard/edit-event/${event.id}`)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Edit Event"
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDuplicate(event.id)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Duplicate Event"
                >
                  <Copy className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition"
                  title="Delete Event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

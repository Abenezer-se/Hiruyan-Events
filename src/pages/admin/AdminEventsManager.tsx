import React, { useEffect, useState } from 'react';
import { Calendar, Search, CheckCircle2, XCircle, Star, Trash2, RefreshCw, Eye, Tag } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Event } from '../../types.js';

export const AdminEventsManager: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleTogglePublish = async (event: Event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateEvent(event.id, { status: newStatus });
      loadEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    try {
      await api.updateEvent(event.id, { featured: !event.featured });
      loadEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      await api.deleteEvent(id);
      loadEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredEvents = events.filter((e) => {
    const locName = e.location?.name || e.venueName || '';
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || locName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-500" />
            Global Platform Events Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, feature, publish, unpublish, or delete events across all platform organizers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/dashboard/create-event')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
        >
          Create Platform Event
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <div key={event.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="relative h-32 rounded-xl overflow-hidden">
                <img src={event.coverImageUrl || event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {event.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-0.5 shadow">
                      <Star className="h-3 w-3 fill-slate-950" /> Featured
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase shadow ${event.status === 'published' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                    {event.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  {event.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{event.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{event.location?.name || event.venueName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleTogglePublish(event)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  event.status === 'published' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600' : 'bg-emerald-600 text-white'
                }`}
              >
                {event.status === 'published' ? 'Unpublish' : 'Publish Event'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleFeatured(event)}
                  className={`p-1.5 rounded-lg border transition ${
                    event.featured ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'text-slate-400'
                  }`}
                  title="Toggle Featured"
                >
                  <Star className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id, event.title)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                  title="Delete Event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

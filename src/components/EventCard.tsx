import React from 'react';
import { Calendar, MapPin, Navigation, Tag, Heart, Users, ExternalLink } from 'lucide-react';
import { Event } from '../types.js';

interface EventCardProps {
  event: Event;
  onSelect: (event: Event) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const minPrice = Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0
    ? Math.min(...event.ticketTypes.map(t => t.price))
    : 0;

  const formattedDate = new Date(event.startDate).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const openDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 bg-slate-900/80 backdrop-blur text-white text-[11px] font-bold rounded-full border border-white/20 shadow">
            {event.category}
          </span>
          <div className="pointer-events-auto flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onToggleFavorite(event.id);
                }}
                className={`p-2 rounded-full backdrop-blur transition ${
                  isFavorite
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-slate-900/60 text-white hover:bg-slate-900/90'
                }`}
                title="Favorite event"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
            {minPrice === 0 ? 'FREE' : `$${minPrice}`}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Event Title */}
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
            {event.title}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Venue & Location */}
          <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {event.venueName}, {event.city}
            </span>
          </div>
        </div>

        {/* Organizer & Action buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={event.organizerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizerName}`}
              alt={event.organizerName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
              {event.organizerName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openDirections}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
              title="Open Directions in Maps"
            >
              <Navigation className="h-4 w-4" />
            </button>
            <span className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
              Details →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

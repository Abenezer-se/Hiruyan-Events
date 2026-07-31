import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Event } from '../types.js';
import { api } from '../lib/api.js';
import { EventCard } from '../components/EventCard.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

interface FavoriteEventsPageProps {
  onSelectEvent: (event: Event) => void;
  onNavigate: (route: string) => void;
}

export const FavoriteEventsPage: React.FC<FavoriteEventsPageProps> = ({
  onSelectEvent,
  onNavigate,
}) => {
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFavorites();
      setFavoriteEvents(res.events || []);
      setFavoriteIds(res.favoriteIds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFav = async (eventId: string) => {
    try {
      const res = await api.toggleFavorite(eventId);
      if (!res.isFavorite) {
        setFavoriteEvents(prev => prev.filter(e => e.id !== eventId));
        setFavoriteIds(prev => prev.filter(id => id !== eventId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Favorite Events</h1>
        <p className="text-xs text-slate-500">Events you have bookmarked for quick access.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : favoriteEvents.length === 0 ? (
        <EmptyState
          title="No Favorite Events Saved"
          description="Click the heart icon on any event card to add it to your saved favorites list."
          actionText="Browse Events"
          onAction={() => onNavigate('/events')}
          icon="event"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
              isFavorite={true}
              onToggleFavorite={handleToggleFav}
            />
          ))}
        </div>
      )}
    </div>
  );
};

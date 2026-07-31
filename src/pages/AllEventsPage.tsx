import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Grid, Map, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Event, Category, EventFilterState } from '../types.js';
import { api } from '../lib/api.js';
import { EventCard } from '../components/EventCard.tsx';
import { MapView } from '../components/MapView.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

interface AllEventsPageProps {
  onSelectEvent: (event: Event) => void;
  onNavigate: (route: string) => void;
  onOpenAuth: () => void;
}

export const AllEventsPage: React.FC<AllEventsPageProps> = ({
  onSelectEvent,
  onNavigate,
  onOpenAuth,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);

  const [filters, setFilters] = useState<EventFilterState>({
    search: '',
    category: 'all',
    dateRange: 'all',
    location: '',
    price: 'all',
    sortBy: 'date_asc',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchFilteredEvents();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
      try {
        const favRes = await api.getFavorites();
        setFavorites(favRes.favoriteIds || []);
      } catch (e) {
        // Ignore unauth
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFilteredEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getEvents(filters);
      setEvents(res.events || []);
    } catch (e) {
      console.error(e);
    } fontFinally: {
      setIsLoading(false);
    }
  };

  const handleToggleFav = async (eventId: string) => {
    try {
      const res = await api.toggleFavorite(eventId);
      if (res.isFavorite) {
        setFavorites(prev => [...prev, eventId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== eventId));
      }
    } catch (e) {
      onOpenAuth();
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      dateRange: 'all',
      location: '',
      price: 'all',
      sortBy: 'date_asc',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Explore All Events
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse upcoming conferences, music shows, tech summits, and workshops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Top Search bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search event title, description, tags..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by City or Country..."
              value={filters.location}
              onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Filters Dropdown Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          
          {/* Category */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Category</label>
            <select
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Ticket Price</label>
            <select
              value={filters.price}
              onChange={e => setFilters(prev => ({ ...prev, price: e.target.value as any }))}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Events Only</option>
              <option value="paid">Paid Events Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="date_asc">Date (Earliest First)</option>
              <option value="date_desc">Date (Latest First)</option>
              <option value="name_asc">Event Name (A-Z)</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Showing <strong>{events.length}</strong> events</span>
          <button
            onClick={resetFilters}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        </div>

      </div>

      {/* Results View */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No Matching Events Found"
          description="Try adjusting your filter parameters or search query to explore more events."
          actionText="Reset Filters"
          onAction={resetFilters}
          icon="search"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
              isFavorite={favorites.includes(event.id)}
              onToggleFavorite={handleToggleFav}
            />
          ))}
        </div>
      ) : (
        <div className="h-[550px] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
          <MapView
            latitude={events[0]?.latitude || 37.7749}
            longitude={events[0]?.longitude || -122.4194}
            venueName={events[0]?.venueName}
            address={events[0]?.fullAddress}
            height="550px"
          />
        </div>
      )}

    </div>
  );
};

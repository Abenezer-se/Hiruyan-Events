import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Sparkles, PlusCircle, ArrowRight, Shield, Globe, Award, Map, Grid, CheckCircle2, ChevronDown, ChevronUp, Star, Quote, Mail, Send } from 'lucide-react';
import { Event, Category, CmsSettings } from '../types.ts';
import { api } from '../lib/api.ts';
import { EventCard } from '../components/EventCard.tsx';
import { MapView } from '../components/MapView.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { StatsSection } from '../components/StatsSection.tsx';
import { AboutSection } from '../components/AboutSection.tsx';
import { ContactUsSection } from '../components/ContactUsSection.tsx';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onSelectEvent: (event: Event) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectEvent,
  onOpenAuth,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cms, setCms] = useState<CmsSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, categoriesRes, cmsRes] = await Promise.all([
        api.getEvents(),
        api.getCategories(),
        api.getCms(),
      ]);
      setEvents(eventsRes.events || []);
      setCategories(categoriesRes.categories || []);
      if (cmsRes && cmsRes.cms) {
        setCms(cmsRes.cms);
      }

      try {
        const favRes = await api.getFavorites();
        setFavorites(favRes.favoriteIds || []);
      } catch (e) {
        // Not logged in
      }
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
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
      onOpenAuth('login');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(`/events?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubmittingNewsletter(true);
    try {
      const res = await api.subscribeNewsletter(newsletterEmail.trim());
      setNewsletterMsg(res.message || 'Subscribed successfully!');
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterMsg(err.message || 'Subscription failed.');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || e.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const featuredEvents = events.filter(e => e.isFeatured);
  const displayedUpcomingEvents = filteredEvents.slice(0, cms?.upcomingEventsLimit || 12);

  // Hero custom properties
  const heroTitle = cms?.heroTitle || 'Discover & Organize Memorable Events Near You';
  const heroSubtitle = cms?.heroSubtitle || 'Next-Gen Event Management & Interactive Location Platform';
  const heroDesc = cms?.heroDescription || 'Real-time interactive maps, instant QR ticket check-ins, organizer dashboards, and live attendee updates. Powered by Hiruyan Platform.';
  const heroPrimaryBtn = cms?.heroPrimaryBtnText || 'Browse Catalog';
  const heroPrimaryLink = cms?.heroPrimaryBtnLink || '/events';
  const heroSecondaryBtn = cms?.heroSecondaryBtnText || 'Host an Event';
  const heroSecondaryLink = cms?.heroSecondaryBtnLink || '/dashboard/create-event';

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION */}
      {cms?.showHeroSection !== false && (
        <section
          id="home"
          className="scroll-mt-20 relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white pt-16 pb-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 border border-indigo-900/50 shadow-2xl"
          style={{
            backgroundImage: cms?.heroBgImage ? `linear-gradient(to bottom, rgba(15, 23, 42, ${cms.heroOverlayOpacity ?? 0.85}), rgba(15, 23, 42, 0.95)), url('${cms.heroBgImage}')` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative max-w-5xl mx-auto px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{heroSubtitle}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
              {heroTitle}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {heroDesc}
            </p>

            {/* Search Bar Container */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 h-5 w-5 text-indigo-300" />
                <input
                  type="text"
                  placeholder="Search events, cities, venues..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-transparent text-white placeholder-slate-300 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Explore</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick CTA Action row */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <button
                onClick={() => onNavigate(heroPrimaryLink)}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 transition shadow-md font-bold"
              >
                {heroPrimaryBtn}
              </button>
              <button
                onClick={() => onNavigate(heroSecondaryLink)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-400/40 text-white transition backdrop-blur flex items-center gap-2 font-bold"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{heroSecondaryBtn}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORIES BAR SECTION */}
      {cms?.showCategoriesSection !== false && (
        <section id="categories" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {cms?.categoriesTitle || 'Explore Categories'}
              </h2>
              {cms?.categoriesSubtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{cms.categoriesSubtitle}</p>
              )}
            </div>
            <button
              onClick={() => onNavigate('/events')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. FEATURED EVENTS SECTION (IF ENABLED) */}
      {cms?.showFeaturedEventsSection !== false && featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {cms?.featuredEventsTitle || 'Featured Spotlight Events'}
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              Handpicked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.slice(0, cms?.featuredEventsLimit || 3).map(event => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
                isFavorite={favorites.includes(event.id)}
                onToggleFavorite={handleToggleFav}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. MAIN UPCOMING EVENTS CATALOG */}
      {cms?.showUpcomingEventsSection !== false && (
        <section id="events" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {cms?.upcomingEventsTitle || 'Upcoming Events'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredEvents.length} events active in system
              </p>
            </div>

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
                <span className="hidden sm:inline">Grid</span>
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
                <span className="hidden sm:inline">Map View</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : displayedUpcomingEvents.length === 0 ? (
            <EmptyState
              title="No Published Events Found"
              description="There are currently no published events matching your criteria in the database. Be the first organizer to publish an event!"
              actionText="Create First Event"
              onAction={() => onNavigate('/dashboard/create-event')}
              icon="event"
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedUpcomingEvents.map(event => (
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
            <div className="space-y-4">
              <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <MapView
                  latitude={displayedUpcomingEvents[0]?.latitude || 37.7749}
                  longitude={displayedUpcomingEvents[0]?.longitude || -122.4194}
                  venueName={displayedUpcomingEvents[0]?.venueName}
                  address={displayedUpcomingEvents[0]?.fullAddress}
                  height="500px"
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. ABOUT SECTION */}
      {cms?.showAboutSection !== false && <AboutSection cms={cms} />}

      {/* 6. STATISTICS MILESTONES SECTION */}
      {cms?.showStatsSection !== false && <StatsSection cms={cms} />}

      {/* 7. TESTIMONIALS SECTION */}
      {cms?.showTestimonialsSection !== false && cms?.testimonials && cms.testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest">
              Community Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {cms.testimonialsTitle || 'What Our Users Say'}
            </h2>
            {cms.testimonialsSubtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{cms.testimonialsSubtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cms.testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <img src={t.avatarUrl} alt={t.authorName} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.authorName}</h4>
                    <p className="text-[10px] text-slate-400">{t.role} {t.company ? `• ${t.company}` : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. SPONSORS & PARTNERS SECTION */}
      {cms?.showSponsorsSection !== false && cms?.sponsors && cms.sponsors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {cms.sponsorsTitle || 'Trusted Partners & Sponsors'}
            </h3>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 py-4 opacity-80 hover:opacity-100 transition">
            {cms.sponsors.map((sp, idx) => (
              <a
                key={idx}
                href={sp.websiteUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              >
                <img src={sp.logoUrl} alt={sp.name} className="h-8 max-w-[120px] object-contain filter grayscale hover:grayscale-0 transition" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{sp.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 9. FAQ ACCORDION SECTION */}
      {cms?.showFaqSection !== false && cms?.faqs && cms.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest">
              Need Help?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {cms.faqTitle || 'Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-3">
            {cms.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 10. NEWSLETTER SECTION */}
      {cms?.showNewsletterSection !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {cms?.newsletterTitle || 'Subscribe to Hiruyan Newsletter'}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100">
                {cms?.newsletterSubtitle || 'Get real-time event updates, early-bird ticket discounts, and exclusive event announcements.'}
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white text-slate-900 text-xs placeholder-slate-400 focus:outline-none min-w-[260px]"
                required
              />
              <button
                type="submit"
                disabled={submittingNewsletter}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Subscribe</span>
              </button>
            </form>
          </div>
          {newsletterMsg && (
            <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              {newsletterMsg}
            </p>
          )}
        </section>
      )}

      {/* 11. GLOBAL CONTACT SECTION */}
      {cms?.showContactSection !== false && <ContactUsSection cms={cms} />}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Share2,
  Ticket,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Tag,
  Users,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Event, User as UserType, TicketType, Registration } from '../types.js';
import { api } from '../lib/api.js';
import { MapView } from '../components/MapView.tsx';
import { QRModal } from '../components/QRModal.tsx';
import { AskOrganizerModal } from '../components/AskOrganizerModal.tsx';
import { HelpCircle } from 'lucide-react';

interface EventDetailsPageProps {
  idOrSlug: string;
  user: UserType | null;
  onBack: () => void;
  onOpenAuth: () => void;
  onNavigate: (route: string) => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  idOrSlug,
  user,
  onBack,
  onOpenAuth,
  onNavigate,
}) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');

  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');
  const [newRegistration, setNewRegistration] = useState<Registration | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [idOrSlug]);

  useEffect(() => {
    if (user) {
      setAttendeeName(user.fullName);
      setAttendeeEmail(user.email);
      setAttendeePhone(user.phoneNumber || '');
    }
  }, [user]);

  const loadEvent = async () => {
    setIsLoading(true);
    try {
      const res = await api.getEvent(idOrSlug);
      setEvent(res.event);
      if (res.event.ticketTypes && res.event.ticketTypes.length > 0) {
        setSelectedTicketType(res.event.ticketTypes[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Event not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!event || !selectedTicketType) return;

    setIsRegistering(true);
    setRegError('');

    try {
      const res = await api.registerTicket({
        eventId: event.id,
        ticketTypeId: selectedTicketType.id,
        attendeeName,
        attendeeEmail,
        attendeePhone,
      });

      setNewRegistration(res.registration);

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const openDirections = () => {
    if (!event) return;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const addToGoogleCalendar = () => {
    if (!event) return;
    const startTime = new Date(event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = new Date(event.endDate || event.startDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.fullAddress || event.venueName)}`;
    window.open(calUrl, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (errorMsg || !event) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Event Not Found</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'The requested event does not exist or has been removed.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const isSoldOut = event.capacity > 0 && (event.registeredCount || 0) >= event.capacity;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Events</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={addToGoogleCalendar}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            <span>Add to Calendar</span>
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copiedShare ? 'Link Copied!' : 'Share Event'}</span>
          </button>
        </div>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs shadow">
              {event.category}
            </span>
            {isSoldOut && (
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow">
                SOLD OUT
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Grid: Details (Left) + Ticket Registration Box (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Information */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Key Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date & Time</p>
                <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                  {new Date(event.startDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Venue Location</p>
                <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                  {event.venueName}, {event.city}
                </p>
                <p className="text-[11px] text-slate-500">{event.fullAddress}</p>
              </div>
            </div>
          </div>

          {/* About Event Description */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">About This Event</h3>
            <div className="prose dark:prose-invert text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                {event.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Leaflet Location Map */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Interactive Location Map</h3>
                <p className="text-xs text-slate-500">{event.fullAddress}</p>
              </div>
              <button
                onClick={openDirections}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Open in Maps</span>
              </button>
            </div>

            <MapView
              latitude={event.latitude}
              longitude={event.longitude}
              venueName={event.venueName}
              address={event.fullAddress}
              city={event.city}
              country={event.country}
              editable={false}
              height="350px"
            />
          </div>

          {/* Organizer Profile */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={event.organizerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizerName}`}
                alt={event.organizerName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
              />
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Event Organizer
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.organizerName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verified Hiruyan Event Host
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  setShowAskModal(true);
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 shrink-0"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Ask Organizer / Cancel Request</span>
            </button>
          </div>
        </div>

        {/* Right 1 Column: Registration / Ticket Selection Widget */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Reserve Your Spot
              </h3>
              <p className="text-xs text-slate-500">
                {event.registeredCount || 0} / {event.capacity} seats registered
              </p>
            </div>

            {/* Ticket Options List */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Select Ticket Type:
              </label>
              {(event.ticketTypes || []).map(tkt => {
                const selected = selectedTicketType?.id === tkt.id;
                return (
                  <div
                    key={tkt.id}
                    onClick={() => setSelectedTicketType(tkt)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{tkt.name}</p>
                      {tkt.description && <p className="text-[11px] text-slate-500">{tkt.description}</p>}
                    </div>
                    <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {tkt.price === 0 ? 'FREE' : `$${tkt.price}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {regError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Attendee Full Name
                </label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={e => setAttendeeName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email for QR Ticket Delivery
                </label>
                <input
                  type="email"
                  required
                  value={attendeeEmail}
                  onChange={e => setAttendeeEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={isRegistering || isSoldOut}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSoldOut ? (
                  'Sold Out'
                ) : !user ? (
                  'Sign In to Register'
                ) : (
                  <>
                    <Ticket className="h-4 w-4" />
                    <span>Confirm & Get Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Ticket Pass Modal upon successful registration */}
      {newRegistration && (
        <QRModal
          registration={newRegistration}
          onClose={() => {
            setNewRegistration(null);
            onNavigate('/dashboard/tickets');
          }}
        />
      )}

      {/* Ask Organizer / Communication Modal */}
      {event && (
        <AskOrganizerModal
          event={event}
          user={user}
          isOpen={showAskModal}
          onClose={() => setShowAskModal(false)}
        />
      )}
    </div>
  );
};

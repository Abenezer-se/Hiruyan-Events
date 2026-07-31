import React from 'react';
import { X, Printer, Navigation, CheckCircle2, AlertCircle, Calendar, MapPin, User, Ticket } from 'lucide-react';
import { Registration } from '../types.js';

interface QRModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const openDirections = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${registration.eventLatitude},${registration.eventLongitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:border-none">
        
        {/* Header bar */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            <span className="font-bold text-sm">Official Event Pass</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pass Content */}
        <div className="p-6 text-center space-y-4">
          
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              {registration.ticketTypeName}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
              {registration.eventTitle}
            </h2>
          </div>

          {/* QR Code Graphic */}
          <div className="relative mx-auto w-48 h-48 bg-white p-3 rounded-2xl border-2 border-indigo-100 dark:border-slate-800 shadow-inner flex items-center justify-center">
            {registration.qrCodeData ? (
              <img
                src={registration.qrCodeData}
                alt="Event Ticket QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-slate-400">QR Code loading...</div>
            )}
          </div>

          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 tracking-widest bg-slate-100 dark:bg-slate-800/80 py-1.5 px-4 rounded-xl inline-block">
            {registration.ticketNumber}
          </div>

          {/* Ticket Metadata details */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-white">{registration.userName}</span>
              <span className="text-slate-400">({registration.userEmail})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span>{new Date(registration.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span>{registration.eventVenue}, {registration.eventCity}</span>
            </div>
            
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500">Check-in Status:</span>
              {registration.checkInStatus === 'checked_in' ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" /> Ready for Scan
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 print:hidden">
            <button
              onClick={openDirections}
              className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Navigation className="h-4 w-4 text-indigo-500" />
              <span>Get Directions</span>
            </button>
            <button
              onClick={handlePrint}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Print Pass</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

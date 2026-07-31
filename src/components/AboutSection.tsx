import React from 'react';
import { MapPin, ExternalLink, ShieldCheck, Sparkles, Building2, Layers } from 'lucide-react';
import { CmsSettings } from '../types.js';

interface AboutSectionProps {
  cms: CmsSettings | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ cms }) => {
  if (cms && cms.showAboutSection === false) {
    return null;
  }

  const aboutText = cms?.aboutText ||
    'Hiruyan Event Platform is Ethiopia’s premier digital event management, ticketing, and check-in ecosystem. Based in Adisketema, Dire Dawa, Hiruyan empowers event organizers, artists, businesses, and communities across Ethiopia to seamlessly publish events, manage ticket sales, track real-time entrance check-ins, and engage attendees with interactive location maps.';

  const address = cms?.contactAddress || 'Adisketema, Dire Dawa, Ethiopia';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <section id="about" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Box */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ABOUT HIRUYAN EVENT PLATFORM</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Transforming Event Experiences in Ethiopia
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {aboutText}
            </p>

            {/* Office Badge & Google Maps CTA */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Headquarters</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    {address}
                  </span>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 shrink-0"
              >
                <span>Visit Our Office</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right Highlights Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Encrypted Digital Tickets</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Prevents ticket forgery and duplication with dynamic RSA/AES encrypted QR codes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Multi-Role Control</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Distinct Super Admin, Organizer, and Attendee portals with granular permissions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Built for Ethiopian Event Ecosystems</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  Dire Dawa • Addis Ababa • Hawassa
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Engineered with dual light/dark mode, Leaflet map geocoding, instant check-in verification, and offline-friendly ticketing for Ethiopian connectivity.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

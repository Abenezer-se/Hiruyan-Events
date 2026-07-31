import React, { useState } from 'react';
import { Sparkles, Phone, Mail, MapPin, ExternalLink, ArrowRight, Shield, FileText } from 'lucide-react';
import { CmsSettings } from '../types.js';

interface FooterProps {
  cms: CmsSettings | null;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ cms, onNavigate }) => {
  const [showPolicyModal, setShowPolicyModal] = useState<'privacy' | 'terms' | null>(null);

  if (cms && cms.showFooter === false) {
    return null;
  }

  const phone = cms?.contactPhone || '+251978760949';
  const email = cms?.contactEmail || 'hiruyaninfo@gmail.com';
  const address = cms?.contactAddress || 'Adisketema, Dire Dawa, Ethiopia';
  const footerText = cms?.footerText || '© 2026 Hiruyan Event Platform. All Rights Reserved.';
  const footerDesc = cms?.footerDescription || 'Hiruyan Event Platform is Ethiopia’s premier digital event management, ticketing, and check-in ecosystem based in Adisketema, Dire Dawa.';

  const cleanPhone = phone.replace(/[^\d+]/g, '');

  const whatsappUrl = cms?.socialLinks?.whatsapp || `https://wa.me/${cleanPhone.replace('+', '')}`;
  const instagramUrl = cms?.socialLinks?.instagram || 'https://instagram.com/hiruyan-event-organizer';
  const telegramUrl = cms?.socialLinks?.telegram || 'https://t.me/hiruyan';
  const tiktokUrl = cms?.socialLinks?.tiktok || 'https://www.tiktok.com/@hiruyan';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const handleNavClick = (route: string, sectionId?: string) => {
    onNavigate(route);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12 transition-colors relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* 1. Brand Section */}
          <div className="space-y-4">
            <div
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">
                  {cms?.siteName || 'Hiruyan'}
                </span>
                <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                  EVENT PLATFORM
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {footerDesc}
            </p>

            <div className="pt-2">
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Ethiopian Event Platform
              </span>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => handleNavClick('/', 'home')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-slate-300"
                >
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/events')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-slate-300"
                >
                  <span>Events</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/', 'categories')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-slate-300"
                >
                  <span>Categories</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/', 'about')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-slate-300"
                >
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('/', 'contact')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-slate-300"
                >
                  <span>Contact Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowPolicyModal('privacy')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-slate-400 hover:underline"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowPolicyModal('terms')}
                  className="hover:text-indigo-400 transition flex items-center gap-1.5 text-slate-400 hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3 text-xs">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-start gap-2.5 group text-slate-300 hover:text-indigo-400 transition"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-indigo-500/50 transition">
                  <Phone className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Phone</span>
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-300">{phone}</span>
                </div>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-start gap-2.5 group text-slate-300 hover:text-indigo-400 transition"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-indigo-500/50 transition">
                  <Mail className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Email</span>
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-300 break-all">{email}</span>
                </div>
              </a>

              <div className="flex items-start gap-2.5 group text-slate-300">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Location</span>
                  <span className="font-semibold text-slate-200">{address}</span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    <span>Visit Our Office</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Social Media Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Connect With Us</h3>
            <p className="text-xs text-slate-400">
              Follow Hiruyan Event Platform on social media for live event announcements, ticket drops, and community updates.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/30 text-slate-200 hover:text-emerald-400 text-xs font-semibold flex items-center gap-2 transition"
              >
                <svg className="h-4 w-4 fill-current text-emerald-500" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-sky-950/30 text-slate-200 hover:text-sky-400 text-xs font-semibold flex items-center gap-2 transition"
              >
                <svg className="h-4 w-4 fill-current text-sky-400" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.128.832.941z"/>
                </svg>
                <span>Telegram</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-pink-950/30 text-slate-200 hover:text-pink-400 text-xs font-semibold flex items-center gap-2 transition"
              >
                <svg className="h-4 w-4 fill-current text-pink-500" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>

              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-400 hover:bg-slate-800/80 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition"
              >
                <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .56.04.82.12V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.04z"/>
                </svg>
                <span>TikTok</span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{footerText}</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowPolicyModal('privacy')} className="hover:text-slate-300 transition">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => setShowPolicyModal('terms')} className="hover:text-slate-300 transition">
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto text-slate-300 text-xs leading-relaxed space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {showPolicyModal === 'privacy' ? <Shield className="h-5 w-5 text-indigo-400" /> : <FileText className="h-5 w-5 text-indigo-400" />}
                <span>{showPolicyModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}</span>
              </h3>
              <button
                onClick={() => setShowPolicyModal(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {showPolicyModal === 'privacy' ? (
              <div className="space-y-3">
                <p><strong>Effective Date:</strong> July 2026</p>
                <p>At Hiruyan Event Platform (based in Adisketema, Dire Dawa, Ethiopia), we prioritize the privacy and security of event organizers and attendees across Ethiopia and globally.</p>
                <h4 className="font-bold text-slate-200">1. Information We Collect</h4>
                <p>We collect account information (Name, Email, Phone number, Gender for avatar customization) and registration data necessary to process ticket orders and QR check-in credentials.</p>
                <h4 className="font-bold text-slate-200">2. Data Usage</h4>
                <p>Your information is used strictly to issue tickets, enable check-in verification, facilitate communication between organizers and attendees, and send event updates.</p>
                <h4 className="font-bold text-slate-200">3. Contact</h4>
                <p>If you have questions regarding data privacy, reach out to us at <strong>hiruyaninfo@gmail.com</strong> or call <strong>+251978760949</strong>.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p><strong>Effective Date:</strong> July 2026</p>
                <p>Welcome to Hiruyan Event Platform. By accessing or using our platform, you agree to comply with the following terms:</p>
                <h4 className="font-bold text-slate-200">1. Ticketing & Registration</h4>
                <p>All tickets issued on Hiruyan carry a unique cryptographic QR code. Organizers have full authority to check in valid ticket holders at event entrances in Adisketema, Dire Dawa, and all participating venues.</p>
                <h4 className="font-bold text-slate-200">2. Cancellation & Refunds</h4>
                <p>Attendees may request registration cancellations via the "Ask Organizer" / "Cancel Registration Request" tool on event pages. Approval or rejection is managed directly by the event organizer.</p>
                <h4 className="font-bold text-slate-200">3. Code of Conduct</h4>
                <p>Inappropriate messages or fraudulent event listings are strictly forbidden and subject to instant user ban by Super Admin.</p>
              </div>
            )}

            <div className="pt-4 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setShowPolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

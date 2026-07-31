import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { CmsSettings } from '../types.js';
import { api } from '../lib/api.js';

interface ContactUsSectionProps {
  cms: CmsSettings | null;
}

export const ContactUsSection: React.FC<ContactUsSectionProps> = ({ cms }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (cms && cms.showContactSection === false) {
    return null;
  }

  const phone = cms?.contactPhone || '+251978760949';
  const email = cms?.contactEmail || 'hiruyaninfo@gmail.com';
  const address = cms?.contactAddress || 'Adisketema, Dire Dawa, Ethiopia';

  const cleanPhone = phone.replace(/[^\d+]/g, '');

  const whatsappUrl = cms?.socialLinks?.whatsapp || `https://wa.me/${cleanPhone.replace('+', '')}`;
  const instagramUrl = cms?.socialLinks?.instagram || 'https://instagram.com/hiruyan-event-organizer';
  const telegramUrl = cms?.socialLinks?.telegram || 'https://t.me/hiruyan';
  const tiktokUrl = cms?.socialLinks?.tiktok || 'https://www.tiktok.com/@hiruyan';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || 'General Inquiry',
        message: formData.message.trim(),
      });

      setSuccessMsg(res.message || 'Thank you! Your message has been sent to Hiruyan Event Platform admins. We will respond shortly.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message. Please try again or contact us directly via phone/email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm transition-colors">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest">
            Get In Touch
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Contact Hiruyan Event Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Have questions about hosting an event, purchasing tickets, or partnership opportunities? Send us a message or reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <a
                href={`tel:${cleanPhone}`}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/50 transition flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Support</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {phone}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click to open phone dialer</p>
                </div>
              </a>

              <a
                href={`mailto:${email}`}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-500/50 transition flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Us</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition break-all">
                    {email}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Click to launch email app</p>
                </div>
              </a>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Main Location</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {address}
                  </span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 transition"
                  >
                    <span>Visit Our Office</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Social Channels */}
            <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Social Channels</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-2 transition"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-sky-600 dark:hover:text-sky-400 font-semibold flex items-center gap-2 transition"
                >
                  <Send className="h-4 w-4 text-sky-400" />
                  <span>Telegram</span>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-pink-600 dark:hover:text-pink-400 font-semibold flex items-center gap-2 transition"
                >
                  <span className="font-bold text-pink-500">IG</span>
                  <span>Instagram</span>
                </a>
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center gap-2 transition"
                >
                  <span className="font-bold text-slate-900 dark:text-white">TT</span>
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Send className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Send Us a Direct Message</span>
            </h3>

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Message Received!</p>
                  <p className="mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Form Error</p>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Bikila"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. abebe@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +251911223344"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Event Hosting / Partnership"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can Hiruyan Event Platform assist you today?"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message to Admin</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { HelpCircle, Send, Paperclip, X, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Event, User } from '../types.js';
import { api } from '../lib/api.js';

interface AskOrganizerModalProps {
  event: Event;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AskOrganizerModal: React.FC<AskOrganizerModalProps> = ({
  event,
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [inquiryType, setInquiryType] = useState<'organizer_ask' | 'question' | 'cancellation_request'>('organizer_ask');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attendeeName, setAttendeeName] = useState(user?.fullName || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Attachment file size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, file.name);
        setAttachmentUrl(res.url);
        setAttachmentName(file.name);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to upload attachment file.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!subject.trim() || !message.trim() || !attendeeName.trim() || !attendeeEmail.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.sendEventInquiry(event.id, {
        subject: subject.trim(),
        message: message.trim(),
        type: inquiryType,
        attachmentUrl,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
      });

      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send inquiry to organizer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Ask Organizer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                {event.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Message Sent!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
              Your inquiry has been delivered directly to the organizer of <strong>{event.title}</strong>. You will be notified when they reply.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Inquiry Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Inquiry Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={inquiryType}
                onChange={e => setInquiryType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="organizer_ask">General Question to Organizer</option>
                <option value="cancellation_request">Ticket Cancellation & Refund Request</option>
                <option value="question">Event Schedule / Venue Clarification</option>
              </select>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={attendeeName}
                  onChange={e => setAttendeeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={attendeeEmail}
                  onChange={e => setAttendeeEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={inquiryType === 'cancellation_request' ? 'Request to cancel ticket registration' : 'Question regarding event schedule...'}
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Message Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Write your message or reason for cancellation request..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Optional Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Optional File Attachment (Proof of Payment, Medical Cert, ID)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition">
                  <Paperclip className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
                {attachmentName && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {attachmentName}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

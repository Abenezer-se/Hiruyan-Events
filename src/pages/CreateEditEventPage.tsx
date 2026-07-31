import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Image as ImageIcon, Plus, Trash2, Save, ArrowLeft, Loader2, Compass, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Event, Category, TicketType } from '../types.js';
import { api } from '../lib/api.js';
import { MapView } from '../components/MapView.tsx';

interface CreateEditEventPageProps {
  eventId?: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
}

export const CreateEditEventPage: React.FC<CreateEditEventPageProps> = ({
  eventId,
  onBack,
  onNavigate,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology & AI');
  const [tagsInput, setTagsInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [capacity, setCapacity] = useState<number>(100);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Media
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80');
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  // Venue & Interactive Location
  const [venueName, setVenueName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [termsAndConditions, setTermsAndConditions] = useState('');

  // Ticket Pricing Types
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: 'tkt-1', name: 'General Admission', price: 0, quantity: 100, soldCount: 0, description: 'Standard entry ticket' }
  ]);

  useEffect(() => {
    loadCategories();
    if (eventId) {
      loadExistingEvent(eventId);
    } else {
      // Set default dates to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setStartDate(tomorrow.toISOString().slice(0, 16));

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(17, 0, 0, 0);
      setEndDate(tomorrowEnd.toISOString().slice(0, 16));
      setRegistrationDeadline(tomorrow.toISOString().slice(0, 16));
    }
  }, [eventId]);

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadExistingEvent = async (id: string) => {
    try {
      const res = await api.getEvent(id);
      const e = res.event;
      setTitle(e.title);
      setSlug(e.slug);
      setDescription(e.description);
      setCategory(e.category);
      setTagsInput(e.tags.join(', '));
      setStartDate(e.startDate.slice(0, 16));
      setEndDate(e.endDate.slice(0, 16));
      setRegistrationDeadline(e.registrationDeadline.slice(0, 16));
      setCapacity(e.capacity);
      setCoverImage(e.coverImage);
      setGallery(e.gallery || []);
      setVenueName(e.venueName);
      setFullAddress(e.fullAddress);
      setCity(e.city);
      setCountry(e.country);
      setLatitude(e.latitude);
      setLongitude(e.longitude);
      setTermsAndConditions(e.termsAndConditions || '');
      setStatus(e.status === 'draft' ? 'draft' : 'published');
      if (e.ticketTypes && e.ticketTypes.length > 0) {
        setTicketTypes(e.ticketTypes);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading event details');
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!eventId) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  // Map location auto updates from search or marker drag
  const handleLocationSelect = (loc: {
    latitude: number;
    longitude: number;
    fullAddress: string;
    city: string;
    country: string;
  }) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setFullAddress(loc.fullAddress);
    setCity(loc.city);
    setCountry(loc.country);
    if (!venueName) {
      setVenueName(loc.fullAddress.split(',')[0]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, file.name);
        if (target === 'cover') {
          setCoverImage(res.url);
        } else {
          setGallery(prev => [...prev, res.url]);
        }
      } catch (err: any) {
        setErrorMsg('Image upload failed: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const addTicketType = () => {
    const newTkt: TicketType = {
      id: `tkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: 'VIP Admission',
      price: 50,
      quantity: 50,
      soldCount: 0,
      description: 'Priority access ticket',
    };
    setTicketTypes(prev => [...prev, newTkt]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length <= 1) return;
    setTicketTypes(prev => prev.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, key: keyof TicketType, val: any) => {
    setTicketTypes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate || !venueName || !city) {
      setErrorMsg('Please complete all required fields (title, dates, venue name, city).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const payload: Partial<Event> = {
      title,
      slug,
      description,
      category,
      tags: tagsArr,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      registrationDeadline: new Date(registrationDeadline || startDate).toISOString(),
      capacity: Number(capacity),
      ticketTypes,
      coverImage,
      gallery,
      venueName,
      fullAddress: fullAddress || venueName,
      city,
      country,
      latitude: Number(latitude),
      longitude: Number(longitude),
      termsAndConditions,
      status,
    };

    try {
      if (eventId) {
        await api.updateEvent(eventId, payload);
        setSuccessMsg('Event updated successfully!');
      } else {
        const res = await api.createEvent(payload);
        setSuccessMsg('Event created successfully!');
        setTimeout(() => onNavigate(`/events/${res.event.id}`), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Event saving failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {eventId ? 'Edit Event Details' : 'Create New Event'}
            </h1>
            <p className="text-xs text-slate-500">
              Configure event schedule, pricing, cover media, and interactive venue map location.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatus('draft')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              status === 'draft'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => setStatus('published')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              status === 'published'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Publish Live
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Event Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            1. Basic Event Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. Hiruyan AI Summit 2026"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Event Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="hiruyan-ai-summit-2026"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Description (Rich Text / Overview)
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed description of speaker sessions, schedule, networking opportunities..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="ai, tech, networking, workshop"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Location & Venue Map */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <span>2. Venue & Interactive Map Location</span>
              </h2>
              <p className="text-xs text-slate-500">Search location, click map, or drag marker to set exact venue coordinates.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                required
                value={venueName}
                onChange={e => setVenueName(e.target.value)}
                placeholder="e.g. Moscone Center"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="San Francisco"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={fullAddress}
                onChange={e => setFullAddress(e.target.value)}
                placeholder="747 Howard St, San Francisco, CA 94103"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="United States"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2 text-xs">
              <div className="flex-1">
                <label className="font-mono text-[11px] text-slate-500 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="flex-1">
                <label className="font-mono text-[11px] text-slate-500 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Map Component */}
          <div className="pt-2">
            <MapView
              latitude={latitude}
              longitude={longitude}
              venueName={venueName}
              address={fullAddress}
              city={city}
              country={country}
              editable={true}
              onLocationSelect={handleLocationSelect}
              height="380px"
            />
          </div>
        </div>

        {/* Section 3: Schedule & Capacity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            3. Schedule & Total Capacity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={e => setRegistrationDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Total Venue Capacity
              </label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={e => setCapacity(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Ticket Pricing & Types */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              4. Ticket Types & Pricing
            </h2>
            <button
              type="button"
              onClick={addTicketType}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Ticket Tier</span>
            </button>
          </div>

          <div className="space-y-3">
            {ticketTypes.map((tkt, idx) => (
              <div
                key={tkt.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block">Tier Name</label>
                  <input
                    type="text"
                    value={tkt.name}
                    onChange={e => updateTicketType(idx, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={tkt.price}
                    onChange={e => updateTicketType(idx, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={tkt.quantity}
                    onChange={e => updateTicketType(idx, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 sm:pt-0">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-slate-500 block">Description</label>
                    <input
                      type="text"
                      value={tkt.description || ''}
                      onChange={e => updateTicketType(idx, 'description', e.target.value)}
                      placeholder="e.g. Free swag, front seats"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition mt-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Media & Cover Upload */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            5. Event Cover & Gallery Images
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Cover Image Preview
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={coverImage}
                  alt="Cover Preview"
                  className="w-32 h-20 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
                <div className="space-y-2 flex-1">
                  <label className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-indigo-500" />
                    <span>Upload Cover File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Or enter Image URL"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{eventId ? 'Update Event' : 'Save & Publish Event'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

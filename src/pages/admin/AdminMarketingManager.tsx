import React, { useEffect, useState } from 'react';
import {
  Award,
  Star,
  HelpCircle,
  MessageSquare,
  Tag,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { Sponsor, Testimonial, FaqItem, ContactMessage, Coupon } from '../../types.js';

export const AdminMarketingManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sponsors' | 'testimonials' | 'faqs' | 'contact' | 'coupons' | 'newsletter'>('sponsors');

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');
  const [newSponsorWebsite, setNewSponsorWebsite] = useState('');

  const [newTestimonialName, setNewTestimonialName] = useState('');
  const [newTestimonialRole, setNewTestimonialRole] = useState('');
  const [newTestimonialContent, setNewTestimonialContent] = useState('');

  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('');

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);

  const [msg, setMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes, fRes, mRes, cRes, nRes] = await Promise.all([
        api.getSponsors(),
        api.getTestimonials(),
        api.getFaqs(),
        api.getContactMessages(),
        api.getCoupons(),
        api.getNewsletterSubscribers(),
      ]);
      setSponsors(sRes.sponsors || []);
      setTestimonials(tRes.testimonials || []);
      setFaqs(fRes.faqs || []);
      setMessages(mRes.messages || []);
      setCoupons(cRes.coupons || []);
      setSubscribers(nRes.subscribers || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsorName) return;
    try {
      await api.createSponsor({
        name: newSponsorName,
        logoUrl: newSponsorLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
        websiteUrl: newSponsorWebsite || 'https://hiruyan.com',
      });
      setNewSponsorName('');
      setNewSponsorLogo('');
      setNewSponsorWebsite('');
      setMsg('Sponsor added successfully');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    await api.deleteSponsor(id);
    loadData();
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonialName || !newTestimonialContent) return;
    try {
      await api.createTestimonial({
        name: newTestimonialName,
        role: newTestimonialRole || 'Event Attendee',
        content: newTestimonialContent,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newTestimonialName)}`,
        rating: 5,
      });
      setNewTestimonialName('');
      setNewTestimonialRole('');
      setNewTestimonialContent('');
      setMsg('Testimonial added');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    await api.deleteTestimonial(id);
    loadData();
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) return;
    try {
      await api.createFaq({
        question: newFaqQuestion,
        answer: newFaqAnswer,
        category: newFaqCategory || 'General',
      });
      setNewFaqQuestion('');
      setNewFaqAnswer('');
      setNewFaqCategory('');
      setMsg('FAQ added');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    await api.deleteFaq(id);
    loadData();
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      await api.createCoupon({
        code: newCouponCode.toUpperCase(),
        discountPercentage: newCouponDiscount,
        active: true,
      });
      setNewCouponCode('');
      setMsg('Coupon code generated');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    await api.deleteCoupon(id);
    loadData();
  };

  const handleDeleteMessage = async (id: string) => {
    await api.deleteContactMessage(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            Marketing & Engagement Tools
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage platform sponsors, testimonials, FAQs, coupons, contact messages, and subscribers.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('sponsors')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'sponsors' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Award className="h-3.5 w-3.5" /> Sponsors ({sponsors.length})
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'testimonials' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Star className="h-3.5 w-3.5" /> Testimonials ({testimonials.length})
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'faqs' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" /> FAQs ({faqs.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'coupons' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Tag className="h-3.5 w-3.5" /> Coupons ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'contact' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Contact Inquiries ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('newsletter')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'newsletter' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Mail className="h-3.5 w-3.5" /> Newsletter ({subscribers.length})
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'sponsors' && (
        <div className="space-y-6">
          <form onSubmit={handleAddSponsor} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Add New Sponsor / Partner</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Sponsor Name"
                required
                value={newSponsorName}
                onChange={(e) => setNewSponsorName(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Logo Image URL"
                value={newSponsorLogo}
                onChange={(e) => setNewSponsorLogo(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Website URL"
                value={newSponsorWebsite}
                onChange={(e) => setNewSponsorWebsite(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-amber-500 font-bold text-xs text-slate-950 rounded-xl">
              Add Sponsor
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(sponsors || []).map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative space-y-2">
                <button onClick={() => handleDeleteSponsor(s.id)} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                <img src={s.logoUrl} alt={s.name} className="h-10 mx-auto object-contain" />
                <p className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <form onSubmit={handleAddTestimonial} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Add Client Testimonial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Person Name"
                required
                value={newTestimonialName}
                onChange={(e) => setNewTestimonialName(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Role / Title (e.g. Lead Developer)"
                value={newTestimonialRole}
                onChange={(e) => setNewTestimonialRole(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Testimonial Quote Content"
              required
              value={newTestimonialContent}
              onChange={(e) => setNewTestimonialContent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
            <button type="submit" className="px-4 py-2 bg-amber-500 font-bold text-xs text-slate-950 rounded-xl">
              Publish Testimonial
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(testimonials || []).map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <button onClick={() => handleDeleteTestimonial(t.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{t.content}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <form onSubmit={handleAddFaq} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Add FAQ Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Question"
                required
                value={newFaqQuestion}
                onChange={(e) => setNewFaqQuestion(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <input
                type="text"
                placeholder="Category (e.g. Ticketing, Events)"
                value={newFaqCategory}
                onChange={(e) => setNewFaqCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Answer detail"
              required
              value={newFaqAnswer}
              onChange={(e) => setNewFaqAnswer(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
            <button type="submit" className="px-4 py-2 bg-amber-500 font-bold text-xs text-slate-950 rounded-xl">
              Add FAQ
            </button>
          </form>

          <div className="space-y-3">
            {(faqs || []).map((f) => (
              <div key={f.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 relative">
                <button onClick={() => handleDeleteFaq(f.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                  {f.category}
                </span>
                <p className="font-bold text-xs text-slate-900 dark:text-white">{f.question}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCoupon} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">Create Promotional Coupon Code</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Coupon Code (e.g. HIRUYAN20)"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono font-bold"
              />
              <input
                type="number"
                placeholder="Discount Percent (e.g. 20)"
                required
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-amber-500 font-bold text-xs text-slate-950 rounded-xl">
              Create Coupon
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(coupons || []).map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-mono font-extrabold text-sm text-indigo-600 dark:text-indigo-400">{c.code}</p>
                  <p className="text-xs text-emerald-600 font-bold">{c.discountPercentage}% OFF</p>
                </div>
                <button onClick={() => handleDeleteCoupon(c.id)} className="p-1 text-slate-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No inquiry messages yet.</p>
          ) : (
            (messages || []).map((m) => (
              <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 relative">
                <button onClick={() => handleDeleteMessage(m.id)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</span>
                  <span className="text-[10px] text-slate-400">({m.email})</span>
                </div>
                <p className="font-semibold text-xs text-amber-600 dark:text-amber-400">{m.subject}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{m.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'newsletter' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white">Subscribed Emails</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {(subscribers || []).map((sub, idx) => (
              <div key={idx} className="py-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
                {sub}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

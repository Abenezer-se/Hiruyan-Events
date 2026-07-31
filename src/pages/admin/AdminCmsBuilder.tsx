import React, { useEffect, useState } from 'react';
import {
  Globe,
  Save,
  Sparkles,
  Layout,
  Image,
  Type,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  MessageSquare,
  BarChart2,
  Sliders,
  Bell,
  Download,
  Upload,
  Layers,
  Settings,
  Share2,
  HelpCircle,
  Award,
  Star,
  Eye,
  Link,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { CmsSettings, CmsPage, BlogPost, Announcement } from '../../types.js';

export const AdminCmsBuilder: React.FC = () => {
  const [cms, setCms] = useState<CmsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // CMS Sub-Tab Selection
  const [activeTab, setActiveTab] = useState<
    | 'homepage'
    | 'contact'
    | 'footer'
    | 'navbar'
    | 'stats'
    | 'pages'
    | 'blog'
    | 'seo'
    | 'system'
    | 'announcements'
    | 'backup'
  >('homepage');

  // Dynamic Lists state
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Page Builder Modal State
  const [showPageModal, setShowPageModal] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageContent, setPageContent] = useState('');

  // Blog Post Modal State
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');

  // Announcement Modal State
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annLink, setAnnLink] = useState('');

  // Backup file state
  const [backupFileText, setBackupFileText] = useState('');

  const loadAllCmsData = async () => {
    setLoading(true);
    try {
      const [cmsRes, pagesRes, blogRes, annRes] = await Promise.all([
        api.getAdminCms(),
        api.getAdminPages().catch(() => ({ pages: [] })),
        api.getAdminBlogPosts().catch(() => ({ posts: [] })),
        api.getAdminAnnouncements().catch(() => ({ announcements: [] })),
      ]);
      if (cmsRes && cmsRes.cms) setCms(cmsRes.cms);
      if (pagesRes && pagesRes.pages) setPages(pagesRes.pages);
      if (blogRes && blogRes.posts) setBlogPosts(blogRes.posts);
      if (annRes && annRes.announcements) setAnnouncements(annRes.announcements);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load CMS data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCmsData();
  }, []);

  const handleSaveCms = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cms) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.updateAdminCms(cms);
      setCms(res.cms);
      setSuccessMsg('Website content & CMS settings updated instantly!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic Page Creation
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminPage({
        title: pageTitle,
        slug: pageSlug || pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: pageContent,
        published: true,
      });
      setSuccessMsg('New CMS Page created!');
      setShowPageModal(false);
      setPageTitle('');
      setPageSlug('');
      setPageContent('');
      loadAllCmsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create page');
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await api.deleteAdminPage(id);
      loadAllCmsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete page');
    }
  };

  // Blog Creation
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminBlogPost({
        title: blogTitle,
        slug: blogSlug || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: blogExcerpt,
        content: blogContent,
        published: true,
      });
      setSuccessMsg('Blog post published!');
      setShowBlogModal(false);
      setBlogTitle('');
      setBlogSlug('');
      setBlogExcerpt('');
      setBlogContent('');
      loadAllCmsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create blog post');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.deleteAdminBlogPost(id);
      loadAllCmsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete blog post');
    }
  };

  // Announcement Creation
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminAnnouncement({
        title: annTitle,
        message: annMessage,
        linkUrl: annLink,
        published: true,
      });
      setSuccessMsg('Platform announcement published!');
      setShowAnnModal(false);
      setAnnTitle('');
      setAnnMessage('');
      setAnnLink('');
      loadAllCmsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.deleteAdminAnnouncement(id);
      loadAllCmsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete announcement');
    }
  };

  // Restore Database Backup
  const handleRestoreBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupFileText.trim()) return;
    if (!confirm('WARNING: Restoring a backup will replace the current database state. Continue?')) return;
    try {
      const res = await api.restoreDatabaseBackup(backupFileText);
      setSuccessMsg(res.message || 'Database backup successfully restored!');
      setBackupFileText('');
      loadAllCmsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to restore database backup');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!cms) return null;

  const tabs = [
    { id: 'homepage', label: 'Homepage & Hero', icon: Layout },
    { id: 'contact', label: 'Contact & Socials', icon: Phone },
    { id: 'footer', label: 'Footer & Branding', icon: Type },
    { id: 'stats', label: 'Analytics & Metrics', icon: BarChart2 },
    { id: 'pages', label: 'CMS Page Builder', icon: FileText },
    { id: 'blog', label: 'Blog & News', icon: MessageSquare },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'seo', label: 'SEO & Metadata', icon: Globe },
    { id: 'system', label: 'System Limits', icon: Sliders },
    { id: 'backup', label: 'Backup & Restore', icon: Download },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              CMS & No-Code Website Builder
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Categorized website configuration engine for pages, landing components, statistics, contact details, and database backups.
          </p>
        </div>

        <button
          onClick={() => handleSaveCms()}
          disabled={saving}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Publishing...' : 'Publish CMS Changes'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SUB-TABS CATEGORY NAVIGATION BAR */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HOMEPAGE & HERO */}
      {activeTab === 'homepage' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layout className="h-5 w-5 text-amber-500" />
            Homepage Banner & Section Visibility
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Title</label>
              <input
                type="text"
                value={cms.heroTitle || ''}
                onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Subtitle</label>
              <input
                type="text"
                value={cms.heroSubtitle || ''}
                onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hero Description</label>
              <textarea
                value={cms.heroDescription || ''}
                onChange={(e) => setCms({ ...cms, heroDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={cms.heroPrimaryBtnText || ''}
                  onChange={(e) => setCms({ ...cms, heroPrimaryBtnText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Secondary Button Text</label>
                <input
                  type="text"
                  value={cms.heroSecondaryBtnText || ''}
                  onChange={(e) => setCms({ ...cms, heroSecondaryBtnText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white">Section Toggles</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cms.showHeroSection !== false}
                    onChange={(e) => setCms({ ...cms, showHeroSection: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Show Hero Section</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cms.showCategoriesSection !== false}
                    onChange={(e) => setCms({ ...cms, showCategoriesSection: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Show Categories</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cms.showFeaturedEventsSection !== false}
                    onChange={(e) => setCms({ ...cms, showFeaturedEventsSection: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Show Featured Events</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cms.showAboutSection !== false}
                    onChange={(e) => setCms({ ...cms, showAboutSection: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Show About Section</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cms.showStatsSection !== false}
                    onChange={(e) => setCms({ ...cms, showStatsSection: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Show Statistics</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cms.showNewsletterSection !== false}
                    onChange={(e) => setCms({ ...cms, showNewsletterSection: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span>Show Newsletter</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACT & SOCIAL CHANNELS */}
      {activeTab === 'contact' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Phone className="h-5 w-5 text-amber-500" />
            Platform Contact & Customer Support Channels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                value={cms.contactEmail || ''}
                onChange={(e) => setCms({ ...cms, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Support Phone / Mobile</label>
              <input
                type="text"
                value={cms.contactPhone || ''}
                onChange={(e) => setCms({ ...cms, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={cms.contactWhatsapp || ''}
                onChange={(e) => setCms({ ...cms, contactWhatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Telegram Handle</label>
              <input
                type="text"
                value={cms.contactTelegram || ''}
                onChange={(e) => setCms({ ...cms, contactTelegram: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Physical Office Address</label>
              <input
                type="text"
                value={cms.contactAddress || ''}
                onChange={(e) => setCms({ ...cms, contactAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOOTER & BRANDING */}
      {activeTab === 'footer' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Type className="h-5 w-5 text-amber-500" />
            Footer Branding & Custom Text
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Footer Tagline</label>
              <input
                type="text"
                value={cms.footerTagline || ''}
                onChange={(e) => setCms({ ...cms, footerTagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Copyright Text</label>
              <input
                type="text"
                value={cms.footerCopyright || ''}
                onChange={(e) => setCms({ ...cms, footerCopyright: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METRICS & STATS */}
      {activeTab === 'stats' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BarChart2 className="h-5 w-5 text-amber-500" />
            Public Statistics & Platform Reach Numbers
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Events Organized</label>
              <input
                type="text"
                value={cms.statsEventsOrganized || ''}
                onChange={(e) => setCms({ ...cms, statsEventsOrganized: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Happy Attendees</label>
              <input
                type="text"
                value={cms.statsHappyAttendees || ''}
                onChange={(e) => setCms({ ...cms, statsHappyAttendees: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Verified Organizers</label>
              <input
                type="text"
                value={cms.statsVerifiedOrganizers || ''}
                onChange={(e) => setCms({ ...cms, statsVerifiedOrganizers: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tickets Issued</label>
              <input
                type="text"
                value={cms.statsTicketsIssued || ''}
                onChange={(e) => setCms({ ...cms, statsTicketsIssued: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cities Reached</label>
              <input
                type="text"
                value={cms.statsCitiesReached || ''}
                onChange={(e) => setCms({ ...cms, statsCitiesReached: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CMS PAGE BUILDER */}
      {activeTab === 'pages' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Dynamic CMS Pages
            </h2>
            <button
              onClick={() => setShowPageModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Page
            </button>
          </div>

          <div className="space-y-3">
            {pages.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No CMS pages generated yet.</p>
            ) : (
              pages.map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{p.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">/pages/{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/pages/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-indigo-500"
                      title="View Page"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeletePage(p.id)}
                      className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg text-rose-500"
                      title="Delete Page"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: BLOG & NEWS */}
      {activeTab === 'blog' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              Blog & News Publishing
            </h2>
            <button
              onClick={() => setShowBlogModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Publish Post
            </button>
          </div>

          <div className="space-y-3">
            {blogPosts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No blog articles published yet.</p>
            ) : (
              blogPosts.map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{b.title}</h4>
                    <p className="text-[11px] text-slate-400">{b.excerpt || 'No excerpt'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBlog(b.id)}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Platform Announcement Banners
            </h2>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> New Announcement
            </button>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No announcements active.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{a.title}</h4>
                    <p className="text-[11px] text-slate-400">{a.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="h-5 w-5 text-amber-500" />
            SEO Keywords & Search Indexing
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Site Meta Title</label>
              <input
                type="text"
                value={cms.seoMetaTitle || ''}
                onChange={(e) => setCms({ ...cms, seoMetaTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Site Meta Description</label>
              <textarea
                value={cms.seoMetaDescription || ''}
                onChange={(e) => setCms({ ...cms, seoMetaDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: SYSTEM LIMITS */}
      {activeTab === 'system' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="h-5 w-5 text-amber-500" />
            System & Catalog Display Limits
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Upcoming Events Limit</label>
              <input
                type="number"
                value={cms.upcomingEventsLimit || 12}
                onChange={(e) => setCms({ ...cms, upcomingEventsLimit: parseInt(e.target.value) || 12 })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Featured Events Limit</label>
              <input
                type="number"
                value={cms.featuredEventsLimit || 3}
                onChange={(e) => setCms({ ...cms, featuredEventsLimit: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Download className="h-5 w-5 text-amber-500" />
            Database Backup & Migration Utility
          </h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Export Complete Database Backup</h4>
                <p className="text-[11px] text-slate-500">Downloads a JSON snapshot of users, events, registrations, tickets, CMS settings, and audit logs.</p>
              </div>
              <a
                href="/api/admin/backup"
                download
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow flex items-center gap-1.5 shrink-0"
              >
                <Download className="h-4 w-4" /> Download JSON Backup
              </a>
            </div>

            <form onSubmit={handleRestoreBackup} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-indigo-500" />
                Restore Database From JSON
              </h4>
              <p className="text-[11px] text-slate-500">Paste the contents of a JSON backup file below to restore platform data.</p>
              <textarea
                value={backupFileText}
                onChange={(e) => setBackupFileText(e.target.value)}
                rows={4}
                placeholder="Paste backup JSON here..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[10px]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow"
              >
                Restore Database State
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD CMS PAGE */}
      {showPageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New CMS Page</h3>
            <form onSubmit={handleCreatePage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Page Title *</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="e.g. Terms of Service"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  placeholder="e.g. terms-of-service"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Page Body Content</label>
                <textarea
                  value={pageContent}
                  onChange={(e) => setPageContent(e.target.value)}
                  rows={5}
                  placeholder="Write page content here..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD BLOG POST */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish Blog Article</h3>
            <form onSubmit={handleCreateBlog} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Article Title *</label>
                <input
                  type="text"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. How to Host Successful Tech Summits"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Excerpt</label>
                <input
                  type="text"
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="Short preview text..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Article Body Content</label>
                <textarea
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  rows={5}
                  placeholder="Full article body..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD ANNOUNCEMENT */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Banner Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Title *</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Early Bird Discount Open!"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Message *</label>
                <textarea
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  rows={3}
                  placeholder="Announcement details..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

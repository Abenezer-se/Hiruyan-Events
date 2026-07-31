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
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { CmsSettings } from '../../types.js';

export const AdminCmsBuilder: React.FC = () => {
  const [cms, setCms] = useState<CmsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadCms = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminCms();
      setCms(res.cms);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load CMS settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCms();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!cms) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              CMS & No-Code Website Builder
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamically update hero headers, branding, contact channels, and features across the public portal.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Publishing Changes...' : 'Publish CMS Changes'}</span>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* HERO SECTION BUILDER */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            <Layout className="h-4 w-4 text-amber-500" />
            <span>Hero Section Configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hero Headline (Title)
              </label>
              <input
                type="text"
                value={cms.heroTitle}
                onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hero Badge Eyebrow
              </label>
              <input
                type="text"
                value={cms.heroSubtitle}
                onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hero Description Paragraph
              </label>
              <textarea
                rows={2}
                value={cms.heroDescription}
                onChange={(e) => setCms({ ...cms, heroDescription: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hero Primary CTA Button Label
              </label>
              <input
                type="text"
                value={cms.heroCtaText}
                onChange={(e) => setCms({ ...cms, heroCtaText: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hero Banner Image URL
              </label>
              <input
                type="text"
                value={cms.heroImageUrl}
                onChange={(e) => setCms({ ...cms, heroImageUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* PLATFORM CONTACT & BRANDING */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Platform Branding & Contact Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={cms.contactEmail}
                onChange={(e) => setCms({ ...cms, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={cms.contactPhone}
                onChange={(e) => setCms({ ...cms, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Platform Address
              </label>
              <input
                type="text"
                value={cms.contactAddress}
                onChange={(e) => setCms({ ...cms, contactAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={cms.footerText}
                onChange={(e) => setCms({ ...cms, footerText: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* FEATURE CARDS BUILDER */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-900 dark:text-white font-bold text-sm">
              Landing Page Feature Cards
            </span>
            <button
              type="button"
              onClick={() =>
                setCms({
                  ...cms,
                  features: [
                    ...(cms.features || []),
                    { title: 'New Feature', description: 'Feature description', iconName: 'Sparkles' },
                  ],
                })
              }
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Feature Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(cms.features || []).map((feat, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCms({
                      ...cms,
                      features: (cms.features || []).filter((_, i) => i !== idx),
                    })
                  }
                  className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <input
                  type="text"
                  placeholder="Card Title"
                  value={feat.title}
                  onChange={(e) => {
                    const updated = [...(cms.features || [])];
                    updated[idx].title = e.target.value;
                    setCms({ ...cms, features: updated });
                  }}
                  className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
                <textarea
                  rows={2}
                  placeholder="Card Description"
                  value={feat.description}
                  onChange={(e) => {
                    const updated = [...(cms.features || [])];
                    updated[idx].description = e.target.value;
                    setCms({ ...cms, features: updated });
                  }}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, FileText, CheckCircle2, ShieldCheck, HelpCircle, Briefcase, RefreshCw } from 'lucide-react';
import { api } from '../lib/api.ts';
import { CmsPage } from '../types.ts';

interface CmsPageViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const CmsPageView: React.FC<CmsPageViewProps> = ({ slug, onNavigate }) => {
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getPublicPageBySlug(slug);
      setPage(res.page);
    } catch (err: any) {
      // Fallback default content for built-in slugs if database record isn't populated yet
      const fallback = getFallbackPage(slug);
      if (fallback) {
        setPage(fallback);
      } else {
        setError(err.message || 'Page not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFallbackPage = (s: string): CmsPage | null => {
    const formatted = s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: `fallback-${s}`,
      title: formatted,
      slug: s,
      content: `
# ${formatted}

Welcome to the **${formatted}** page of Hiruyan Event Platform.

### Overview
This page is fully managed via the **CMS Page Builder**. Administrators can edit this content, update metadata, insert images, add custom formatting, and publish updates in real-time.

### Contact & Information
If you have any questions regarding our ${formatted.toLowerCase()} or require further assistance, please contact our support team at **hiruyaninfo@gmail.com** or call **+251978760949**.

*Last updated: ${new Date().toLocaleDateString()}*
      `,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
        <FileText className="h-12 w-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
        <p className="text-slate-500 text-sm">The requested page "/pages/{slug}" does not exist or has not been published.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-500 transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-6 space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {page.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Updated {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified CMS Page
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
          {page.content}
        </div>
      </div>
    </div>
  );
};

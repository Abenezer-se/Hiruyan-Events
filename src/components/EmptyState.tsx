import React from 'react';
import { CalendarX, Search, Ticket, FolderOpen, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'event' | 'search' | 'ticket' | 'folder';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = 'event',
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return <Search className="h-8 w-8 text-indigo-500" />;
      case 'ticket':
        return <Ticket className="h-8 w-8 text-indigo-500" />;
      case 'folder':
        return <FolderOpen className="h-8 w-8 text-indigo-500" />;
      default:
        return <CalendarX className="h-8 w-8 text-indigo-500" />;
    }
  };

  return (
    <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 my-4 flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-950/20">
        {getIcon()}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

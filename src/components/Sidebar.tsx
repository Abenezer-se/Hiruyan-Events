import React from 'react';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Ticket,
  Heart,
  Bell,
  LogOut,
  Calendar,
  Users,
  QrCode,
  BarChart2,
  PlusCircle,
  X,
  ShieldCheck,
  Globe,
  FolderTree,
  UserCheck,
  CreditCard,
  Tag,
  Star,
  Mail,
  HelpCircle,
  MessageSquare,
  Activity,
  FileText,
  Settings,
  Lock,
  Award,
} from 'lucide-react';
import { User as UserType } from '../types.js';
import { removeAuthToken } from '../lib/api.js';

interface SidebarProps {
  user: UserType;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentRoute,
  onNavigate,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    if (onLogout) {
      onLogout();
    } else {
      removeAuthToken();
      onNavigate('/');
    }
  };

  const navItemClass = (active: boolean, theme: 'admin' | 'organizer' | 'attendee') => {
    if (active) {
      if (theme === 'admin') return 'bg-amber-500 text-slate-950 shadow-md font-bold';
      if (theme === 'organizer') return 'bg-indigo-600 text-white shadow-md font-bold shadow-indigo-600/20';
      return 'bg-emerald-600 text-white shadow-md font-bold shadow-emerald-600/20';
    }
    return 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-medium';
  };

  // SUPER ADMIN MENU SPECIFICATION
  const adminSections = [
    {
      title: 'SUPER ADMIN CORE',
      items: [
        { id: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: '/admin/cms', label: 'CMS / Website Builder', icon: Globe },
        { id: '/admin/events', label: 'All Platform Events', icon: Calendar },
        { id: '/admin/categories', label: 'Categories', icon: FolderTree },
      ],
    },
    {
      title: 'USER & ROLE MANAGEMENT',
      items: [
        { id: '/admin/users', label: 'All Users', icon: Users },
        { id: '/admin/organizers', label: 'Organizers & Approvals', icon: UserCheck },
        { id: '/admin/attendees', label: 'Attendees', icon: User },
        { id: '/admin/roles', label: 'Roles & Permissions', icon: ShieldCheck },
      ],
    },
    {
      title: 'MARKETING & CMS TOOLS',
      items: [
        { id: '/admin/coupons', label: 'Coupons & Discounts', icon: Tag },
        { id: '/admin/sponsors', label: 'Sponsors & Partners', icon: Award },
        { id: '/admin/testimonials', label: 'Testimonials', icon: Star },
        { id: '/admin/faqs', label: 'FAQs Management', icon: HelpCircle },
        { id: '/admin/newsletter', label: 'Newsletter Subscribers', icon: Mail },
        { id: '/admin/contact-messages', label: 'Contact Messages', icon: MessageSquare },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { id: '/admin/reports', label: 'Reports & Analytics', icon: BarChart2 },
        { id: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
        { id: '/admin/security-logs', label: 'Security Logs', icon: Lock },
        { id: '/admin/settings', label: 'Platform Settings', icon: Settings },
      ],
    },
  ];

  // ORGANIZER MENU SPECIFICATION
  const organizerSections = [
    {
      title: 'ORGANIZER HUB',
      items: [
        { id: '/dashboard', label: 'Organizer Overview', icon: LayoutDashboard },
        { id: '/dashboard/create-event', label: 'Create New Event', icon: PlusCircle },
        { id: '/dashboard/my-events', label: 'My Published Events', icon: Calendar },
        { id: '/dashboard/attendees', label: 'Event Attendees & Roster', icon: Users },
        { id: '/dashboard/check-in', label: 'QR Scanner & Check-in', icon: QrCode },
        { id: '/dashboard/analytics', label: 'Sales & Ticket Analytics', icon: BarChart2 },
        { id: '/dashboard/profile', label: 'Organizer Profile', icon: User },
      ],
    },
  ];

  // ATTENDEE MENU SPECIFICATION
  const attendeeSections = [
    {
      title: 'ATTENDEE SPACE',
      items: [
        { id: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: '/dashboard/registered', label: 'Registered Events', icon: CalendarCheck },
        { id: '/dashboard/tickets', label: 'My Event Tickets', icon: Ticket },
        { id: '/dashboard/favorites', label: 'Favorite Events', icon: Heart },
        { id: '/dashboard/notifications', label: 'Notifications', icon: Bell },
        { id: '/dashboard/profile', label: 'Profile & Settings', icon: User },
      ],
    },
  ];

  const currentTheme = user.role === 'admin' ? 'admin' : user.role === 'organizer' ? 'organizer' : 'attendee';
  const activeSections = user.role === 'admin' ? adminSections : user.role === 'organizer' ? organizerSections : attendeeSections;

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 text-xs font-medium">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-slate-900 dark:text-white capitalize">{user.role} Menu</span>
        </div>
        <button onClick={onCloseMobile} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Role Profile Header Card */}
      <div className="p-3 m-3 rounded-2xl border flex items-center gap-3 transition"
        style={{
          backgroundColor: user.role === 'admin' ? 'rgba(245, 158, 11, 0.08)' : user.role === 'organizer' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          borderColor: user.role === 'admin' ? 'rgba(245, 158, 11, 0.3)' : user.role === 'organizer' ? 'rgba(79, 70, 229, 0.3)' : 'rgba(16, 185, 129, 0.3)',
        }}
      >
        <img
          src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.fullName}
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-400/30 shrink-0"
        />
        <div className="overflow-hidden min-w-0 flex-1">
          <p className="font-bold text-slate-900 dark:text-white truncate text-xs">{user.fullName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {user.role === 'admin' ? (
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 uppercase flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> SUPER ADMIN
              </span>
            ) : user.role === 'organizer' ? (
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase">
                ORGANIZER
              </span>
            ) : (
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase">
                ATTENDEE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section Navigation Items */}
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-2 scrollbar-thin">
        {activeSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 px-2 block mb-1">
              {sec.title}
            </span>
            <nav className="space-y-0.5">
              {sec.items.map(item => {
                const Icon = item.icon;
                const active = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition ${navItemClass(active, currentTheme)}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? (currentTheme === 'admin' ? 'text-slate-950' : 'text-white') : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onCloseMobile} />
          <div className="relative flex-1 max-w-xs w-full bg-white dark:bg-slate-900 z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

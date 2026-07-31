import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Compass, User as UserIcon, LogOut, Sun, Moon, Shield, Sparkles, Ticket, Heart, PlusCircle, CheckCircle2, ChevronDown, Menu, X } from 'lucide-react';
import { User, Notification } from '../types.js';
import { api, removeAuthToken } from '../lib/api.js';

interface NavbarProps {
  user: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  currentRoute: string;
  onToggleMobileSidebar?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onNavigate,
  onLogout,
  currentRoute,
  onToggleMobileSidebar,
  darkMode,
  onToggleDarkMode,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const [activeSection, setActiveSection] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (currentRoute === '/') {
      const handleScroll = () => {
        const sections = ['home', 'about', 'events', 'categories', 'stats', 'contact'];
        const scrollPosition = window.scrollY + 100;

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(section);
              break;
            }
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [currentRoute]);

  const handleNavClick = (sectionId: string, path: string = '/') => {
    setMobileMenuOpen(false);
    if (currentRoute !== path) {
      onNavigate(path);
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate(path);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left branding & mobile menu toggle */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
                Hiruyan
              </span>
              <span className="hidden sm:inline-block ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                EVENTS
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => handleNavClick('home', '/')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentRoute === '/' && activeSection === 'home'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('events', '/events')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentRoute === '/events' || (currentRoute === '/' && activeSection === 'events')
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Events
          </button>

          <button
            onClick={() => handleNavClick('categories', '/')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentRoute === '/' && activeSection === 'categories'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Categories
          </button>

          <button
            onClick={() => handleNavClick('about', '/')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentRoute === '/' && activeSection === 'about'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            About
          </button>

          <button
            onClick={() => handleNavClick('stats', '/')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentRoute === '/' && activeSection === 'stats'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Statistics
          </button>

          <button
            onClick={() => handleNavClick('contact', '/')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentRoute === '/' && activeSection === 'contact'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Contact
          </button>

          {user && (
            <button
              onClick={() => onNavigate('/dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentRoute.startsWith('/dashboard')
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Switch */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Organizer Create Event Quick Action */}
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <button
              onClick={() => onNavigate('/dashboard/create-event')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition hover:shadow"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          )}

          {/* User Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="pt-2 max-h-80 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications right now.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.linkUrl) onNavigate(n.linkUrl);
                            setShowNotifications(false);
                          }}
                          className={`p-2.5 rounded-xl cursor-pointer text-xs transition flex gap-2.5 ${
                            n.read
                              ? 'bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                              : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white border-l-2 border-indigo-600'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'checkin' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : n.type === 'ticket' ? (
                              <Ticket className="h-4 w-4 text-indigo-500" />
                            ) : (
                              <Bell className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{n.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth Action */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                  {user.fullName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="px-4 py-2.5">
                    <p className="font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4 text-indigo-500" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('/dashboard/tickets');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <Ticket className="h-4 w-4 text-emerald-500" />
                      My Tickets
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('/dashboard/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4 text-amber-500" />
                      Profile & Settings
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition hover:shadow"
              >
                Get Started
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

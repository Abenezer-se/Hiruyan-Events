import React, { useState, useEffect } from 'react';
import { User, Event, CmsSettings } from './types.js';
import { api } from './lib/api.js';

// Layout Components
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Footer } from './components/Footer.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { AllEventsPage } from './pages/AllEventsPage.tsx';
import { EventDetailsPage } from './pages/EventDetailsPage.tsx';

// User Dashboard Pages
import { UserDashboard } from './pages/UserDashboard.tsx';
import { RegisteredEventsPage } from './pages/RegisteredEventsPage.tsx';
import { MyTicketsPage } from './pages/MyTicketsPage.tsx';
import { FavoriteEventsPage } from './pages/FavoriteEventsPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage.tsx';

// Organizer Pages
import { OrganizerEventsPage } from './pages/OrganizerEventsPage.tsx';
import { CreateEditEventPage } from './pages/CreateEditEventPage.tsx';
import { AttendeeManagementPage } from './pages/AttendeeManagementPage.tsx';
import { CheckInManagementPage } from './pages/CheckInManagementPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';

// Modals & Tools
import { AuthModal } from './pages/AuthModal.tsx';
import { AutoWalkthrough } from './components/AutoWalkthrough.tsx';
import { CmsPageView } from './pages/CmsPageView.tsx';

// Super Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminCmsBuilder } from './pages/admin/AdminCmsBuilder.tsx';
import { AdminUsersManager } from './pages/admin/AdminUsersManager.tsx';
import { AdminEventsManager } from './pages/admin/AdminEventsManager.tsx';
import { AdminCategoriesManager } from './pages/admin/AdminCategoriesManager.tsx';
import { AdminMarketingManager } from './pages/admin/AdminMarketingManager.tsx';
import { AdminLogsViewer } from './pages/admin/AdminLogsViewer.tsx';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cms, setCms] = useState<CmsSettings | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname || '/');

  // Modals & Navigation state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hiruyan_theme') === 'dark';
  });

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Synchronize HTML element dark class
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hiruyan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hiruyan_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    checkAuth();
    loadCmsSettings();

    // Listen to browser popstate for history navigation
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
    }
  }, [user]);

  const checkAuth = async () => {
    const token = localStorage.getItem('hiruyan_auth_token');
    if (token) {
      try {
        const res = await api.getCurrentUser();
        setUser(res.user);
      } catch (err) {
        console.warn('Invalid session, logging out', err);
        api.logout();
        setUser(null);
      }
    }
    setAuthChecked(true);
  };

  const loadCmsSettings = async () => {
    try {
      const res = await api.getCms();
      if (res && res.cms) setCms(res.cms);
    } catch (e) {
      console.warn('Failed to load CMS settings:', e);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await api.getNotifications();
      const unread = (res.notifications || []).filter((n: any) => !n.read).length;
      setUnreadNotifications(unread);
    } catch (e) {
      // Ignore unauth errors
    }
  };

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Check if route matches event details
    if (route.startsWith('/events/')) {
      const parts = route.split('/');
      setSelectedEventId(parts[2]);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentRoute('/');
    window.history.pushState({}, '', '/');
    setUser(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEventId(event.id);
    navigateTo(`/events/${event.id}`);
  };

  // Determine if route is inside Dashboard or Admin space
  const isDashboardRoute = currentRoute.startsWith('/dashboard') || currentRoute.startsWith('/admin');

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400">Initializing Hiruyan Event Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Main Navigation Bar */}
      <Navbar
        user={user}
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        unreadCount={unreadNotifications}
      />

      {/* Main Body Layout */}
      <div className="pt-16 min-h-[calc(100vh-4rem)]">
        {isDashboardRoute && user ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Dashboard Role-Based Left Sidebar */}
              <div className="w-full lg:w-64 shrink-0">
                <Sidebar
                  user={user}
                  currentRoute={currentRoute}
                  onNavigate={navigateTo}
                  onLogout={handleLogout}
                />
              </div>

              {/* Dashboard Content Right Area */}
              <div className="flex-1 min-w-0">
                {/* 1. SUPER ADMIN DASHBOARD SPACE */}
                {user.role === 'admin' && (
                  <>
                    {(currentRoute === '/dashboard' || currentRoute === '/admin' || currentRoute === '/admin/dashboard') && (
                      <AdminDashboard onNavigate={navigateTo} />
                    )}
                    {(currentRoute === '/admin/cms' || currentRoute === '/admin/settings') && (
                      <AdminCmsBuilder />
                    )}
                    {(currentRoute === '/admin/users' || currentRoute === '/admin/organizers' || currentRoute === '/admin/attendees' || currentRoute === '/admin/roles') && (
                      <AdminUsersManager />
                    )}
                    {currentRoute === '/admin/events' && (
                      <AdminEventsManager onNavigate={navigateTo} />
                    )}
                    {currentRoute === '/admin/categories' && (
                      <AdminCategoriesManager />
                    )}
                    {(currentRoute === '/admin/coupons' || currentRoute === '/admin/sponsors' || currentRoute === '/admin/testimonials' || currentRoute === '/admin/faqs' || currentRoute === '/admin/contact-messages' || currentRoute === '/admin/newsletter') && (
                      <AdminMarketingManager />
                    )}
                    {(currentRoute === '/admin/audit-logs' || currentRoute === '/admin/security-logs' || currentRoute === '/admin/reports') && (
                      <AdminLogsViewer />
                    )}
                  </>
                )}

                {/* 2. ORGANIZER / ADMIN EVENT CREATION DASHBOARD SPACE */}
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <>
                    {user.role === 'organizer' && (currentRoute === '/dashboard' || currentRoute === '/dashboard/my-events') && (
                      <OrganizerEventsPage
                        onNavigate={navigateTo}
                        onSelectEvent={handleSelectEvent}
                      />
                    )}
                    {currentRoute === '/dashboard/create-event' && (
                      <CreateEditEventPage
                        onBack={() => navigateTo(user.role === 'admin' ? '/admin/events' : '/dashboard/my-events')}
                        onNavigate={navigateTo}
                      />
                    )}
                    {currentRoute.startsWith('/dashboard/edit-event/') && (
                      <CreateEditEventPage
                        eventId={currentRoute.split('/')[3]}
                        onBack={() => navigateTo(user.role === 'admin' ? '/admin/events' : '/dashboard/my-events')}
                        onNavigate={navigateTo}
                      />
                    )}
                    {currentRoute.startsWith('/dashboard/attendees') && (
                      <AttendeeManagementPage />
                    )}
                    {currentRoute.startsWith('/dashboard/check-in') && (
                      <CheckInManagementPage />
                    )}
                    {currentRoute === '/dashboard/analytics' && (
                      <AnalyticsPage />
                    )}
                  </>
                )}

                {/* 3. ATTENDEE DASHBOARD SPACE */}
                {user.role === 'attendee' && (
                  <>
                    {currentRoute === '/dashboard' && (
                      <UserDashboard
                        user={user}
                        onNavigate={navigateTo}
                        onSelectEvent={handleSelectEvent}
                      />
                    )}
                    {currentRoute === '/dashboard/registered' && (
                      <RegisteredEventsPage />
                    )}
                    {currentRoute === '/dashboard/tickets' && (
                      <MyTicketsPage />
                    )}
                    {currentRoute === '/dashboard/favorites' && (
                      <FavoriteEventsPage
                        onSelectEvent={handleSelectEvent}
                        onNavigate={navigateTo}
                      />
                    )}
                    {currentRoute === '/dashboard/notifications' && (
                      <NotificationsPage onNavigate={navigateTo} />
                    )}
                  </>
                )}

                {/* Shared Profile Settings Page for all Roles */}
                {currentRoute === '/dashboard/profile' && (
                  <ProfileSettingsPage
                    user={user}
                    onUpdateUser={setUser}
                  />
                )}
              </div>

            </div>
          </div>
        ) : (
          /* Public / Non-Dashboard Pages Layout */
          <main>
            {(currentRoute === '/' || currentRoute === '') && (
              <HomePage
                onNavigate={navigateTo}
                onSelectEvent={handleSelectEvent}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentRoute === '/events' && (
              <AllEventsPage
                onSelectEvent={handleSelectEvent}
                onNavigate={navigateTo}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            )}

            {currentRoute.startsWith('/events/') && (
              <EventDetailsPage
                idOrSlug={currentRoute.split('/')[2] || selectedEventId || ''}
                user={user}
                onBack={() => navigateTo('/events')}
                onOpenAuth={() => handleOpenAuth('login')}
                onNavigate={navigateTo}
              />
            )}

            {currentRoute.startsWith('/pages/') && (
              <CmsPageView
                slug={currentRoute.split('/')[2] || 'about'}
                onNavigate={navigateTo}
              />
            )}

            {/* Fallback for unmatched public routes or logged-out access to protected routes */}
            {currentRoute !== '/' && currentRoute !== '' && currentRoute !== '/events' && !currentRoute.startsWith('/events/') && !currentRoute.startsWith('/pages/') && (
              <HomePage
                onNavigate={navigateTo}
                onSelectEvent={handleSelectEvent}
                onOpenAuth={handleOpenAuth}
              />
            )}
          </main>
        )}
      </div>

      {/* Footer on public pages */}
      {!isDashboardRoute && (
        <Footer cms={cms} onNavigate={navigateTo} />
      )}

      {/* Authentication Modal */}
      {authModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(userData) => {
            setUser(userData);
            setAuthModalOpen(false);
            if (userData.role === 'admin') {
              navigateTo('/admin/dashboard');
            } else if (userData.role === 'organizer') {
              navigateTo('/dashboard/my-events');
            } else {
              navigateTo('/dashboard');
            }
          }}
          onSuccessLogin={(userData) => {
            setUser(userData);
            setAuthModalOpen(false);
            if (userData.role === 'admin') {
              navigateTo('/admin/dashboard');
            } else if (userData.role === 'organizer') {
              navigateTo('/dashboard/my-events');
            } else {
              navigateTo('/dashboard');
            }
          }}
        />
      )}

      {/* Automatic Page Walkthrough Overlay Component */}
      <AutoWalkthrough
        user={user}
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onUpdateUser={setUser}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Compass,
  ShieldCheck,
  Briefcase,
  User,
  Globe,
  Calendar,
  Ticket,
  BarChart2,
  Users,
  Bell,
  Settings,
  PlusCircle,
  FileText,
  HelpCircle,
  QrCode,
} from 'lucide-react';
import { User as UserType } from '../types.js';
import { api, setAuthToken } from '../lib/api.js';

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  route: string;
  requiredRole?: 'admin' | 'organizer' | 'attendee' | 'public';
  category: 'Public' | 'Attendee' | 'Organizer' | 'Super Admin';
  icon: React.ElementType;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'home',
    title: '1. Public Landing & Discovery',
    description: 'Explore featured events, category filters, interactive stats, and platform overview.',
    route: '/',
    requiredRole: 'public',
    category: 'Public',
    icon: Globe,
  },
  {
    id: 'all-events',
    title: '2. All Events Directory',
    description: 'Browse, search, and filter all upcoming community & tech conferences.',
    route: '/events',
    requiredRole: 'public',
    category: 'Public',
    icon: Calendar,
  },
  {
    id: 'event-details',
    title: '3. Event Details & Agenda',
    description: 'View schedule, interactive venue maps, organizer info, and ticket tiers.',
    route: '/events/evt-1',
    requiredRole: 'public',
    category: 'Public',
    icon: FileText,
  },
  {
    id: 'attendee-dashboard',
    title: '4. Attendee Dashboard',
    description: 'Personalized hub for registered events, ticket passes, and saved favorites.',
    route: '/dashboard',
    requiredRole: 'attendee',
    category: 'Attendee',
    icon: User,
  },
  {
    id: 'my-tickets',
    title: '5. Digital Tickets & Dynamic QR',
    description: 'Access ticket passes with live QR codes for instantaneous event check-in.',
    route: '/dashboard/tickets',
    requiredRole: 'attendee',
    category: 'Attendee',
    icon: Ticket,
  },
  {
    id: 'notifications',
    title: '6. Real-time Notifications',
    description: 'Track event updates, registration receipts, and system alerts.',
    route: '/dashboard/notifications',
    requiredRole: 'attendee',
    category: 'Attendee',
    icon: Bell,
  },
  {
    id: 'organizer-events',
    title: '7. Organizer Published Events',
    description: 'Manage hosted events, publish state, ticket quotas, and attendee lists.',
    route: '/dashboard/my-events',
    requiredRole: 'organizer',
    category: 'Organizer',
    icon: Briefcase,
  },
  {
    id: 'create-event',
    title: '8. Event Builder Studio',
    description: 'Multi-step event creation with ticket pricing, custom tags, and location search.',
    route: '/dashboard/create-event',
    requiredRole: 'organizer',
    category: 'Organizer',
    icon: PlusCircle,
  },
  {
    id: 'organizer-analytics',
    title: '9. Event Analytics & Revenue',
    description: 'Deep metrics into ticket sales, registration velocity, and attendance rate.',
    route: '/dashboard/analytics',
    requiredRole: 'organizer',
    category: 'Organizer',
    icon: BarChart2,
  },
  {
    id: 'organizer-checkin',
    title: '10. QR Scanner & Check-in',
    description: 'Scan attendee QR passes or perform manual list check-ins in real time.',
    route: '/dashboard/check-in',
    requiredRole: 'organizer',
    category: 'Organizer',
    icon: QrCode,
  },
  {
    id: 'admin-dashboard',
    title: '11. Super Admin Command Center',
    description: 'Platform-wide governance, total platform revenue, and live system status.',
    route: '/admin/dashboard',
    requiredRole: 'admin',
    category: 'Super Admin',
    icon: ShieldCheck,
  },
  {
    id: 'admin-cms',
    title: '12. CMS & Website Builder',
    description: 'Customize hero headlines, dynamic feature cards, and landing page content.',
    route: '/admin/cms',
    requiredRole: 'admin',
    category: 'Super Admin',
    icon: Settings,
  },
  {
    id: 'admin-users',
    title: '13. User & Role Management',
    description: 'Manage platform accounts, approve organizer requests, and adjust roles.',
    route: '/admin/users',
    requiredRole: 'admin',
    category: 'Super Admin',
    icon: Users,
  },
];

interface AutoWalkthroughProps {
  user: UserType | null;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onUpdateUser: (user: UserType | null) => void;
}

export const AutoWalkthrough: React.FC<AutoWalkthroughProps> = ({
  user,
  onNavigate,
  onUpdateUser,
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [intervalSec, setIntervalSec] = useState<number>(4);
  const [isSwitchingRole, setIsSwitchingRole] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimRef = useRef<number | null>(null);

  const currentStep = WALKTHROUGH_STEPS[currentStepIndex];

  // Helper to automatically switch roles when required for step
  const ensureRoleForStep = async (step: WalkthroughStep) => {
    if (!step.requiredRole || step.requiredRole === 'public') return;

    if (user && user.role === step.requiredRole) return;

    setIsSwitchingRole(true);
    let demoEmail = 'attendee@hiruyan.com';
    let demoPass = 'attendee123';
    if (step.requiredRole === 'admin') {
      demoEmail = 'admin@hiruyan.com';
      demoPass = 'admin123';
    } else if (step.requiredRole === 'organizer') {
      demoEmail = 'organizer@hiruyan.com';
      demoPass = 'organizer123';
    }

    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      setAuthToken(res.token);
      onUpdateUser(res.user);
    } catch (err) {
      console.warn('Auto walkthrough role switch error:', err);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const goToStep = async (index: number) => {
    let targetIndex = index;
    if (targetIndex >= WALKTHROUGH_STEPS.length) targetIndex = 0;
    if (targetIndex < 0) targetIndex = WALKTHROUGH_STEPS.length - 1;

    const step = WALKTHROUGH_STEPS[targetIndex];
    setCurrentStepIndex(targetIndex);
    setProgressPercent(0);

    await ensureRoleForStep(step);
    onNavigate(step.route);
  };

  const startWalkthrough = async () => {
    setActive(true);
    setIsPlaying(true);
    await goToStep(0);
  };

  const stopWalkthrough = () => {
    setActive(false);
    setIsPlaying(false);
    setProgressPercent(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
  };

  const handleNext = () => {
    goToStep(currentStepIndex + 1);
  };

  const handlePrev = () => {
    goToStep(currentStepIndex - 1);
  };

  // Handle auto-advance interval
  useEffect(() => {
    if (!active || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
      setProgressPercent(0);
      return;
    }

    let startTime = Date.now();
    const durationMs = intervalSec * 1000;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgressPercent(pct);

      if (pct < 100) {
        progressAnimRef.current = requestAnimationFrame(updateProgress);
      } else {
        handleNext();
      }
    };

    progressAnimRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);
    };
  }, [active, isPlaying, currentStepIndex, intervalSec]);

  if (!active) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={startWalkthrough}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 group border border-white/20"
        >
          <Sparkles className="h-4 w-4 animate-spin text-amber-200" style={{ animationDuration: '4s' }} />
          <span>Auto Page Walkthrough</span>
          <Play className="h-3.5 w-3.5 fill-white" />
        </button>
      </div>
    );
  }

  const StepIcon = currentStep.icon;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-white p-4 space-y-3">
        {/* Progress Bar Header */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 h-full transition-all duration-100 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Step Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shrink-0">
              <StepIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentStep.category} ({currentStepIndex + 1}/{WALKTHROUGH_STEPS.length})
                </span>
                {isSwitchingRole && (
                  <span className="text-[10px] text-amber-400 font-semibold animate-pulse flex items-center gap-1">
                    <Compass className="h-3 w-3 animate-spin" /> Switching Demo Account...
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-white truncate mt-0.5">{currentStep.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-1">{currentStep.description}</p>
            </div>
          </div>

          {/* Direct Step Picker Dropdown */}
          <div className="shrink-0">
            <select
              value={currentStepIndex}
              onChange={(e) => goToStep(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[160px] md:max-w-[200px] truncate"
            >
              {WALKTHROUGH_STEPS.map((s, idx) => (
                <option key={s.id} value={idx}>
                  {idx + 1}. {s.title.replace(/^\d+\.\s*/, '')}
                </option>
              ))}
            </select>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Speed Selector */}
            <select
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-[11px] text-slate-300 rounded-xl px-2 py-1.5 focus:outline-none"
              title="Auto-advance interval speed"
            >
              <option value={2}>2s / page</option>
              <option value={4}>4s / page</option>
              <option value={7}>7s / page</option>
            </select>

            {/* Prev */}
            <button
              onClick={handlePrev}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md transition flex items-center justify-center"
              title={isPlaying ? 'Pause Auto Tour' : 'Play Auto Tour'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Exit */}
            <button
              onClick={stopWalkthrough}
              className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl border border-rose-500/30 transition ml-1"
              title="Exit Walkthrough"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

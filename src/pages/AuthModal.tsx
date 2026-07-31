import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Sparkles, AlertCircle, Loader2, ShieldCheck, Briefcase } from 'lucide-react';
import { api, setAuthToken } from '../lib/api.js';
import { User as UserType } from '../types.js';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: (user: UserType) => void;
  onSuccessLogin?: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onClose,
  onSuccess,
  onSuccessLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say'>('male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthSuccess = (user: UserType) => {
    if (typeof onSuccess === 'function') onSuccess(user);
    if (typeof onSuccessLogin === 'function') onSuccessLogin(user);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        setAuthToken(res.token);
        handleAuthSuccess(res.user);
      } else {
        const res = await api.register({
          email,
          password,
          fullName,
          username: username || email.split('@')[0],
          role,
          gender,
          phoneNumber,
          address,
        });
        setAuthToken(res.token);
        handleAuthSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoRole: 'admin' | 'organizer' | 'attendee') => {
    setIsLoading(true);
    setErrorMsg('');
    let demoEmail = 'attendee@hiruyan.com';
    let demoPass = 'attendee123';
    if (demoRole === 'admin') {
      demoEmail = 'admin@hiruyan.com';
      demoPass = 'admin123';
    } else if (demoRole === 'organizer') {
      demoEmail = 'organizer@hiruyan.com';
      demoPass = 'organizer123';
    }
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      setAuthToken(res.token);
      handleAuthSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base text-slate-900 dark:text-white">
              {mode === 'login' ? 'Sign In to Hiruyan' : 'Create Your Account'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role toggle for registration */}
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('attendee')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                role === 'attendee'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Event Attendee</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                role === 'organizer'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Event Organizer</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. alexmorgan"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Gender (Sets Default Avatar System)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition ${
                      gender === 'male'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Male 👨
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition ${
                      gender === 'female'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Female 👩
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('prefer_not_to_say')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition ${
                      gender === 'prefer_not_to_say'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Neutral 🧑
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="City, State / Country"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Multi-Role Quick Demo Login helper buttons */}
        {mode === 'login' && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block text-center">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
                className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl font-medium border border-amber-500/20 text-[11px] flex items-center justify-center gap-1 transition"
              >
                <ShieldCheck className="h-3 w-3" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('organizer')}
                disabled={isLoading}
                className="py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium border border-indigo-500/20 text-[11px] flex items-center justify-center gap-1 transition"
              >
                <Briefcase className="h-3 w-3" />
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('attendee')}
                disabled={isLoading}
                className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium border border-emerald-500/20 text-[11px] flex items-center justify-center gap-1 transition"
              >
                <User className="h-3 w-3" />
                Attendee
              </button>
            </div>
          </div>
        )}

        {/* Mode Toggle footer */}
        <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

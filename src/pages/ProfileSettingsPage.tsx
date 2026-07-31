import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Camera, Lock, CheckCircle2, AlertCircle, Loader2, Trash2, Link as LinkIcon } from 'lucide-react';
import { User } from '../types.js';
import { api } from '../lib/api.js';

interface ProfileSettingsPageProps {
  user: User;
  onUpdateUser: (updated: User) => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  user,
  onUpdateUser,
}) => {
  // Profile info state
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.uploadImage(base64, file.name);
        setAvatarUrl(res.url);
        setProfileMsg({ type: 'success', text: 'Profile picture uploaded! Click Save to apply.' });
      } catch (err: any) {
        setProfileMsg({ type: 'error', text: err.message || 'Image upload failed' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setAvatarUrl(imageUrlInput.trim());
    setImageUrlInput('');
    setProfileMsg({ type: 'success', text: 'Image URL updated. Click Save to apply.' });
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'user'}`);
    setProfileMsg({ type: 'success', text: 'Avatar reset to default.' });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await api.updateProfile({
        fullName,
        username,
        email,
        phoneNumber,
        address,
        avatarUrl,
      });

      onUpdateUser(res.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } fontFinally: {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMsg(null);

    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Password update failed' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile & Settings</h1>
        <p className="text-xs text-slate-500">Manage your personal account details, avatar, and security options.</p>
      </div>

      {/* Main Profile Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-indigo-500" />
          <span>Personal Information</span>
        </h2>

        {/* Profile Picture Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <img
            src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
            alt={fullName}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
          />

          <div className="space-y-3 flex-1 text-center sm:text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Profile Photo
            </span>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                <Camera className="h-3.5 w-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950 hover:text-rose-600 transition flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Photo</span>
              </button>
            </div>

            <div className="flex items-center gap-2 max-w-md pt-1">
              <input
                type="url"
                placeholder="Or paste image URL (https://...)"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-slate-800 text-white dark:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Apply URL
              </button>
            </div>
          </div>
        </div>

        {profileMsg && (
          <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            profileMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {profileMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Address / City / Country
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Full physical address or city"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-500" />
          <span>Security & Password</span>
        </h2>

        {passwordMsg && (
          <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            passwordMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {passwordMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Current Password (Verification)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

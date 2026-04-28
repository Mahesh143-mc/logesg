import { useState, useEffect, FormEvent } from 'react';
import { auth, db } from '../firebase';
import { signOut, updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { 
  LogOut, 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Globe, 
  Save, 
  Key, 
  Building, 
  ChevronRight,
  Monitor,
  CheckCircle2,
  AlertCircle,
  X,
  IndianRupee,
  Sun,
  Moon,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const { profile, user, urlMode, setUrlMode, theme, setTheme } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    displayName: profile?.displayName || '',
    businessName: profile?.businessName || '',
    phone: profile?.phone || '',
    taxPercentage: profile?.taxPercentage || 0
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setProfileForm({
      displayName: profile?.displayName || '',
      businessName: profile?.businessName || '',
      phone: profile?.phone || '',
      taxPercentage: profile?.taxPercentage || 0
    });
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileForm.displayName,
        businessName: profileForm.businessName,
        phone: profileForm.phone,
        taxPercentage: Number(profileForm.taxPercentage)
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Password update failed. Please check your current password.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col space-y-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm font-medium text-slate-500">Manage your account, security, and preferences</p>
      </header>

      {message && (
        <div className={cn(
          "p-4 rounded-xl flex items-center space-x-3 mb-6 animate-in fade-in zoom-in-95 duration-300", 
          message.type === 'success' 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
            : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 space-y-6 shrink-0">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-3 shadow-sm flex flex-col gap-1">
            <TabButton 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
              icon={User}
              label="Profile Settings"
            />
            <TabButton 
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')}
              icon={Shield}
              label="Security"
            />
            <TabButton 
              active={activeTab === 'preferences'} 
              onClick={() => setActiveTab('preferences')}
              icon={Globe}
              label="Preferences"
            />
          </div>

          <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
            </div>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={cn(
                "w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                theme === 'dark' ? "bg-indigo-600" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                theme === 'dark' ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-4 rounded-2xl bg-white dark:bg-[#18181b] border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium text-sm transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-[#18181b] rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
          
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl font-bold uppercase shrink-0">
                  {profileForm.displayName?.[0] || 'A'}
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{profileForm.displayName || 'Administrator'}</h2>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <div className="inline-block mt-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold capitalize">
                    Role: {profile?.role || 'Admin'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  icon={User}
                  label="Full Name"
                  value={profileForm.displayName}
                  onChange={(val) => setProfileForm({ ...profileForm, displayName: val })}
                  placeholder="Enter full name"
                />
                <FormInput
                  icon={Building}
                  label="Business Name"
                  value={profileForm.businessName}
                  onChange={(val) => setProfileForm({ ...profileForm, businessName: val })}
                  placeholder="Enter business name"
                />
                <FormInput
                  icon={Smartphone}
                  label="Phone Number"
                  value={profileForm.phone}
                  onChange={(val) => setProfileForm({ ...profileForm, phone: val })}
                  placeholder="Enter phone number"
                />
                <FormInput
                  icon={IndianRupee}
                  label="Tax Percentage (%)"
                  type="number"
                  value={profileForm.taxPercentage}
                  onChange={(val) => setProfileForm({ ...profileForm, taxPercentage: Number(val) })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
              <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Change Password</h2>
                 <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>

              <div className="max-w-md space-y-6">
                <FormInput
                  icon={Key}
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(val) => setPasswordForm({ ...passwordForm, currentPassword: val })}
                  placeholder="Enter current password"
                />
                
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  <FormInput
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(val) => setPasswordForm({ ...passwordForm, newPassword: val })}
                    placeholder="Enter new password"
                  />
                  <FormInput
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(val) => setPasswordForm({ ...passwordForm, confirmPassword: val })}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                 <button 
                  disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
              <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Preferences</h2>
                 <p className="text-sm text-slate-500 mt-1">Manage application behavior and display settings.</p>
              </div>

              <div className="space-y-4">
                {/* URL Mode Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex items-center space-x-4">
                    <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Static Routing Mode</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Force all URLs to resolve via index.html (useful for certain hostings)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUrlMode(urlMode === 'static' ? 'standard' : 'static')}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                      urlMode === 'static' ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300",
                      urlMode === 'static' ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                {/* Notifications Dummy Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-60">
                  <div className="flex items-center space-x-4">
                    <div className="p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Email Notifications</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Receive daily summary emails (Coming soon)</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs font-semibold">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        active 
          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "opacity-100" : "opacity-60")} />
      <span>{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );
}

function FormInput({ icon: Icon, label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />}
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white shadow-sm",
            Icon && "pl-9"
          )}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

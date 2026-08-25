import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Lock, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Loader2,
  Save,
  ShieldAlert
} from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import FormInput from '../../components/ui/FormInput';

// ─── Password Validation Schema ──────────────────────────────────────
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'password' | 'privacy'>('notifications');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Notification states
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotionalEmails: false,
    newsletterSubscription: true,
    smsNotifications: true,
  });

  // Privacy & Preferences states
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showEmail: false,
    showPhone: true,
    darkMode: false,
  });

  // Password submission states
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty: isPasswordDirty },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveGeneralPreferences = async () => {
    setIsUpdatingSettings(true);
    setSettingsSuccess(false);
    try {
      // Simulate API Save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    setPasswordError('');
    setIsPasswordSuccess(false);

    try {
      // Safely process input payload
      console.info('Initiating password update with validated data attributes:', Object.keys(data));
      
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsPasswordSuccess(true);
      reset();
      setTimeout(() => setIsPasswordSuccess(false), 4000);
    } catch (error: any) {
      setPasswordError(
        error.response?.data?.message || 'Failed to change password. Verify your current password.'
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'notifications' as const, label: 'Alerts', icon: Bell },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ];

  return (
    <AccountLayout
      title="Security & Settings"
      subtitle="Refine your alert limits, access controls, and dark-mode layout parameters."
    >
      <div className="space-y-6 text-stone-900">
        
        {/* ── 1. Modern Pill-Tab Switcher ──────────────────────────────── */}
        <div className="bg-stone-100/80 p-1.5 rounded-2xl flex gap-1.5 border border-stone-200/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-heading font-black text-xs sm:text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-md shadow-stone-200/55'
                    : 'text-stone-500 hover:text-stone-950 hover:bg-white/45'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-primary' : 'text-stone-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── 2. Feedback Toasts/Notifiers ────────────────────────────── */}
        {settingsSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Preferences updated successfully!</span>
          </div>
        )}

        {isPasswordSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Your password has been changed securely.</span>
          </div>
        )}

        {passwordError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 animate-[fadeIn_0.2s_ease-out]">
            <AlertTriangle size={16} className="text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {/* ── 3. Tabs Contents ───────────────────────────────────────── */}
        
        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            {/* Email Notifications Segment */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 space-y-5">
              <h3 className="font-heading font-black text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-amber-950/5">
                <Mail size={18} className="text-primary" />
                Email Subscriptions
              </h3>
              
              <div className="space-y-4">
                {/* Switch Item 1 */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm text-stone-800">Transactional Order Updates</p>
                    <p className="text-xs text-stone-500">Receipts, delivery ETA changes, and driver tracking updates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle('orderUpdates')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationSettings.orderUpdates ? 'bg-primary' : 'bg-stone-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationSettings.orderUpdates ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Item 2 */}
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-dashed border-stone-200">
                  <div>
                    <p className="font-bold text-sm text-stone-800">Flash Promos & Coupons</p>
                    <p className="text-xs text-stone-500">Get codes for discount treats and limited batch stock releases.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle('promotionalEmails')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationSettings.promotionalEmails ? 'bg-primary' : 'bg-stone-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationSettings.promotionalEmails ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Item 3 */}
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-dashed border-stone-200">
                  <div>
                    <p className="font-bold text-sm text-stone-800">Weekly Snack Digest</p>
                    <p className="text-xs text-stone-500">Highlighting local artisans, new snack flavors, and reviews.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationToggle('newsletterSubscription')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationSettings.newsletterSubscription ? 'bg-primary' : 'bg-stone-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notificationSettings.newsletterSubscription ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* SMS Notifications Segment */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 space-y-5">
              <h3 className="font-heading font-black text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-amber-950/5">
                <Smartphone size={18} className="text-primary" />
                Mobile Text Settings
              </h3>
              
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-stone-800">Dispatch SMS Notifications</p>
                  <p className="text-xs text-stone-500">Receive texts when riders depart or arrive at your address.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('smsNotifications')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationSettings.smsNotifications ? 'bg-primary' : 'bg-stone-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notificationSettings.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="pt-4 flex items-center justify-end">
              <button
                onClick={saveGeneralPreferences}
                disabled={isUpdatingSettings}
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isUpdatingSettings ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Preferences...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Preference Layout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── PASSWORD CHANGE TAB ── */}
        {activeTab === 'password' && (
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 space-y-4">
              
              <div className="flex items-center gap-2 pb-3 border-b border-amber-950/5">
                <ShieldAlert size={18} className="text-primary" />
                <h3 className="font-heading font-black text-base text-stone-900">
                  Update Account Password
                </h3>
              </div>

              {/* Current Password */}
              <div className="relative">
                <FormInput
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  error={errors.currentPassword?.message}
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-10 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="relative">
                  <FormInput
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-10 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <FormInput
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-10 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password guidelines helper */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/50 mt-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                  Secure Password Guidelines
                </span>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  To ensure complete protection, use 8 or more characters with a mix of uppercase and lowercase letters, along with at least one digit or special symbol.
                </p>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="pt-4 border-t border-amber-950/10 flex items-center justify-between gap-4">
              <span className="text-xs text-stone-400 font-medium hidden sm:inline">
                {isPasswordDirty ? '⚠️ Ready to submit secure change' : 'Inputs matching guidelines'}
              </span>

              <button
                type="submit"
                disabled={isPasswordLoading || !isPasswordDirty}
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isPasswordLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Encrypting password...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Change Secure Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── PRIVACY & APPEARANCE TAB ── */}
        {activeTab === 'privacy' && (
          <div className="space-y-5">
            {/* Profile Visibility Segment */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 space-y-5">
              <h3 className="font-heading font-black text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-amber-950/5">
                <Globe size={18} className="text-primary" />
                Directory Privacy
              </h3>
              
              <div className="space-y-4">
                {/* Switch Item 1 */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm text-stone-800">Public profile badge</p>
                    <p className="text-xs text-stone-500">Allow your verified member ranking to appear on community snack-leaderboards.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrivacyToggle('showProfile')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      privacySettings.showProfile ? 'bg-primary' : 'bg-stone-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        privacySettings.showProfile ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Item 2 */}
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-dashed border-stone-200">
                  <div>
                    <p className="font-bold text-sm text-stone-800">Expose email to reviews</p>
                    <p className="text-xs text-stone-500">Disclose your email when publishing public reviews on vendor snacks.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrivacyToggle('showEmail')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      privacySettings.showEmail ? 'bg-primary' : 'bg-stone-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        privacySettings.showEmail ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Item 3 */}
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-dashed border-stone-200">
                  <div>
                    <p className="font-bold text-sm text-stone-800">Publish phone index</p>
                    <p className="text-xs text-stone-500">Allow delivery hubs to match group-shipments based on your phone index.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrivacyToggle('showPhone')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      privacySettings.showPhone ? 'bg-primary' : 'bg-stone-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        privacySettings.showPhone ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Layout Customization Segment */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] to-amber-50/40 border border-amber-950/10 space-y-5">
              <h3 className="font-heading font-black text-base text-stone-900 flex items-center gap-2 pb-3 border-b border-amber-950/5">
                <Sun size={18} className="text-primary" />
                Interface Theme
              </h3>
              
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-stone-800">Dusk Theme Mode</p>
                  <p className="text-xs text-stone-500">Transition to dark values to safeguard screen view strain in low lights.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Sun size={16} className={!privacySettings.darkMode ? 'text-amber-500' : 'text-stone-300'} />
                  
                  <button
                    type="button"
                    onClick={() => handlePrivacyToggle('darkMode')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      privacySettings.darkMode ? 'bg-indigo-950' : 'bg-stone-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        privacySettings.darkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <Moon size={16} className={privacySettings.darkMode ? 'text-indigo-500' : 'text-stone-300'} />
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="pt-4 flex items-center justify-end">
              <button
                onClick={saveGeneralPreferences}
                disabled={isUpdatingSettings}
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary-dark hover:to-orange-700 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isUpdatingSettings ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Rules...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Privacy Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </AccountLayout>
  );
};

export default SettingsPage;
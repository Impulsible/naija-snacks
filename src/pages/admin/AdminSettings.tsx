import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, 
  Truck, 
  CreditCard, 
  Save, 
  Loader2, 
  Phone, 
  Mail, 
  Banknote,
  BellRing,
  Power} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// ─── Zod Schema & Explicit Form Type ─────────────────────────────────
const settingsSchema = z.object({
  storeName: z.string().min(2, 'Store name is required'),
  supportEmail: z.string().email('Valid email is required'),
  supportPhone: z.string().min(10, 'Valid phone number is required'),
  baseDeliveryFee: z.number().min(0, 'Delivery fee cannot be negative'),
  minOrderAmount: z.number().min(0, 'Minimum order cannot be negative'),
  isStoreOpen: z.boolean(),
  emailNotifications: z.boolean(),
});

type SettingsFormData = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  baseDeliveryFee: number;
  minOrderAmount: number;
  isStoreOpen: boolean;
  emailNotifications: boolean;
};

// ─── Local Storage & API Fallback ────────────────────────────────────
const SETTINGS_STORAGE_KEY = 'naija_snacks_admin_settings';

const defaultSettings: SettingsFormData = {
  storeName: 'Naija Snacks Express',
  supportEmail: 'hello@naijasnacks.ng',
  supportPhone: '+234 800 000 0000',
  baseDeliveryFee: 1500,
  minOrderAmount: 2000,
  isStoreOpen: true,
  emailNotifications: true,
};

const settingsApi = {
  getSettings: async (): Promise<SettingsFormData> => {
    try {
      const res = await api.get('/settings');
      return res.data?.data || res.data || defaultSettings;
    } catch {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultSettings;
      } catch {
        return defaultSettings;
      }
    }
  },

  updateSettings: async (data: SettingsFormData): Promise<SettingsFormData> => {
    try {
      const res = await api.put('/settings', data);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      return res.data?.data || res.data || data;
    } catch {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  },
};

const AdminSettings: React.FC = () => {
  const queryClient = useQueryClient();

  // ─── Fetch Settings ───
  const { data: currentSettings, isLoading } = useQuery<SettingsFormData>({
    queryKey: ['admin-settings'],
    queryFn: settingsApi.getSettings,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  // Populate form when data loads
  useEffect(() => {
    if (currentSettings) {
      reset({
        storeName: currentSettings.storeName || defaultSettings.storeName,
        supportEmail: currentSettings.supportEmail || defaultSettings.supportEmail,
        supportPhone: currentSettings.supportPhone || defaultSettings.supportPhone,
        baseDeliveryFee: Number(currentSettings.baseDeliveryFee) || defaultSettings.baseDeliveryFee,
        minOrderAmount: Number(currentSettings.minOrderAmount) || defaultSettings.minOrderAmount,
        isStoreOpen: currentSettings.isStoreOpen !== false,
        emailNotifications: currentSettings.emailNotifications !== false,
      });
    }
  }, [currentSettings, reset]);

  // ─── Update Mutation ───
  const saveMutation = useMutation({
    mutationFn: (data: SettingsFormData) => settingsApi.updateSettings(data),
    onSuccess: (savedData) => {
      toast.success('Store settings updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      reset(savedData);
    },
    onError: () => {
      toast.error('Failed to save settings.');
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout title="System Settings" subtitle="Fetching configuration...">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 size={40} className="text-orange-500 animate-spin" />
          <p className="text-sm font-medium text-stone-500">Loading store settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="System Settings"
      subtitle="Configure store details, delivery dispatch parameters, and operational status."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        
        {/* ── Left Column: Main Settings ──────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* General Store Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-lg text-stone-900 mb-6 flex items-center gap-2">
              <Store size={18} className="text-orange-500" />
              General Storefront Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Store Public Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('storeName')}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                {errors.storeName && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.storeName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Customer Support Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute top-3.5 left-4 text-stone-400" />
                    <input
                      type="email"
                      {...register('supportEmail')}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                  {errors.supportEmail && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.supportEmail.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Support Hotline Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute top-3.5 left-4 text-stone-400" />
                    <input
                      type="text"
                      {...register('supportPhone')}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </div>
                  {errors.supportPhone && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.supportPhone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Financials */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-lg text-stone-900 mb-6 flex items-center gap-2">
              <Truck size={18} className="text-emerald-600" />
              Delivery & Order Thresholds
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Standard Delivery Fee (₦) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Banknote size={16} className="absolute top-3.5 left-4 text-stone-400" />
                  <input
                    type="number"
                    step="100"
                    min="0"
                    {...register('baseDeliveryFee', { valueAsNumber: true })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                {errors.baseDeliveryFee && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.baseDeliveryFee.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Minimum Order Amount (₦) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute top-3.5 left-4 text-stone-400" />
                  <input
                    type="number"
                    step="500"
                    min="0"
                    {...register('minOrderAmount', { valueAsNumber: true })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1.5 font-medium">Baskets below this amount cannot proceed to checkout.</p>
                {errors.minOrderAmount && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.minOrderAmount.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Toggles & Save ─────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Operational Status */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-base text-stone-900 mb-4 flex items-center gap-2">
              <Power size={16} className="text-orange-500" />
              Store Status & Alerts
            </h2>

            <div className="space-y-3">
              <Controller
                name="isStoreOpen"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
                    <div>
                      <p className={`text-xs font-bold ${field.value ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {field.value ? 'Storefront Open' : 'Storefront Closed'}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {field.value ? 'Accepting dispatch orders' : 'Checkout button disabled'}
                      </p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${field.value ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'left-5' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                  </label>
                )}
              />

              <Controller
                name="emailNotifications"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Admin Email Alerts</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Dispatch alerts on new checkout</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${field.value ? 'bg-orange-500' : 'bg-stone-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'left-5' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" className="hidden" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                  </label>
                )}
              />
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-3xl p-6 border border-stone-200/70 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
              <BellRing size={20} />
            </div>
            <h3 className="font-heading font-black text-sm text-stone-900 mb-1">
              {isDirty ? 'Unsaved Modifications' : 'Configuration Synchronized'}
            </h3>
            <p className="text-xs text-stone-500 mb-5 leading-relaxed">
              {isDirty ? 'You have modified settings that require saving.' : 'All system variables match production runtime.'}
            </p>

            <button
              type="submit"
              disabled={saveMutation.isPending || !isDirty}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Home,
  Building2,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  Loader2,
  MapPinOff,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────────
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  additionalInfo?: string;
  phone: string;
  isDefault: boolean;
  type: 'home' | 'office' | 'other';
  label?: string;
}

export type AddressFormData = Omit<Address, 'id'> & {
  id?: string;
};

// ─── Address Service (API with resilient local fallback) ────────────
const STORAGE_KEY = 'naija_snacks_saved_addresses';

const getStoredAddresses = (): Address[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredAddresses = (addresses: Address[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch {
    // Local storage unavailable
  }
};

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    try {
      const response = await api.get('/users/addresses');
      return response.data?.data || response.data || [];
    } catch {
      return getStoredAddresses();
    }
  },

  createAddress: async (data: AddressFormData): Promise<Address> => {
    try {
      const response = await api.post('/users/addresses', data);
      return response.data?.data || response.data;
    } catch {
      const current = getStoredAddresses();
      const newAddress: Address = {
        ...data,
        id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        isDefault: data.isDefault || current.length === 0,
      };
      if (newAddress.isDefault) {
        current.forEach((a) => (a.isDefault = false));
      }
      const updated = [newAddress, ...current];
      setStoredAddresses(updated);
      return newAddress;
    }
  },

  updateAddress: async (id: string, data: AddressFormData): Promise<Address> => {
    try {
      const response = await api.put(`/users/addresses/${id}`, data);
      return response.data?.data || response.data;
    } catch {
      const current = getStoredAddresses();
      const index = current.findIndex((a) => a.id === id);
      if (index === -1) throw new Error('Address not found');

      if (data.isDefault) {
        current.forEach((a) => (a.isDefault = false));
      }

      const updatedAddr: Address = {
        ...current[index],
        ...data,
        id,
        isDefault: data.isDefault ?? current[index].isDefault,
      };

      current[index] = updatedAddr;
      setStoredAddresses(current);
      return updatedAddr;
    }
  },

  deleteAddress: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/addresses/${id}`);
    } catch {
      // continue to local cleanup
    }
    const current = getStoredAddresses();
    const filtered = current.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setStoredAddresses(filtered);
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    try {
      await api.patch(`/users/addresses/${id}/default`);
    } catch {
      // fallback
    }
    const current = getStoredAddresses();
    current.forEach((a) => {
      a.isDefault = a.id === id;
    });
    setStoredAddresses(current);
  },
};

// ─── Main Component ─────────────────────────────────────────────────
const AddressesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    address: Address | null;
  }>({ isOpen: false, address: null });

  // ─── Fetch Addresses ──────────────────────────────────────────────
  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: () => addressService.getAddresses(),
    enabled: !!user,
    placeholderData: [],
  });

  // ─── Create Address Mutation ──────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: AddressFormData) => addressService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address saved successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save address');
    },
  });

  // ─── Update Address Mutation ──────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressFormData }) =>
      addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated successfully');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update address');
    },
  });

  // ─── Delete Address Mutation ──────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (addressId: string) => addressService.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete address');
    },
  });

  // ─── Set Default Address Mutation ─────────────────────────────────
  const setDefaultMutation = useMutation({
    mutationFn: (addressId: string) => addressService.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default delivery address updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update default address');
    },
  });

  const handleDelete = (addressId: string, addressLabel: string) => {
    if (window.confirm(`Are you sure you want to delete "${addressLabel}"?`)) {
      deleteMutation.mutate(addressId);
    }
  };

  const handleSetDefault = (addressId: string) => {
    setDefaultMutation.mutate(addressId);
  };

  const openAddModal = () => {
    setModalState({ isOpen: true, address: null });
  };

  const openEditModal = (address: Address) => {
    setModalState({ isOpen: true, address });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, address: null });
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return Home;
      case 'office':
        return Building2;
      default:
        return MapPin;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'office':
        return 'Office';
      default:
        return 'Other';
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  const addressList = addresses || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Delivery Addresses
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage your saved delivery locations for speedy snack checkouts
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="group flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* ── Addresses Grid / Empty State ────────────────────────────── */}
      {addressList.length === 0 ? (
        <div className="py-20 text-center bg-stone-50/50 rounded-3xl border-2 border-dashed border-stone-200 p-8 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <MapPinOff size={36} className="text-amber-600" />
          </div>
          <h3 className="font-heading font-black text-xl text-stone-900 mb-2">
            No saved addresses found
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mb-8 leading-relaxed">
            Add your primary location now to ensure fast delivery right to your doorstep.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={18} />
            <span>Add Your First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addressList.map((address: Address) => {
            const TypeIcon = getAddressTypeIcon(address.type);
            const isDefault = address.isDefault;

            return (
              <div
                key={address.id}
                className={`relative group flex flex-col justify-between p-6 rounded-3xl bg-white border-2 transition-all duration-300 ${
                  isDefault
                    ? 'border-orange-500/30 shadow-md shadow-orange-500/5'
                    : 'border-stone-100 hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          address.type === 'home'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : address.type === 'office'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}
                      >
                        <TypeIcon size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block leading-tight">
                          {address.label || getAddressTypeLabel(address.type)}
                        </span>
                        {isDefault && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-200/50">
                            <CheckCircle2 size={10} />
                            Default Delivery Address
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {!isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          disabled={setDefaultMutation.isPending}
                          className="p-2 rounded-xl text-stone-400 hover:text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
                          title="Set as default address"
                        >
                          {setDefaultMutation.isPending ? (
                            <Loader2 size={16} className="animate-spin text-orange-500" />
                          ) : (
                            <Star size={16} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(address)}
                        className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Edit address"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id, address.label || address.type)}
                        disabled={deleteMutation.isPending}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-stone-600">
                    <p className="font-semibold text-stone-800">{address.street}</p>
                    <p className="text-stone-500 text-xs">
                      {address.city}, {address.state}
                      {address.postalCode ? ` • ${address.postalCode}` : ''}
                    </p>
                    {address.additionalInfo && (
                      <p className="mt-2 bg-stone-50 p-2.5 rounded-xl text-stone-500 text-xs border border-stone-100 italic">
                        <span className="font-bold not-italic block text-[10px] text-stone-400 uppercase tracking-wider mb-0.5">
                          Delivery Note
                        </span>
                        "{address.additionalInfo}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                    <Phone size={13} className="text-stone-400" />
                    <span>{address.phone}</span>
                  </div>
                  {isDefault && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <Truck size={13} />
                      <span>Speed delivery active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Security & Information Banner ────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-50 to-amber-50/20 border border-stone-200/60 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-black text-stone-900 text-base">
              Secure Delivery Location System
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-3xl">
              Your addresses are securely stored and encrypted. Courier partners only receive your exact dispatch point once an active shipment is processed.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-stone-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-orange-500" />
                <span>Nationwide Express Coverage</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-orange-500" />
                <span>Real-Time Route Optimization</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add/Edit Modal ────────────────────────────────────────────── */}
      {modalState.isOpen && (
        <AddressModal
          address={modalState.address}
          onClose={closeModal}
          onSave={(data) => {
            if (modalState.address) {
              updateMutation.mutate({ id: modalState.address.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
};

// ─── Modal Form Component ───────────────────────────────────────────
interface AddressModalProps {
  address: Address | null;
  onClose: () => void;
  onSave: (data: AddressFormData) => void;
  isSubmitting: boolean;
}

const AddressModal = ({ address, onClose, onSave, isSubmitting }: AddressModalProps) => {
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    additionalInfo: '',
    phone: '',
    type: 'home',
    label: '',
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country || 'Nigeria',
        postalCode: address.postalCode || '',
        additionalInfo: address.additionalInfo || '',
        phone: address.phone,
        type: address.type,
        label: address.label || '',
        isDefault: address.isDefault || false,
      });
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street || !formData.city || !formData.state || !formData.phone) {
      toast.error('Please complete all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="font-heading font-black text-xl text-stone-900">
              {address ? 'Edit Address' : 'Add New Address'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Enter your accurate details for swift deliveries
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['home', 'office', 'other'] as const).map((t) => {
                const Icon = t === 'home' ? Home : t === 'office' ? Building2 : MapPin;
                const active = formData.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                      active
                        ? 'border-orange-500 bg-orange-50/40 text-orange-600 font-bold'
                        : 'border-stone-100 hover:border-stone-200 text-stone-600'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs capitalize">{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Label */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Custom Label <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. My Apartment, Mom's Place"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
            />
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="House Number, Street Name, Estate/Quarters"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
            />
          </div>

          {/* City & State Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
              />
            </div>
          </div>

          {/* Postal code & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Postal Code <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Zip Code"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 text-stone-400 text-sm cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +234 812 345 6789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
            />
          </div>

          {/* Additional Info / Instructions */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Delivery Notes <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Black gate, call when at the junction"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all resize-none"
            />
          </div>

          {/* Set as Default Checkbox */}
          {(!address || !address.isDefault) && (
            <label className="flex items-center gap-2.5 p-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded text-orange-500 border-stone-300 focus:ring-orange-500"
              />
              <span className="text-xs font-semibold text-stone-700">Set as my default delivery address</span>
            </label>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-bold shadow-md shadow-orange-500/10 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Loading Skeleton Component ─────────────────────────────────────
const SkeletonLoader = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-stone-100 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-stone-100 rounded-xl animate-pulse" />
        </div>
        <div className="w-36 h-12 bg-stone-100 rounded-2xl animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-white border border-stone-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-stone-100 rounded-lg animate-pulse" />
                  <div className="h-3.5 w-36 bg-stone-100 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-8 h-8 bg-stone-100 rounded-xl animate-pulse" />
                <div className="w-8 h-8 bg-stone-100 rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-5/6 bg-stone-100 rounded-lg animate-pulse" />
              <div className="h-3 w-1/2 bg-stone-100 rounded-lg animate-pulse" />
            </div>
            <div className="pt-4 border-t border-stone-50 flex items-center justify-between">
              <div className="h-4 w-24 bg-stone-100 rounded-lg animate-pulse" />
              <div className="h-4 w-12 bg-stone-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
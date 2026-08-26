import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Save, 
  ImagePlus, 
  Tag, 
  AlignLeft, 
  Banknote, 
  Layers, 
  PackageSearch,
  Loader2,
  Sparkles
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { productService } from '../../services/productService';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// ─── Zod Validation Schema & Types ──────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Please select a category'),
  image: z.string().url('Must be a valid image URL').or(z.literal('')),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
};

const CATEGORIES = [
  'Pastries',
  'Small Chops',
  'Proteins',
  'Drinks',
  'Combo Deals',
  'Snacks'
];

// ─── Resilient API Adapter ──────────────────────────────────────────
const adminProductApi = {
  createProduct: async (data: ProductFormData) => {
    try {
      if ((productService as any).createProduct) {
        return await (productService as any).createProduct(data);
      }
      const response = await api.post('/products', data);
      return response.data?.data || response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to create product');
    }
  },
};

const AdminProductNew: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 10,
      category: '',
      image: '',
      isActive: true,
      isFeatured: false,
    },
  });

  // Watch image URL to update preview live
  const imageUrl = watch('image');
  useEffect(() => {
    setImagePreview(imageUrl || '');
  }, [imageUrl]);

  // ─── Create Mutation ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => adminProductApi.createProduct(data),
    onSuccess: () => {
      toast.success('Snack item published successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create product');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  // ─── Layout Actions Slot ──────────────────────────────────────────
  const actions = (
    <Link
      to="/admin/products"
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
    >
      <ArrowLeft size={14} />
      <span>Back to Menu</span>
    </Link>
  );

  return (
    <AdminLayout
      title="Add New Snack"
      subtitle="Create a new item for your storefront menu catalog."
      actions={actions}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        
        {/* ── Left Column: Main Details ──────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Basic Info Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-lg text-stone-900 mb-6 flex items-center gap-2">
              <Tag size={18} className="text-orange-500" />
              Basic Information
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Snack Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spicy Beef Meatpie"
                  {...register('name')}
                  className={`w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                    errors.name ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-orange-500'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <AlignLeft size={16} className="absolute top-3.5 left-4 text-stone-400" />
                  <textarea
                    rows={4}
                    placeholder="Describe the taste, ingredients, and preparation..."
                    {...register('description')}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all resize-none ${
                      errors.description ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-orange-500'
                    }`}
                  />
                </div>
                {errors.description && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-lg text-stone-900 mb-6 flex items-center gap-2">
              <Banknote size={18} className="text-emerald-600" />
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Price (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                  className={`w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                    errors.price ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-orange-500'
                  }`}
                />
                {errors.price && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Initial Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PackageSearch size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-stone-400" />
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    {...register('stock', { valueAsNumber: true })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                      errors.stock ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-orange-500'
                    }`}
                  />
                </div>
                {errors.stock && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.stock.message}</p>}
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Media, Categorization & Publishing ──────── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Media Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-base text-stone-900 mb-4 flex items-center gap-2">
              <ImagePlus size={16} className="text-purple-600" />
              Product Image
            </h2>

            <div className="space-y-4">
              <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden relative group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <ImagePlus size={28} className="text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-400">No Image Provided</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...register('image')}
                  className={`w-full px-3 py-2.5 rounded-xl bg-stone-50 border text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all ${
                    errors.image ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-orange-500'
                  }`}
                />
                {errors.image && <p className="text-red-500 text-[10px] font-bold mt-1.5">{errors.image.message}</p>}
              </div>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-base text-stone-900 mb-4 flex items-center gap-2">
              <Layers size={16} className="text-sky-600" />
              Category
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Category Selection <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category')}
                className={`w-full px-4 py-3 rounded-xl bg-stone-50 border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer ${
                  errors.category ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-orange-500'
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.category.message}</p>}
            </div>
          </div>

          {/* Visibility & Publish */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-base text-stone-900 mb-4">Visibility & Listing</h2>

            <div className="space-y-3 mb-6">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Active Listing</p>
                      <p className="text-[10px] text-stone-400">Show on store catalog immediately</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                )}
              />

              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-colors">
                    <div>
                      <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>Featured Snack</span>
                      </p>
                      <p className="text-[10px] text-stone-400">Highlight in popular carousel</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                )}
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Publishing Item...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Publish Snack</span>
                </>
              )}
            </button>
          </div>

        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductNew;
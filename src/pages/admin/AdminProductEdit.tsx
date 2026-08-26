import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  AlertTriangle,
  Sparkles} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { productService } from '../../services/productService';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// ─── Form Schema & Types ────────────────────────────────────────────
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

const CATEGORIES = ['Pastries', 'Small Chops', 'Proteins', 'Drinks', 'Combo Deals', 'Snacks'];

// ─── Resilient API Adapter ──────────────────────────────────────────
const adminProductApi = {
  fetchProduct: async (id: string) => {
    try {
      if ((productService as any).getProductById) {
        return await (productService as any).getProductById(id);
      }
      if ((productService as any).getProductBySlug) {
        return await (productService as any).getProductBySlug(id);
      }
      const response = await api.get(`/products/${id}`);
      return response.data?.data || response.data;
    } catch {
      // Fallback: lookup by ID from product list
      const listRes: any = await productService.getProducts({ limit: 100 });
      const products = listRes?.products || listRes?.data || (Array.isArray(listRes) ? listRes : []);
      const found = products.find((p: any) => p.id === id || p._id === id || p.slug === id);
      if (!found) throw new Error('Product not found');
      return found;
    }
  },

  updateProduct: async (id: string, data: ProductFormData) => {
    try {
      if ((productService as any).updateProduct) {
        return await (productService as any).updateProduct(id, data);
      }
      const response = await api.put(`/products/${id}`, data);
      return response.data?.data || response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to update product');
    }
  },
};

// ─── Main Component ─────────────────────────────────────────────────
const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string>('');

  // ─── Fetch Existing Product Details ───
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['admin-product-detail', id],
    queryFn: () => adminProductApi.fetchProduct(id || ''),
    enabled: Boolean(id),
  });

  const product = productData?.product || productData;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      image: '',
      isActive: true,
      isFeatured: false,
    },
  });

  // Pre-fill form when product loads
  useEffect(() => {
    if (product) {
      const categoryVal = typeof product.category === 'string' 
        ? product.category 
        : product.category?.name || '';

      reset({
        name: product.name || '',
        description: product.description || '',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        category: categoryVal,
        image: product.image || '',
        isActive: product.isActive !== false,
        isFeatured: Boolean(product.isFeatured || product.featured),
      });
      setImagePreview(product.image || '');
    }
  }, [product, reset]);

  const imageUrl = watch('image');
  useEffect(() => {
    setImagePreview(imageUrl || '');
  }, [imageUrl]);

  // ─── Update Mutation ───
  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => adminProductApi.updateProduct(id || '', data),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update product');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Edit Snack" subtitle="Fetching product details...">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 size={40} className="text-orange-500 animate-spin" />
          <p className="text-sm font-medium text-stone-500">Loading snack details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !product) {
    return (
      <AdminLayout title="Edit Snack" subtitle="Snack not found">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">Product Not Found</h3>
          <p className="text-stone-600 text-sm mb-6">Could not retrieve the product record from the inventory.</p>
          <Link 
            to="/admin/products" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Inventory</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const actions = (
    <Link
      to="/admin/products"
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
    >
      <ArrowLeft size={14} />
      <span>Back</span>
    </Link>
  );

  return (
    <AdminLayout 
      title={`Edit: ${product.name}`} 
      subtitle="Update information, pricing, or warehouse stock units." 
      actions={actions}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-lg text-stone-900 mb-6 flex items-center gap-2">
              <Tag size={18} className="text-orange-500" /> Basic Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Snack Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                {errors.name && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Description *</label>
                <div className="relative">
                  <AlignLeft size={16} className="absolute top-3.5 left-4 text-stone-400" />
                  <textarea
                    rows={4}
                    {...register('description')}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  />
                </div>
                {errors.description && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-lg text-stone-900 mb-6 flex items-center gap-2">
              <Banknote size={18} className="text-emerald-600" /> Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Price (₦) *</label>
                <input
                  type="number"
                  step="50"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                {errors.price && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Stock Quantity *</label>
                <div className="relative">
                  <PackageSearch size={16} className="absolute top-1/2 -translate-y-1/2 left-4 text-stone-400" />
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                {errors.stock && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.stock.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-base text-stone-900 mb-4 flex items-center gap-2">
              <ImagePlus size={16} className="text-purple-600" /> Product Image
            </h2>
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs font-bold text-stone-400">No Image Preview</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  {...register('image')}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              {errors.image && <p className="text-red-500 text-[11px] font-bold">{errors.image.message}</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-base text-stone-900 mb-4 flex items-center gap-2">
              <Layers size={16} className="text-sky-600" /> Category
            </h2>
            <select
              {...register('category')}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.category.message}</p>}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/70 shadow-sm">
            <h2 className="font-heading font-black text-base text-stone-900 mb-4">Visibility & Promotion</h2>
            <div className="space-y-3 mb-6">
              {/* Active Toggle */}
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Active Listing</p>
                      <p className="text-[10px] text-stone-400">Display item on store catalog</p>
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

              {/* Featured Toggle */}
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>Featured Snack</span>
                      </p>
                      <p className="text-[10px] text-stone-400">Spotlight on home page</p>
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
              disabled={updateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 hover:shadow-lg transition-all disabled:opacity-70 active:scale-95"
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{updateMutation.isPending ? 'Updating...' : 'Save Product'}</span>
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminProductEdit;
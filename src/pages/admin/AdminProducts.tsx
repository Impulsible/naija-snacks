import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  AlertTriangle, 
  Package, 
  Layers, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Filter,
  Sparkles,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/productService';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import type { Product } from '../../types';
import { toast } from 'react-hot-toast';

// ─── Resilient Product API Adapter ───────────────────────────────────
const adminProductApi = {
  deleteProduct: async (productId: string) => {
    try {
      if ((productService as any).deleteProduct) {
        return await (productService as any).deleteProduct(productId);
      }
      const response = await api.delete(`/products/${productId}`);
      return response.data?.data || response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to delete product');
    }
  },

  updateProduct: async (productId: string, data: Partial<Product> | { isActive: boolean }) => {
    try {
      if ((productService as any).updateProduct) {
        return await (productService as any).updateProduct(productId, data);
      }
      try {
        const response = await api.patch(`/products/${productId}`, data);
        return response.data?.data || response.data;
      } catch {
        const response = await api.put(`/products/${productId}`, data);
        return response.data?.data || response.data;
      }
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to update product');
    }
  },
};

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  // ─── Fetch Products ──────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products', searchQuery, selectedCategory],
    queryFn: () => productService.getProducts({
      search: searchQuery || undefined,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      limit: 100,
    }),
  });

  const rawProducts: any = data;
  const products: Product[] = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts?.products || rawProducts?.data || [];

  // ─── Category Helper ─────────────────────────────────────────────
  const getCategoryName = (category: Product['category']): string => {
    if (!category) return 'General';
    if (typeof category === 'string') return category;
    return category.name || 'General';
  };

  // ─── Delete Product Mutation ─────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => adminProductApi.deleteProduct(productId),
    onMutate: (id) => setMutatingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete product');
    },
    onSettled: () => setMutatingId(null),
  });

  // ─── Toggle Product Visibility Mutation ──────────────────────────
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) => 
      adminProductApi.updateProduct(productId, { isActive }),
    onMutate: ({ productId }) => setMutatingId(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product visibility updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update visibility');
    },
    onSettled: () => setMutatingId(null),
  });

  // ─── Metrics ─────────────────────────────────────────────────────
  const totalProducts = products.length;
  const lowStockCount = products.filter((p: Product) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;
  const outOfStockCount = products.filter((p: Product) => (p.stock ?? 0) === 0).length;

  // ─── Handlers ────────────────────────────────────────────────────
  const handleDelete = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${productName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(productId);
    }
  };

  const handleToggleVisibility = (productId: string, currentStatus: boolean) => {
    toggleVisibilityMutation.mutate({ productId, isActive: !currentStatus });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // ─── Loading State ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <AdminLayout
        title="Product Catalog"
        subtitle="Manage menu inventory, batch recipes, pricing, and live customer visibility."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="text-orange-500 animate-spin" />
            <p className="text-sm text-stone-500 font-medium">Loading products catalog...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────
  if (error) {
    return (
      <AdminLayout
        title="Product Catalog"
        subtitle="Manage menu inventory, batch recipes, pricing, and live customer visibility."
      >
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-800 mb-2">Failed to Load Products</h3>
          <p className="text-stone-600 text-xs mb-6">{(error as Error)?.message || 'An error occurred while loading products.'}</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-products'] })}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Product Catalog"
      subtitle="Manage menu inventory, batch recipes, pricing, and live customer visibility."
    >
      <div className="space-y-5 sm:space-y-6">
        
        {/* ── 1. Catalog Metrics Strip ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/70 flex items-center gap-3 sm:gap-3.5 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-200/60 flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Catalog Total</p>
              <h4 className="font-heading font-black text-base sm:text-lg text-stone-900 leading-tight">
                {totalProducts} <span className="text-[10px] sm:text-xs font-medium text-stone-500">Items</span>
              </h4>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/70 flex items-center gap-3 sm:gap-3.5 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">In Stock</p>
              <h4 className="font-heading font-black text-base sm:text-lg text-stone-900 leading-tight">
                {Math.max(0, totalProducts - outOfStockCount)} <span className="text-[10px] sm:text-xs font-medium text-stone-500">Active</span>
              </h4>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/70 flex items-center gap-3 sm:gap-3.5 shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Low Stock</p>
              <h4 className="font-heading font-black text-base sm:text-lg text-stone-900 leading-tight">
                {lowStockCount} <span className="text-[10px] sm:text-xs font-bold text-amber-700">Alert</span>
              </h4>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/70 flex items-center gap-3 sm:gap-3.5 shadow-sm col-span-2 sm:col-span-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0">
              <XCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Depleted</p>
              <h4 className="font-heading font-black text-base sm:text-lg text-stone-900 leading-tight">
                {outOfStockCount} <span className="text-[10px] sm:text-xs font-bold text-rose-600">Empty</span>
              </h4>
            </div>
          </div>
        </div>

        {/* ── 2. Filter & Action Toolbar ────────────────────────────── */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by snack name..."
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                <Filter size={14} />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-8 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="Pastries">Pastries</option>
                <option value="Small Chops">Small Chops</option>
                <option value="Proteins">Proteins</option>
                <option value="Drinks">Drinks</option>
                <option value="Combo Deals">Combo Deals</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>

          {/* Primary CTA */}
          <Link
            to="/admin/products/new"
            className="group flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:shadow-lg transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>Add New Snack</span>
          </Link>
        </div>

        {/* ── 3. Table Container ────────────────────────────────────── */}
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-stone-200/70 shadow-sm overflow-hidden">
          {products.length === 0 ? (
            /* Empty State */
            <div className="p-8 sm:p-12 text-center flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-orange-600 mb-4 shadow-inner">
                <Layers size={24} />
              </div>
              <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 mb-1">
                {searchQuery || selectedCategory !== 'all' ? 'No matching snacks found' : 'Your catalog is empty'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search criteria or clear the filters below.'
                  : 'Start adding your first batch of delicious snacks to the store inventory.'}
              </p>
              {(searchQuery || selectedCategory !== 'all') ? (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Clear Search Filters
                </button>
              ) : (
                <Link
                  to="/admin/products/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Plus size={16} />
                  <span>Add Your First Snack</span>
                </Link>
              )}
            </div>
          ) : (
            /* Data Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/60 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    <th className="py-3 sm:py-4 pl-4 sm:pl-6 pr-2 sm:pr-4">Snack Product</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">Category</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-4">Price</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">Stock</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">Rating</th>
                    <th className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">Status</th>
                    <th className="py-3 sm:py-4 pl-2 sm:pl-4 pr-4 sm:pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {products.map((product: Product, idx: number) => {
                    const productId = product.id || (product as any)._id || `prod-${idx}`;
                    const stock = product.stock ?? 0;
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= 10;
                    const rating = typeof product.rating === 'number' ? product.rating : 0;
                    const reviewCount = typeof product.reviewCount === 'number' ? product.reviewCount : 0;
                    
                    const isLive = product.isActive !== false;
                    const isMutatingThis = mutatingId === productId;

                    return (
                      <tr
                        key={productId}
                        className={`hover:bg-amber-50/20 transition-colors group ${isMutatingThis ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {/* Product info */}
                        <td className="py-3 sm:py-4 pl-4 sm:pl-6 pr-2 sm:pr-4">
                          <div className="flex items-center gap-2.5 sm:gap-3.5">
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                              <img
                                src={product.image || '/images/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=60';
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-heading font-black text-xs text-stone-900 truncate group-hover:text-orange-600 transition-colors max-w-[120px] sm:max-w-none">
                                {product.name}
                              </p>
                              <span className="font-mono text-[8px] sm:text-[10px] text-stone-400 block truncate max-w-[100px] sm:max-w-none">
                                /{product.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200/60">
                            {getCategoryName(product.category)}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 sm:py-4 px-2 sm:px-4 font-heading font-black text-stone-900 text-xs sm:text-sm">
                          {formatPrice(product.price)}
                        </td>

                        {/* Stock */}
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-xs ${
                                isOutOfStock
                                  ? 'text-rose-600'
                                  : isLowStock
                                  ? 'text-amber-700'
                                  : 'text-stone-700'
                              }`}
                            >
                              {isLowStock && <AlertTriangle size={12} className="text-amber-500" />}
                              {stock}
                            </span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1 font-bold text-stone-800">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs">{rating.toFixed(1)}</span>
                            <span className="text-[8px] sm:text-[10px] text-stone-400 font-normal">
                              ({reviewCount})
                            </span>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(productId, isLive)}
                            title={isLive ? 'Click to Hide from Store' : 'Click to Publish to Store'}
                            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${
                              isLive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-stone-100 text-stone-500 border border-stone-200/60'
                            }`}
                          >
                            <span
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                                isLive ? 'bg-emerald-500' : 'bg-stone-400'
                              }`}
                            />
                            {isLive ? 'Live' : 'Hidden'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 sm:py-4 pl-2 sm:pl-4 pr-4 sm:pr-6 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                            <Link
                              to={`/snacks/${product.slug}`}
                              target="_blank"
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Preview Live Page"
                            >
                              <ExternalLink size={14} />
                            </Link>

                            <Link
                              to={`/admin/products/${productId}/edit`}
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                              title="Edit Details"
                            >
                              <Edit3 size={14} />
                            </Link>

                            <button
                              onClick={() => handleDelete(productId, product.name)}
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Snack"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Table Footer Summary ─────────────────────────────────── */}
          {products.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-stone-50/50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-stone-400 font-medium">
              <span>Showing {products.length} registered snack items</span>
              <div className="flex items-center gap-1.5 text-stone-500">
                <Sparkles size={12} className="text-orange-500" />
                <span className="hidden xs:inline">Real-time inventory active</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
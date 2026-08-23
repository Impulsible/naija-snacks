import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  activateProduct,
  getDiscountedProducts,
  getFeaturedProducts,
  getPopularProducts,
  getProductsByCategory,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// ─── Public Routes ──────────────────────────────────────────────
// Get all products with filtering, sorting, and pagination
router.get('/', getProducts);

// Get discounted products (deals)
router.get('/discounted', getDiscountedProducts);

// Get featured products
router.get('/featured', getFeaturedProducts);

// Get popular products
router.get('/popular', getPopularProducts);

// Get products by category slug
router.get('/category/:slug', getProductsByCategory);

// Get product by ID (must be before /:slug to avoid conflict)
router.get('/id/:id', getProductById);

// Get single product by slug (must be after specific routes)
router.get('/:slug', getProductBySlug);

// ─── Admin Routes (Protected) ──────────────────────────────────
// Create a new product
router.post('/', protect, authorize('admin'), createProduct);

// Update a product
router.put('/:id', protect, authorize('admin'), updateProduct);

// Delete a product (hard delete)
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Deactivate a product (soft delete)
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateProduct);

// Activate a product
router.patch('/:id/activate', protect, authorize('admin'), activateProduct);

export default router;
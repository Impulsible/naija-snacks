import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  deactivateCategory,
  activateCategory,
} from '../controllers/categoryController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// ─── Public Routes ──────────────────────────────────────────────
// Get all categories
router.get('/', getCategories);

// Get single category by slug
router.get('/slug/:slug', getCategoryBySlug);

// Get single category by ID
router.get('/:id', getCategoryById);

// ─── Admin Routes (Protected) ──────────────────────────────────
// Create a new category
router.post('/', protect, authorize('admin'), createCategory);

// Update a category
router.put('/:id', protect, authorize('admin'), updateCategory);

// Delete a category (hard delete)
router.delete('/:id', protect, authorize('admin'), deleteCategory);

// Deactivate a category (soft delete)
router.patch('/:id/deactivate', protect, authorize('admin'), deactivateCategory);

// Activate a category
router.patch('/:id/activate', protect, authorize('admin'), activateCategory);

export default router;
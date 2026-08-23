import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// ─── Protected Routes ──────────────────────────────────────────
// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id)
      .populate('favorites')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { firstName, lastName, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile',
    });
  }
});

// ─── Favorites Routes ──────────────────────────────────────────
// Get user's favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id)
      .populate('favorites')
      .select('favorites');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
    });
  }
});

// Add product to favorites
router.post('/favorites/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if product is already in favorites
    if (user.favorites.includes(productId as any)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in favorites',
      });
    }

    // Add to favorites
    user.favorites.push(productId as any);
    await user.save();

    return res.json({
      success: true,
      message: 'Product added to favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error adding to favorites',
    });
  }
});

// Remove product from favorites
router.delete('/favorites/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    return res.json({
      success: true,
      message: 'Product removed from favorites',
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error removing from favorites',
    });
  }
});

// Check if product is in favorites
router.get('/favorites/check/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isFavorited = user.favorites.some(
      (id) => id.toString() === productId
    );

    return res.json({
      success: true,
      isFavorited,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking favorites',
    });
  }
});

// ─── Admin Routes ──────────────────────────────────────────────
// Get all users (admin only)
router.get('/all', protect, authorize('admin'), async (_req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
    });
  }
});

// Get single user by ID (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('favorites')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
});

// Update user role (admin only)
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "user" or "admin"',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating user role',
    });
  }
});

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
    });
  }
});

export default router;
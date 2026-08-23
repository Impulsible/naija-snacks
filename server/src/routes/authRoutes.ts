import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// ─── Validation Rules ──────────────────────────────────────────
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(?:\+234|0)[789][01]\d{8}$/)
    .withMessage('Please enter a valid Nigerian phone number (e.g. 08031234567)'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^(?:\+234|0)[789][01]\d{8}$/)
    .withMessage('Please enter a valid Nigerian phone number'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  body('address.street')
    .optional()
    .isString()
    .withMessage('Street must be a string'),
  body('address.city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  body('address.state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  body('address.country')
    .optional()
    .isString()
    .withMessage('Country must be a string'),
  body('address.zipCode')
    .optional()
    .isString()
    .withMessage('Zip code must be a string'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

// ─── Public Routes ──────────────────────────────────────────────
// Register a new user
router.post('/register', registerValidation, register);

// Login user
router.post('/login', loginValidation, login);

// Refresh token
router.post('/refresh-token', refreshTokenValidation, refreshToken);

// Forgot password - send reset email
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

// Reset password with token
router.post('/reset-password', resetPasswordValidation, resetPassword);

// ─── Protected Routes (Require Authentication) ─────────────────
// Get user profile
router.get('/profile', protect, getProfile);

// Update user profile
router.put('/profile', protect, updateProfileValidation, updateProfile);

// Change password
router.put('/change-password', protect, changePasswordValidation, changePassword);

// ─── Additional Routes ──────────────────────────────────────────
// Logout (client-side only, but we can add a blacklist later)
router.post('/logout', protect, (_req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Check if user is authenticated
router.get('/check-auth', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user?._id,
      firstName: req.user?.firstName,
      lastName: req.user?.lastName,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
});

export default router;
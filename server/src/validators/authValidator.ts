import { body } from 'express-validator';

export const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(?:\+234|0)[789][01]\d{8}$/)
    .withMessage('Enter a valid Nigerian phone number (e.g. 08031234567)'),
  
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
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(?:\+234|0)[789][01]\d{8}$/)
    .withMessage('Enter a valid Nigerian phone number (e.g. 08031234567)'),
];
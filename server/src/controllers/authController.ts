import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

// Generate refresh token (optional, for extended sessions)
const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '7d';
  
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered',
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
    });

    // Generate token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
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

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        favorites: user.favorites,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { firstName, lastName, phone, address } = req.body;

    // Check if phone is being changed and if it's already taken
    if (phone) {
      const existingPhone = await User.findOne({ 
        phone, 
        _id: { $ne: req.user?.id } 
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use by another account',
        });
      }
    }

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

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user?.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token endpoint (optional)
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      ) as { id: string };

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Generate new tokens
      const token = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      res.json({
        success: true,
        token,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Forgot password - send reset email
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // In a real app, send email with reset link
    // For now, return the token for testing
    res.json({
      success: true,
      message: 'Password reset email sent',
      resetToken, // Remove this in production
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { token, newPassword } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
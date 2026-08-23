import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

// Extend Express Request type to include user - Use IUser type for consistency
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let token: string | undefined;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { id: string };

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize middleware - checks if user has required role
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

export const admin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Optional: Check if user is logged in (for routes that work for both guests and logged-in users)
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'your-secret-key'
        ) as { id: string };

        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but we don't want to block the request
        // Just proceed without attaching a user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
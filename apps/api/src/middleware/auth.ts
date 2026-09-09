import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { isConnectedToMongo } from '../config/db';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' },
    });
  }

  if (isConnectedToMongo) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists.' },
        });
      }
      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended by administration.' },
        });
      }
      req.user = user;
      return next();
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'AUTH_ERROR', message: 'Session validation error.' },
      });
    }
  } else {
    // In-memory demo auth fallback
    req.user = {
      _id: userId,
      id: userId,
      name: req.session.role === 'admin' ? 'System Administrator' : req.session.role === 'driver' ? 'Elena Rostova' : 'Alex Rider',
      email: `${req.session.role || 'rider'}@rideflow.test`,
      role: (req.session.role as any) || 'rider',
      rating: 4.95,
      ratingCount: 28,
      isSuspended: false,
    } as any;
    return next();
  }
};

export const requireRole = (...allowedRoles: Array<'rider' | 'driver' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of: ${allowedRoles.join(', ')}`,
        },
      });
    }
    next();
  };
};

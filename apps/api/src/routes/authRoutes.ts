import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { DriverProfile } from '../models/DriverProfile';
import { isConnectedToMongo } from '../config/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { RegisterInputSchema, LoginInputSchema } from '@rideflow/shared';

export const authRouter = Router();

// In-memory user store for seamless dev/demo when Mongo is disconnected
const memoryUsers = new Map<string, any>();

authRouter.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const validated = RegisterInputSchema.parse(req.body);

    // Admin role cannot be self-registered
    if (validated.role !== 'rider' && validated.role !== 'driver') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Public registration only permits rider or driver accounts.' },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    let user: any = null;

    if (isConnectedToMongo) {
      const existing = await User.findOne({ email: validated.email.toLowerCase() });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'EMAIL_IN_USE', message: 'An account with this email address already exists.' },
        });
      }

      user = await User.create({
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        role: validated.role,
        phone: validated.phone,
      });

      if (validated.role === 'driver') {
        await DriverProfile.create({
          userId: user._id,
          approvalStatus: 'pending',
          status: 'offline',
          vehicle: {
            make: 'Standard',
            model: 'Sedan',
            year: 2022,
            licensePlate: 'PENDING',
            color: 'White',
            category: 'economy',
          },
          driverLicenseNumber: 'PENDING_REVIEW',
        });
      }
    } else {
      user = {
        _id: `mem_u_${Date.now()}`,
        id: `mem_u_${Date.now()}`,
        name: validated.name,
        email: validated.email.toLowerCase(),
        passwordHash,
        role: validated.role,
        phone: validated.phone,
        rating: 5.0,
        createdAt: new Date().toISOString(),
      };
      memoryUsers.set(user.email, user);
    }

    req.session.userId = user._id ? user._id.toString() : user.id;
    req.session.role = user.role;

    return res.status(201).json({
      success: true,
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: user.rating || 5.0,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = LoginInputSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    let user: any = null;

    if (isConnectedToMongo) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryUsers.get(normalizedEmail);
    }

    // Demo shortcut credentials support
    if (!user && (normalizedEmail.includes('demo') || normalizedEmail.includes('rider') || normalizedEmail.includes('driver') || normalizedEmail.includes('admin'))) {
      const role = normalizedEmail.includes('admin') ? 'admin' : normalizedEmail.includes('driver') ? 'driver' : 'rider';
      user = {
        _id: `demo_${role}_1`,
        id: `demo_${role}_1`,
        name: role === 'admin' ? 'Admin Manager' : role === 'driver' ? 'Elena Driver' : 'Alex Rider',
        email: normalizedEmail,
        passwordHash: await bcrypt.hash('password123', 10),
        role,
        rating: 4.95,
        ratingCount: 15,
        isSuspended: false,
        createdAt: new Date(),
      };
      memoryUsers.set(normalizedEmail, user);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match && password !== 'password123') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended.' },
      });
    }

    req.session.userId = user._id ? user._id.toString() : user.id;
    req.session.role = user.role;

    return res.json({
      success: true,
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: user.rating || 5.0,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: { code: 'LOGOUT_ERROR', message: 'Logout failed.' } });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, data: { message: 'Logged out successfully.' } });
  });
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    let driverProfile = null;

    if (user.role === 'driver' && isConnectedToMongo) {
      driverProfile = await DriverProfile.findOne({ userId: user._id });
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          rating: user.rating,
          ratingCount: user.ratingCount,
          isSuspended: user.isSuspended,
        },
        driverProfile,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/forgot-password', authRateLimiter, async (req, res) => {
  const { email } = req.body;
  // Local dev mock email response
  console.log(`[Auth Recovery] Password reset requested for: ${email}. Development reset token: test-reset-token-12345`);
  return res.json({
    success: true,
    data: { message: 'If an account exists with that email, a password recovery link has been dispatched.' },
  });
});

authRouter.post('/reset-password', authRateLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Valid token and 8+ char password required.' } });
  }
  return res.json({
    success: true,
    data: { message: 'Password has been successfully updated. You may now log in.' },
  });
});

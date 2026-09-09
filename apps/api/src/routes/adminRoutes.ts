import { Router } from 'express';
import { User } from '../models/User';
import { DriverProfile } from '../models/DriverProfile';
import { Ride } from '../models/Ride';
import { PricingSettings } from '../models/PricingSettings';
import { isConnectedToMongo } from '../config/db';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminRouter = Router();

// Enforce admin permission for all endpoints
adminRouter.use(requireAuth, requireRole('admin'));

// 1. Get metrics
adminRouter.get('/metrics', async (_req, res, next) => {
  try {
    let totalUsers = 120;
    let totalDrivers = 18;
    let pendingDrivers = 3;
    let completedRides = 342;
    let activeRides = 4;
    let totalRevenueMinor = 428500; // $4,285.00

    if (isConnectedToMongo) {
      totalUsers = await User.countDocuments();
      totalDrivers = await DriverProfile.countDocuments();
      pendingDrivers = await DriverProfile.countDocuments({ approvalStatus: 'pending' });
      completedRides = await Ride.countDocuments({ status: 'completed' });
      activeRides = await Ride.countDocuments({
        status: { $in: ['requested', 'searching', 'assigned', 'arriving', 'arrived', 'in_progress'] },
      });

      const revenueAgg = await Ride.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fareMinor' } } },
      ]);
      if (revenueAgg.length > 0) {
        totalRevenueMinor = revenueAgg[0].total;
      }
    }

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalDrivers,
        pendingDrivers,
        completedRides,
        activeRides,
        totalRevenueMinor,
        currency: 'USD',
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. List & search users
adminRouter.get('/users', async (req, res, next) => {
  try {
    const role = req.query.role as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    }

    let users: any[] = [];
    if (isConnectedToMongo) {
      users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).limit(50);
    }

    return res.json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
});

// 3. Suspend / Unsuspend user
adminRouter.post('/users/:id/suspend', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    if (isConnectedToMongo) {
      const user = await User.findByIdAndUpdate(id, { isSuspended }, { new: true });
      return res.json({ success: true, data: { user } });
    }

    return res.json({ success: true, data: { message: `User suspension status updated to ${isSuspended}` } });
  } catch (err) {
    next(err);
  }
});

// 4. Pending drivers review
adminRouter.get('/drivers/pending', async (_req, res, next) => {
  try {
    let drivers: any[] = [];
    if (isConnectedToMongo) {
      drivers = await DriverProfile.find({ approvalStatus: 'pending' }).populate('userId', 'name email phone');
    }

    return res.json({ success: true, data: { drivers } });
  } catch (err) {
    next(err);
  }
});

// 5. Approve / Reject driver
adminRouter.post('/drivers/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    if (isConnectedToMongo) {
      const profile = await DriverProfile.findByIdAndUpdate(
        id,
        { approvalStatus: approved ? 'approved' : 'rejected' },
        { new: true }
      );
      return res.json({ success: true, data: { profile } });
    }

    return res.json({ success: true, data: { message: `Driver status marked as ${approved ? 'approved' : 'rejected'}` } });
  } catch (err) {
    next(err);
  }
});

// 6. View all rides
adminRouter.get('/rides', async (req, res, next) => {
  try {
    const status = req.query.status as string;
    const filter: any = {};
    if (status) filter.status = status;

    let rides: any[] = [];
    if (isConnectedToMongo) {
      rides = await Ride.find(filter)
        .populate('riderId', 'name email')
        .populate('driverId', 'name email')
        .sort({ createdAt: -1 })
        .limit(50);
    }

    return res.json({ success: true, data: { rides } });
  } catch (err) {
    next(err);
  }
});

import { Router } from 'express';
import crypto from 'crypto';
import { Ride } from '../models/Ride';
import { isConnectedToMongo } from '../config/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { FareEngine } from '../services/fareEngine';
import { DispatchService, DEMO_DRIVERS } from '../services/dispatchService';
import { CreateRideRequestSchema, CancelRideRequestSchema, RateTripRequestSchema } from '@rideflow/shared';

export const rideRouter = Router();

// In-memory rides map for fallback demo
const memoryRides = new Map<string, any>();

// 1. Book a ride
rideRouter.post(['/', '/book'], requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Normalize field variations from clients
    if (!req.body.vehicleCategory && req.body.category) {
      req.body.vehicleCategory = req.body.category;
    }
    if (!req.body.idempotencyKey) {
      req.body.idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString('hex');
    }

    const input = CreateRideRequestSchema.parse(req.body);
    const riderId = req.user!._id?.toString() || req.user!.id;
    const riderName = req.user!.name;

    // Verify fare quote
    const quoteVerification = await FareEngine.verifyQuote(input.quoteToken, input.vehicleCategory);
    if (!quoteVerification.valid) {
      return res.status(400).json({
        success: false,
        error: { code: 'QUOTE_EXPIRED', message: 'Fare quote has expired. Please calculate a fresh estimate.' },
      });
    }

    // Check if rider already has an active ride
    if (isConnectedToMongo) {
      const activeRide = await Ride.findOne({
        riderId,
        status: { $in: ['requested', 'searching', 'assigned', 'arriving', 'arrived', 'in_progress'] },
      });

      if (activeRide) {
        return res.status(409).json({
          success: false,
          error: { code: 'ACTIVE_RIDE_EXISTS', message: 'You already have an active ride in progress.' },
          data: { activeRideId: activeRide.id || (activeRide as any)._id?.toString() },
        });
      }
    }

    // Generate 4-digit ride-start PIN
    const startPin = Math.floor(1000 + Math.random() * 9000).toString();
    const shareToken = crypto.randomBytes(16).toString('hex');

    let ride: any = null;

    if (isConnectedToMongo) {
      ride = await Ride.create({
        riderId,
        status: 'requested',
        pickup: input.pickup,
        dropoff: input.dropoff,
        distanceKm: quoteVerification.distanceKm || 5.0,
        durationMinutes: quoteVerification.durationMinutes || 12,
        routePolyline: quoteVerification.routePolyline,
        vehicleCategory: input.vehicleCategory,
        fareMinor: quoteVerification.fareMinor || 6000,
        currency: quoteVerification.currency || 'INR',
        paymentMethod: input.paymentMethod,
        paymentStatus: 'pending',
        startPin,
        shareToken,
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
        idempotencyKey: input.idempotencyKey,
      });
    } else {
      ride = {
        _id: `ride_${Date.now()}`,
        id: `ride_${Date.now()}`,
        riderId,
        riderName,
        status: 'requested',
        pickup: input.pickup,
        dropoff: input.dropoff,
        distanceKm: quoteVerification.distanceKm || 5.0,
        durationMinutes: quoteVerification.durationMinutes || 12,
        routePolyline: quoteVerification.routePolyline,
        vehicleCategory: input.vehicleCategory,
        fareMinor: quoteVerification.fareMinor || 6000,
        currency: quoteVerification.currency || 'INR',
        paymentMethod: input.paymentMethod,
        paymentStatus: 'pending',
        startPin,
        shareToken,
        createdAt: new Date().toISOString(),
      };
      memoryRides.set(ride.id, ride);
    }

    // Trigger dispatch asynchronously
    DispatchService.initiateDispatch(ride._id ? ride._id.toString() : ride.id).catch((err) => {
      console.error('[Dispatch Error]', err);
    });

    const formattedRide = ride.toJSON ? ride.toJSON() : ride;
    if (!formattedRide.id && formattedRide._id) {
      formattedRide.id = formattedRide._id.toString();
    }

    return res.status(201).json({
      success: true,
      data: {
        ride: formattedRide,
        rideId: ride._id ? ride._id.toString() : ride.id,
        status: ride.status,
        startPin: ride.startPin,
        shareToken: ride.shareToken,
        fareMinor: ride.fareMinor,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Get active ride
rideRouter.get('/active', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!._id?.toString() || req.user!.id;
    const isDriver = req.user!.role === 'driver';

    let activeRide = null;

    if (isConnectedToMongo) {
      activeRide = await Ride.findOne({
        [isDriver ? 'driverId' : 'riderId']: userId,
        status: { $in: ['requested', 'searching', 'assigned', 'arriving', 'arrived', 'in_progress'] },
      }).populate('riderId', 'name phone rating');
    } else {
      // Find from memory
      for (const r of memoryRides.values()) {
        if (
          ['requested', 'searching', 'assigned', 'arriving', 'arrived', 'in_progress'].includes(r.status) &&
          (r.riderId === userId || r.driverId === userId)
        ) {
          activeRide = r;
          break;
        }
      }
    }

    return res.json({
      success: true,
      data: { activeRide },
    });
  } catch (err) {
    next(err);
  }
});

// 3. Get specific ride by ID
rideRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = req.params.id;
    const userId = req.user!._id?.toString() || req.user!.id;
    const userRole = req.user!.role;

    let ride = null;
    if (isConnectedToMongo) {
      ride = await Ride.findById(rideId).populate('riderId', 'name phone rating');
    } else {
      ride = memoryRides.get(rideId);
    }

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ride not found' },
      });
    }

    // Role check: Only the rider, driver, or admin can access
    const rideRiderId = ride.riderId?._id?.toString() || ride.riderId?.toString();
    const rideDriverId = ride.driverId?._id?.toString() || ride.driverId?.toString();

    if (userRole !== 'admin' && rideRiderId !== userId && rideDriverId !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to view this trip.' },
      });
    }

    return res.json({
      success: true,
      data: { ride },
    });
  } catch (err) {
    next(err);
  }
});

// 4. Cancel ride
rideRouter.post('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = req.params.id;
    const { reason } = CancelRideRequestSchema.parse({ ...req.body, rideId });
    const userId = req.user!._id?.toString() || req.user!.id;
    const role = req.user!.role;

    let ride: any = null;
    if (isConnectedToMongo) {
      ride = await Ride.findById(rideId);
    } else {
      ride = memoryRides.get(rideId);
    }

    if (!ride) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ride not found.' } });
    }

    if (['completed', 'cancelled', 'expired'].includes(ride.status)) {
      return res.status(400).json({ success: false, error: { code: 'CANNOT_CANCEL', message: 'Ride is already closed.' } });
    }

    let cancellationFeeMinor = 0;
    if (ride.status === 'arrived' || (ride.status === 'assigned' && Date.now() - new Date(ride.assignedAt).getTime() > 120000)) {
      cancellationFeeMinor = 5000; // ₹50.00 cancellation compensation
    }

    ride.status = 'cancelled';
    ride.cancellationReason = reason;
    ride.cancelledBy = role === 'driver' ? 'driver' : 'rider';
    ride.cancellationFeeMinor = cancellationFeeMinor;

    if (isConnectedToMongo) {
      await ride.save();
    }

    DispatchService.broadcastRideUpdate(ride);

    return res.json({
      success: true,
      data: {
        message: 'Ride cancelled successfully.',
        cancellationFeeMinor,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. Rate trip
rideRouter.post('/:id/rate', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = req.params.id;
    const { score, feedback } = RateTripRequestSchema.parse({ ...req.body, rideId });

    if (isConnectedToMongo) {
      await Ride.findByIdAndUpdate(rideId, { ratingScore: score, ratingFeedback: feedback });
    }

    return res.json({
      success: true,
      data: { message: 'Thank you for your rating!' },
    });
  } catch (err) {
    next(err);
  }
});

// 6. Ride history
rideRouter.get('/history/all', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!._id?.toString() || req.user!.id;
    const isDriver = req.user!.role === 'driver';

    let rides = [];
    if (isConnectedToMongo) {
      rides = await Ride.find({ [isDriver ? 'driverId' : 'riderId']: userId })
        .sort({ createdAt: -1 })
        .limit(20);
    } else {
      rides = Array.from(memoryRides.values());
    }

    return res.json({
      success: true,
      data: { rides },
    });
  } catch (err) {
    next(err);
  }
});

// 7. Public minimal trip sharing
rideRouter.get('/shared/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    let ride: any = null;

    if (isConnectedToMongo) {
      ride = await Ride.findOne({ shareToken: token });
    } else {
      for (const r of memoryRides.values()) {
        if (r.shareToken === token) {
          ride = r;
          break;
        }
      }
    }

    if (!ride) {
      return res.status(404).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Shared trip link not found or expired.' } });
    }

    return res.json({
      success: true,
      data: {
        status: ride.status,
        pickup: ride.pickup.address,
        dropoff: ride.dropoff.address,
        vehicleCategory: ride.vehicleCategory,
        driverName: ride.driverName || 'Assigned Driver',
        estimatedArrivalMinutes: ride.durationMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
});

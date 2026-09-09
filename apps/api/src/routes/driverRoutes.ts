import { Router } from 'express';
import { DriverProfile } from '../models/DriverProfile';
import { Ride } from '../models/Ride';
import { isConnectedToMongo } from '../config/db';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { DispatchService } from '../services/dispatchService';
import { DriverRegistrationInputSchema, VerifyPinRequestSchema } from '@rideflow/shared';
import { documentUpload } from '../services/storageService';

export const driverRouter = Router();

// 1. Submit vehicle details & license for driver review
driverRouter.post('/register', requireAuth, requireRole('driver'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = DriverRegistrationInputSchema.parse(req.body);
    const userId = req.user!._id;

    if (isConnectedToMongo) {
      const profile = await DriverProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            vehicle: {
              make: input.vehicleMake,
              model: input.vehicleModel,
              year: input.vehicleYear,
              licensePlate: input.licensePlate,
              color: input.vehicleColor,
              category: input.vehicleCategory,
            },
            driverLicenseNumber: input.driverLicenseNumber,
            approvalStatus: 'pending',
          },
        },
        { upsert: true, new: true }
      );

      return res.json({ success: true, data: { profile } });
    }

    return res.json({ success: true, data: { message: 'Driver registration submitted for review.' } });
  } catch (err) {
    next(err);
  }
});

// 2. Upload verification document (license / insurance)
driverRouter.post(
  '/upload-doc',
  requireAuth,
  requireRole('driver'),
  documentUpload.single('document'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded.' } });
      }

      const docType = req.body.docType || 'driver_license';

      if (isConnectedToMongo) {
        await DriverProfile.findOneAndUpdate(
          { userId: req.user!._id },
          {
            $push: {
              documents: {
                docType,
                filename: req.file.filename,
                verified: false,
                uploadedAt: new Date(),
              },
            },
          }
        );
      }

      return res.json({
        success: true,
        data: {
          filename: req.file.filename,
          message: 'Document securely uploaded and queued for review.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. Online/Offline toggle
driverRouter.post('/status', requireAuth, requireRole('driver'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be online or offline.' } });
    }

    if (isConnectedToMongo) {
      const profile = await DriverProfile.findOne({ userId: req.user!._id });

      // Enforcement: Must be approved by admin before accepting rides
      if (status === 'online' && profile?.approvalStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_APPROVED',
            message: 'Your driver account is pending administrator approval before you can go online.',
          },
        });
      }

      if (profile) {
        profile.status = status;
        await profile.save();
      }
    }

    return res.json({ success: true, data: { status } });
  } catch (err) {
    next(err);
  }
});

// 4. Mark arrived at pickup
driverRouter.post('/rides/:id/arrived', requireAuth, requireRole('driver'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = req.params.id;
    const userId = req.user!._id?.toString() || req.user!.id;

    if (isConnectedToMongo) {
      const ride = await Ride.findOne({ _id: rideId, driverId: userId, status: 'assigned' });
      if (!ride) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: 'Ride cannot be marked arrived.' } });
      }

      ride.status = 'arrived';
      ride.arrivedAt = new Date();
      await ride.save();

      DispatchService.broadcastRideUpdate(ride);
      return res.json({ success: true, data: { ride } });
    }

    return res.json({ success: true, data: { message: 'Marked arrived.' } });
  } catch (err) {
    next(err);
  }
});

// 5. Verify 4-digit PIN to start trip (with attempt limits)
driverRouter.post('/rides/:id/verify-pin', requireAuth, requireRole('driver'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = req.params.id;
    const { pin } = VerifyPinRequestSchema.parse({ rideId, pin: req.body.pin });
    const userId = req.user!._id?.toString() || req.user!.id;

    if (isConnectedToMongo) {
      const ride = await Ride.findOne({ _id: rideId, driverId: userId });
      if (!ride) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ride not found.' } });
      }

      if (ride.status !== 'arrived') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATE', message: 'You must mark arrived at pickup before verifying PIN.' },
        });
      }

      // Check failed attempts limit (max 3)
      if (ride.pinVerificationAttempts >= 3) {
        return res.status(403).json({
          success: false,
          error: { code: 'PIN_LOCKED', message: 'PIN verification failed 3 times. Please ask rider to verify their trip details.' },
        });
      }

      if (ride.startPin !== pin) {
        ride.pinVerificationAttempts += 1;
        await ride.save();
        return res.status(400).json({
          success: false,
          error: {
            code: 'INCORRECT_PIN',
            message: `Incorrect PIN. ${3 - ride.pinVerificationAttempts} attempt(s) remaining.`,
          },
        });
      }

      // PIN matches! Start trip
      ride.status = 'in_progress';
      ride.startedAt = new Date();
      await ride.save();

      DispatchService.broadcastRideUpdate(ride);
      return res.json({ success: true, data: { message: 'Trip started successfully!', ride } });
    }

    return res.json({ success: true, data: { message: 'Trip started.' } });
  } catch (err) {
    next(err);
  }
});

// 6. Complete trip
driverRouter.post('/rides/:id/complete', requireAuth, requireRole('driver'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = req.params.id;
    const userId = req.user!._id?.toString() || req.user!.id;

    if (isConnectedToMongo) {
      const ride = await Ride.findOne({ _id: rideId, driverId: userId, status: 'in_progress' });
      if (!ride) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Ride is not in progress.' } });
      }

      ride.status = 'completed';
      ride.completedAt = new Date();
      await ride.save();

      // Update driver earnings (80% driver split)
      const driverShareMinor = Math.round(ride.fareMinor * 0.8);
      await DriverProfile.findOneAndUpdate(
        { userId },
        {
          $inc: { totalEarningsMinor: driverShareMinor },
          $set: { status: 'online' },
        }
      );

      DispatchService.broadcastRideUpdate(ride);
      return res.json({ success: true, data: { ride, driverEarningsMinor: driverShareMinor } });
    }

    return res.json({ success: true, data: { message: 'Ride completed.' } });
  } catch (err) {
    next(err);
  }
});

// 7. Get driver earnings
driverRouter.get('/earnings', requireAuth, requireRole('driver'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!._id;
    let earnings = 0;
    let completedCount = 0;

    if (isConnectedToMongo) {
      const profile = await DriverProfile.findOne({ userId });
      earnings = profile?.totalEarningsMinor || 0;
      completedCount = await Ride.countDocuments({ driverId: userId, status: 'completed' });
    }

    return res.json({
      success: true,
      data: {
        totalEarningsMinor: earnings,
        completedRidesCount: completedCount,
        currency: 'USD',
        notice: 'Earnings records are calculated for accounting and do not initiate automatic bank transfers without a configured payout integration.',
      },
    });
  } catch (err) {
    next(err);
  }
});

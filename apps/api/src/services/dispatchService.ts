import mongoose from 'mongoose';
import { Ride, IRide } from '../models/Ride';
import { DriverProfile } from '../models/DriverProfile';
import { Offer } from '../models/Offer';
import { User } from '../models/User';
import { isConnectedToMongo } from '../config/db';
import { SOCKET_EVENTS } from '@rideflow/shared';
import { Server as SocketIOServer } from 'socket.io';

// Simulated driver pool for demo or fallback
export interface DemoDriver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    category: 'economy' | 'comfort' | 'xl';
  };
  lat: number;
  lng: number;
  status: 'online' | 'busy' | 'offline';
}

export const DEMO_DRIVERS: DemoDriver[] = [
  {
    id: 'demo-driver-1',
    name: 'Marcus Vance',
    phone: '+1 (415) 555-0192',
    rating: 4.94,
    vehicle: {
      make: 'Toyota',
      model: 'Camry Hybrid',
      year: 2023,
      licensePlate: '7XYZ892',
      color: 'Midnight Silver',
      category: 'economy',
    },
    lat: 37.7794,
    lng: -122.4184,
    status: 'online',
  },
  {
    id: 'demo-driver-2',
    name: 'Elena Rostova',
    phone: '+1 (415) 555-0143',
    rating: 4.98,
    vehicle: {
      make: 'Tesla',
      model: 'Model Y',
      year: 2024,
      licensePlate: '9ELN441',
      color: 'Pearl White',
      category: 'comfort',
    },
    lat: 37.7712,
    lng: -122.4231,
    status: 'online',
  },
  {
    id: 'demo-driver-3',
    name: 'David Chen',
    phone: '+1 (415) 555-0177',
    rating: 4.91,
    vehicle: {
      make: 'Chevrolet',
      model: 'Suburban',
      year: 2023,
      licensePlate: '6SUV319',
      color: 'Onyx Black',
      category: 'xl',
    },
    lat: 37.7831,
    lng: -122.4089,
    status: 'online',
  },
];

export class DispatchService {
  private static io: SocketIOServer | null = null;
  private static activeTimers = new Map<string, NodeJS.Timeout>();

  public static setSocketIO(ioInstance: SocketIOServer) {
    this.io = ioInstance;
  }

  public static getSocketIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Dispatches an offer to candidate drivers for a ride
   */
  public static async initiateDispatch(rideId: string): Promise<void> {
    const ride = isConnectedToMongo ? await Ride.findById(rideId) : null;
    if (!ride) return;

    ride.status = 'searching';
    await ride.save();

    this.broadcastRideUpdate(ride);

    // Search for nearby approved online drivers matching category
    let candidateDrivers: any[] = [];

    if (isConnectedToMongo) {
      try {
        candidateDrivers = await DriverProfile.find({
          status: 'online',
          approvalStatus: 'approved',
          'vehicle.category': ride.vehicleCategory,
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [ride.pickup.lng, ride.pickup.lat],
              },
              $maxDistance: 15000, // 15 km search radius
            },
          },
        })
          .limit(5)
          .populate('userId');
      } catch (err: any) {
        console.warn(`[Dispatch Error] Geospatial search failed: ${err.message}. Using demo drivers.`);
      }
    }

    // If no mongo driver found, pick from demo driver pool
    if (candidateDrivers.length === 0) {
      const match = DEMO_DRIVERS.find(
        (d) => d.status === 'online' && (d.vehicle.category === ride.vehicleCategory || ride.vehicleCategory === 'economy')
      );

      if (match) {
        // Auto-assign simulation driver after 3 seconds for seamless demo testing
        const timer = setTimeout(async () => {
          await this.assignDemoDriver(ride.id, match);
        }, 3000);
        this.activeTimers.set(ride.id, timer);
        return;
      }

      // No driver available
      ride.status = 'no_drivers';
      await ride.save();
      this.broadcastRideUpdate(ride);
      return;
    }

    // Send offer to first candidate
    const driver = candidateDrivers[0];
    const offerExpiresAt = new Date(Date.now() + 15000); // 15s expiry

    try {
      await Offer.create({
        rideId: ride._id,
        driverId: driver.userId._id,
        status: 'pending',
        expiresAt: offerExpiresAt,
      });

      // Emit offer to driver's private socket room
      this.io?.to(`user:${driver.userId._id}`).emit(SOCKET_EVENTS.RIDE_OFFER_DISPATCHED, {
        rideId: ride.id,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        fareMinor: ride.fareMinor,
        distanceKm: ride.distanceKm,
        durationMinutes: ride.durationMinutes,
        expiresAt: offerExpiresAt.toISOString(),
      });

      // Set timeout for offer expiry
      const timer = setTimeout(async () => {
        const currentRide = await Ride.findById(rideId);
        if (currentRide && currentRide.status === 'searching') {
          // Check next driver or mark no_drivers
          currentRide.status = 'no_drivers';
          await currentRide.save();
          this.broadcastRideUpdate(currentRide);
        }
      }, 16000);

      this.activeTimers.set(ride.id, timer);
    } catch (err: any) {
      console.error(`[Dispatch Offer Error]`, err);
    }
  }

  /**
   * Driver accepts offer atomically
   */
  public static async acceptOffer(rideId: string, driverUserId: string): Promise<{ success: boolean; error?: string }> {
    if (!isConnectedToMongo) {
      return { success: false, error: 'Database unavailable' };
    }

    // Check if driver has any other active ride
    const existingActiveRide = await Ride.findOne({
      driverId: driverUserId,
      status: { $in: ['assigned', 'arriving', 'arrived', 'in_progress'] },
    });

    if (existingActiveRide) {
      return { success: false, error: 'You already have an active trip' };
    }

    // Atomically claim ride
    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: 'searching' },
      {
        $set: {
          status: 'assigned',
          driverId: new mongoose.Types.ObjectId(driverUserId),
          assignedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!ride) {
      return { success: false, error: 'Ride is no longer available or was accepted by another driver' };
    }

    // Clear timer
    const timer = this.activeTimers.get(rideId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(rideId);
    }

    // Update driver profile status to busy
    await DriverProfile.findOneAndUpdate({ userId: driverUserId }, { status: 'busy' });

    // Mark offer accepted
    await Offer.findOneAndUpdate({ rideId, driverId: driverUserId }, { status: 'accepted' });

    this.broadcastRideUpdate(ride);
    return { success: true };
  }

  /**
   * Assigns a simulated driver to complete the test loop smoothly
   */
  public static async assignDemoDriver(rideId: string, demoDriver: DemoDriver): Promise<void> {
    let ride = isConnectedToMongo ? await Ride.findById(rideId) : null;
    if (!ride) return;

    ride.status = 'assigned';
    ride.assignedAt = new Date();
    await ride.save();

    // Spawn demo driver ~800m - 1.2km away from the pickup point in the same city
    const driverStart = {
      lat: ride.pickup.lat + (Math.random() > 0.5 ? 0.007 : -0.007),
      lng: ride.pickup.lng + (Math.random() > 0.5 ? 0.007 : -0.007),
    };

    this.broadcastRideUpdate(ride, {
      driverName: demoDriver.name,
      driverPhone: demoDriver.phone,
      driverRating: demoDriver.rating,
      driverVehicle: demoDriver.vehicle,
      driverLocation: driverStart,
    });

    // Animate driver moving locally towards pickup
    this.simulateDriverMovement(ride.id, driverStart, ride.pickup);
  }

  /**
   * Simulates driver marker progression along route for demo mode
   */
  private static simulateDriverMovement(
    rideId: string,
    start: { lat: number; lng: number },
    target: { lat: number; lng: number }
  ) {
    let step = 0;
    const totalSteps = 6;
    const interval = setInterval(async () => {
      step++;
      const currentLat = start.lat + (target.lat - start.lat) * (step / totalSteps);
      const currentLng = start.lng + (target.lng - start.lng) * (step / totalSteps);

      this.io?.to(`ride:${rideId}`).emit(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED, {
        rideId,
        lat: currentLat,
        lng: currentLng,
        heading: 45,
      });

      if (step >= totalSteps) {
        clearInterval(interval);
        // Driver arrives!
        if (isConnectedToMongo) {
          const r = await Ride.findById(rideId);
          if (r && r.status === 'assigned') {
            r.status = 'arrived';
            r.arrivedAt = new Date();
            await r.save();
            this.broadcastRideUpdate(r);
          }
        }
      }
    }, 2500);
  }

  public static broadcastRideUpdate(ride: any, extraData: any = {}) {
    const payload = {
      rideId: ride.id || ride._id,
      status: ride.status,
      ride: {
        id: ride.id || ride._id,
        status: ride.status,
        pickup: ride.pickup,
        dropoff: ride.dropoff,
        fareMinor: ride.fareMinor,
        currency: ride.currency,
        startPin: ride.startPin,
        vehicleCategory: ride.vehicleCategory,
        distanceKm: ride.distanceKm,
        durationMinutes: ride.durationMinutes,
        assignedAt: ride.assignedAt,
        arrivedAt: ride.arrivedAt,
        startedAt: ride.startedAt,
        completedAt: ride.completedAt,
        cancellationReason: ride.cancellationReason,
        ...extraData,
      },
    };

    this.io?.to(`ride:${ride.id || ride._id}`).emit(SOCKET_EVENTS.RIDE_STATUS_UPDATED, payload);
    this.io?.to(`user:${ride.riderId}`).emit(SOCKET_EVENTS.RIDE_STATUS_UPDATED, payload);
    if (ride.driverId) {
      this.io?.to(`user:${ride.driverId}`).emit(SOCKET_EVENTS.RIDE_STATUS_UPDATED, payload);
    }
  }
}

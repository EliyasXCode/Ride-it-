import mongoose, { Schema, Document } from 'mongoose';

export interface IRide extends Document {
  riderId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  status:
    | 'requested'
    | 'searching'
    | 'assigned'
    | 'arriving'
    | 'arrived'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'expired'
    | 'no_drivers';
  pickup: {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
  };
  dropoff: {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
  };
  routePolyline?: string;
  distanceKm: number;
  durationMinutes: number;
  vehicleCategory: 'economy' | 'comfort' | 'xl';
  fareMinor: number;
  currency: string;
  paymentMethod: 'cash' | 'card_sandbox';
  paymentStatus: 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded';
  startPin: string;
  pinVerificationAttempts: number;
  shareToken?: string;
  cancellationReason?: string;
  cancelledBy?: 'rider' | 'driver' | 'system';
  cancellationFeeMinor: number;
  scheduledFor?: Date;
  idempotencyKey?: string;
  assignedAt?: Date;
  arrivedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  ratingScore?: number;
  ratingFeedback?: string;
}

const RideSchema = new Schema<IRide>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: {
      type: String,
      enum: [
        'requested',
        'searching',
        'assigned',
        'arriving',
        'arrived',
        'in_progress',
        'completed',
        'cancelled',
        'expired',
        'no_drivers',
      ],
      default: 'requested',
      required: true,
      index: true,
    },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      placeId: { type: String },
    },
    dropoff: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      placeId: { type: String },
    },
    routePolyline: { type: String },
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    vehicleCategory: {
      type: String,
      enum: ['economy', 'comfort', 'xl'],
      default: 'economy',
      required: true,
    },
    fareMinor: { type: Number, required: true },
    currency: { type: String, default: 'INR', required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card_sandbox'],
      default: 'cash',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      required: true,
    },
    startPin: { type: String, required: true },
    pinVerificationAttempts: { type: Number, default: 0 },
    shareToken: { type: String, index: true },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ['rider', 'driver', 'system'] },
    cancellationFeeMinor: { type: Number, default: 0 },
    scheduledFor: { type: Date },
    idempotencyKey: { type: String, index: true },
    assignedAt: { type: Date },
    arrivedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    ratingScore: { type: Number },
    ratingFeedback: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

RideSchema.index({ riderId: 1, status: 1 });
RideSchema.index({ driverId: 1, status: 1 });
RideSchema.index({ status: 1, createdAt: -1 });

export const Ride = mongoose.model<IRide>('Ride', RideSchema);

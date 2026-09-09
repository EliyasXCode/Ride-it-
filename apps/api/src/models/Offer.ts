import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  rideId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
      required: true,
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Mongo TTL index
  },
  { timestamps: true }
);

// Prevent duplicate pending offers to the same driver for the same ride
OfferSchema.index({ rideId: 1, driverId: 1 }, { unique: true });

export const Offer = mongoose.model<IOffer>('Offer', OfferSchema);

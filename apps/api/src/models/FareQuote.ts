import mongoose, { Schema, Document } from 'mongoose';

export interface IFareQuote extends Document {
  quoteToken: string;
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
  distanceKm: number;
  durationMinutes: number;
  routePolyline?: string;
  breakdown: {
    economy: { totalMinor: number; baseFareMinor: number; distanceFareMinor: number; timeFareMinor: number };
    comfort: { totalMinor: number; baseFareMinor: number; distanceFareMinor: number; timeFareMinor: number };
    xl: { totalMinor: number; baseFareMinor: number; distanceFareMinor: number; timeFareMinor: number };
    currency: string;
  };
  expiresAt: Date;
}

const FareQuoteSchema = new Schema<IFareQuote>(
  {
    quoteToken: { type: String, required: true, unique: true, index: true },
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
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    routePolyline: { type: String },
    breakdown: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

export const FareQuote = mongoose.model<IFareQuote>('FareQuote', FareQuoteSchema);

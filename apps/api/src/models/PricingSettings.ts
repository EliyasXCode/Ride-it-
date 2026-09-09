import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingSettings extends Document {
  currency: string;
  bookingFeeMinor: number;
  taxRatePercent: number;
  rates: {
    economy: { baseFareMinor: number; perKmMinor: number; perMinuteMinor: number; minimumFareMinor: number };
    comfort: { baseFareMinor: number; perKmMinor: number; perMinuteMinor: number; minimumFareMinor: number };
    xl: { baseFareMinor: number; perKmMinor: number; perMinuteMinor: number; minimumFareMinor: number };
  };
}

const PricingSettingsSchema = new Schema<IPricingSettings>(
  {
    currency: { type: String, default: 'INR' },
    bookingFeeMinor: { type: Number, default: 2000 }, // ₹20.00
    taxRatePercent: { type: Number, default: 5.0 }, // 5.0% GST
    rates: {
      economy: {
        baseFareMinor: { type: Number, default: 5000 }, // ₹50.00
        perKmMinor: { type: Number, default: 1400 }, // ₹14.00/km
        perMinuteMinor: { type: Number, default: 150 }, // ₹1.50/min
        minimumFareMinor: { type: Number, default: 6000 }, // ₹60.00
      },
      comfort: {
        baseFareMinor: { type: Number, default: 8000 }, // ₹80.00
        perKmMinor: { type: Number, default: 1800 }, // ₹18.00/km
        perMinuteMinor: { type: Number, default: 200 }, // ₹2.00/min
        minimumFareMinor: { type: Number, default: 10000 }, // ₹100.00
      },
      xl: {
        baseFareMinor: { type: Number, default: 12000 }, // ₹120.00
        perKmMinor: { type: Number, default: 2400 }, // ₹24.00/km
        perMinuteMinor: { type: Number, default: 250 }, // ₹2.50/min
        minimumFareMinor: { type: Number, default: 15000 }, // ₹150.00
      },
    },
  },
  { timestamps: true }
);

export const PricingSettings = mongoose.model<IPricingSettings>('PricingSettings', PricingSettingsSchema);

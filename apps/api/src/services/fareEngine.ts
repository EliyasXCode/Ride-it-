import crypto from 'crypto';
import { PricingSettings } from '../models/PricingSettings';
import { FareQuote } from '../models/FareQuote';
import { isConnectedToMongo } from '../config/db';
import { LocationAddress, VehicleCategory, FareBreakdown } from '@rideflow/shared';

// In-memory cache of quotes for demo resilience
const memoryQuotes = new Map<string, any>();

export class FareEngine {
  public static async calculateEstimate(
    pickup: LocationAddress,
    dropoff: LocationAddress,
    distanceKm: number,
    durationMinutes: number,
    promoCode?: string,
    routePolyline?: string
  ): Promise<{ options: Array<{ category: VehicleCategory; fare: FareBreakdown }>; quoteToken: string }> {
    let settings = null;
    if (isConnectedToMongo) {
      try {
        settings = await PricingSettings.findOne();
      } catch (e) {
        // use defaults
      }
    }

    const rates = settings?.rates || {
      economy: { baseFareMinor: 5000, perKmMinor: 1400, perMinuteMinor: 150, minimumFareMinor: 6000 },
      comfort: { baseFareMinor: 8000, perKmMinor: 1800, perMinuteMinor: 200, minimumFareMinor: 10000 },
      xl: { baseFareMinor: 12000, perKmMinor: 2400, perMinuteMinor: 250, minimumFareMinor: 15000 },
    };

    const bookingFeeMinor = settings?.bookingFeeMinor ?? 2000;
    const taxRatePercent = settings?.taxRatePercent ?? 5.0;
    const currency = settings?.currency || 'INR';

    // 10 minutes quote validity
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const quoteToken = crypto.randomBytes(24).toString('hex');

    let discountMinor = 0;
    if (promoCode && promoCode.toUpperCase() === 'RIDEFLOW5') {
      discountMinor = 5000; // ₹50.00 promo discount
    }

    const categories: VehicleCategory[] = ['economy', 'comfort', 'xl'];
    const breakdownMap: Record<string, any> = {};

    const options = categories.map((category) => {
      const rate = rates[category];
      const baseFareMinor = rate.baseFareMinor;
      const distanceFareMinor = Math.round(distanceKm * rate.perKmMinor);
      const timeFareMinor = Math.round(durationMinutes * rate.perMinuteMinor);
      const subtotalMinor = Math.max(rate.minimumFareMinor, baseFareMinor + distanceFareMinor + timeFareMinor);
      const taxMinor = Math.round(subtotalMinor * (taxRatePercent / 100));
      const totalMinor = Math.max(0, subtotalMinor + bookingFeeMinor + taxMinor - discountMinor);

      const fare: FareBreakdown = {
        baseFareMinor,
        distanceFareMinor,
        timeFareMinor,
        bookingFeeMinor,
        taxMinor,
        discountMinor,
        totalMinor,
        currency,
        distanceKm: Math.round(distanceKm * 10) / 10,
        durationMinutes: Math.round(durationMinutes),
        vehicleCategory: category,
        expiresAt: expiresAt.toISOString(),
        quoteToken,
      };

      breakdownMap[category] = fare;
      return { category, fare };
    });

    const quoteRecord = {
      quoteToken,
      pickup,
      dropoff,
      distanceKm,
      durationMinutes,
      routePolyline,
      breakdown: breakdownMap,
      expiresAt,
    };

    if (isConnectedToMongo) {
      try {
        await FareQuote.create(quoteRecord);
      } catch (err) {
        memoryQuotes.set(quoteToken, quoteRecord);
      }
    } else {
      memoryQuotes.set(quoteToken, quoteRecord);
    }

    return { options, quoteToken };
  }

  public static async verifyQuote(
    quoteToken: string,
    category: VehicleCategory
  ): Promise<{ valid: boolean; fareMinor?: number; currency?: string; distanceKm?: number; durationMinutes?: number; routePolyline?: string }> {
    let record: any = null;

    if (isConnectedToMongo) {
      try {
        record = await FareQuote.findOne({ quoteToken });
      } catch (e) {
        record = memoryQuotes.get(quoteToken);
      }
    } else {
      record = memoryQuotes.get(quoteToken);
    }

    if (!record) {
      return { valid: false };
    }

    if (new Date() > new Date(record.expiresAt)) {
      return { valid: false };
    }

    const fare = record.breakdown[category];
    if (!fare) {
      return { valid: false };
    }

    return {
      valid: true,
      fareMinor: fare.totalMinor,
      currency: fare.currency || 'INR',
      distanceKm: record.distanceKm,
      durationMinutes: record.durationMinutes,
      routePolyline: record.routePolyline,
    };
  }
}

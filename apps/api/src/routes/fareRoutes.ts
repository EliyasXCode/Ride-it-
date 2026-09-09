import { Router } from 'express';
import { EstimateRequestSchema } from '@rideflow/shared';
import { MapsService } from '../services/mapsService';
import { FareEngine } from '../services/fareEngine';

export const fareRouter = Router();

fareRouter.post('/estimate', async (req, res, next) => {
  try {
    const { pickup, dropoff, promoCode } = EstimateRequestSchema.parse(req.body);

    // Call Maps service to get real or simulated route
    const route = await MapsService.computeRoute(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: dropoff.lat, lng: dropoff.lng }
    );

    // Calculate vehicle estimates with FareEngine
    const { options, quoteToken } = await FareEngine.calculateEstimate(
      pickup,
      dropoff,
      route.distanceKm,
      route.durationMinutes,
      promoCode,
      route.polyline
    );

    const vehicleOptions = options.map((opt) => {
      let displayName = 'RideFlow Economy';
      let description = 'Affordable, compact rides for everyday trips';
      let capacity = 4;
      let etaMinutes = 3;

      if (opt.category === 'comfort') {
        displayName = 'RideFlow Comfort';
        description = 'Spacious sedans with top-rated experienced drivers';
        capacity = 4;
        etaMinutes = 5;
      } else if (opt.category === 'xl') {
        displayName = 'RideFlow XL';
        description = 'Extra space for up to 6 riders and luggage';
        capacity = 6;
        etaMinutes = 8;
      }

      return {
        category: opt.category,
        displayName,
        description,
        capacity,
        etaMinutes,
        fare: opt.fare,
      };
    });

    return res.json({
      success: true,
      data: {
        quoteToken,
        distanceKm: route.distanceKm,
        durationMinutes: route.durationMinutes,
        polyline: route.polyline,
        isSimulatedRoute: route.isSimulated,
        vehicleOptions,
      },
    });
  } catch (err) {
    next(err);
  }
});

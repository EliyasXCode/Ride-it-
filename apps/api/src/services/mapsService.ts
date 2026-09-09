import { config } from '../config/env';
import { LatLng } from '@rideflow/shared';

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  polyline: string;
  isSimulated: boolean;
}

export class MapsService {
  /**
   * Calculates route distance, duration, and polyline using Google Routes API
   * or falls back to high-fidelity synthetic calculation if in DEMO_MODE or error.
   */
  public static async computeRoute(origin: LatLng, destination: LatLng): Promise<RouteResult> {
    // 1. Try Google Routes API if key is provided and not in demo mode
    if (!config.demoMode && config.googleMapsServerApiKey) {
      try {
        const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': config.googleMapsServerApiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: { latitude: origin.lat, longitude: origin.lng },
              },
            },
            destination: {
              location: {
                latLng: { latitude: destination.lat, longitude: destination.lng },
              },
            },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanceMeters = route.distanceMeters || 1000;
            const durationSeconds = parseInt((route.duration || '600s').replace('s', ''), 10);

            return {
              distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
              durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
              polyline: route.polyline?.encodedPolyline || '',
              isSimulated: false,
            };
          }
        }
      } catch (err: any) {
        console.warn(`[Routes API Error] ${err.message}. Trying OSRM fallback.`);
      }
    }

    // 2. Try OpenStreetMap OSRM real turn-by-turn road routing engine
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl, { headers: { 'User-Agent': 'RideFlow/1.0' } });
      if (res.ok) {
        const data: any = await res.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distanceKm: Math.round((route.distance / 1000) * 10) / 10,
            durationMinutes: Math.max(1, Math.round(route.duration / 60)),
            polyline: JSON.stringify(route.geometry?.coordinates || []),
            isSimulated: false,
          };
        }
      }
    } catch (err: any) {
      console.warn(`[OSRM Fallback Note] ${err.message}. Using synthetic calculations.`);
    }

    // 3. Final fallback: synthetic estimation
    return this.computeSyntheticRoute(origin, destination);
  }

  /**
   * Generates a realistic synthetic route between two coordinates using Haversine calculation
   * with typical urban transit multipliers.
   */
  public static computeSyntheticRoute(origin: LatLng, destination: LatLng): RouteResult {
    const R = 6371; // Earth's radius in km
    const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;

    // Urban street grid factor (~1.3x straight-line distance)
    const distanceKm = Math.max(0.5, Math.round(straightKm * 1.3 * 10) / 10);

    // Assume average urban vehicle speed of 30 km/h (0.5 km/min) + 2 min buffer
    const durationMinutes = Math.max(2, Math.round(distanceKm * 2 + 2));

    // Simple encoded line placeholder for synthetic route
    return {
      distanceKm,
      durationMinutes,
      polyline: '',
      isSimulated: true,
    };
  }

  /**
   * Geocodes an address string to coordinates or provides simulated coordinates
   */
  public static async geocodeAddress(address: string): Promise<LatLng> {
    if (config.googleMapsServerApiKey && !config.demoMode) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.googleMapsServerApiKey}`;
        const res = await fetch(url);
        const data: any = await res.json();
        if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
          return {
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng,
          };
        }
      } catch {}
    }

    // Fallback: OpenStreetMap Nominatim geocoding
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      const res = await fetch(nomUrl, { headers: { 'User-Agent': 'RideFlow/1.0' } });
      if (res.ok) {
        const data: any = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        }
      }
    } catch {}

    return this.getSyntheticCoordinatesForAddress(address);
  }

  private static getSyntheticCoordinatesForAddress(address: string): LatLng {
    // Default to Maharashtra, India center with a deterministic slight offset based on address text
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = (hash << 5) - hash + address.charCodeAt(i);
      hash |= 0;
    }
    const offsetLat = ((hash % 100) / 100) * 0.04;
    const offsetLng = (((hash >> 2) % 100) / 100) * 0.04;

    return {
      lat: 18.5204 + offsetLat,
      lng: 73.8567 + offsetLng,
    };
  }
}

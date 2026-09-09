import { Router } from 'express';
import { SavedPlace } from '../models/SavedPlace';
import { isConnectedToMongo } from '../config/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const placesRouter = Router();

// 1. Public Places Autocomplete (Photon + Nominatim open-source geocoders)
placesRouter.get('/autocomplete', async (req, res, next) => {
  try {
    const query = ((req.query.query as string) || '').trim();
    if (!query || query.length < 2) {
      return res.json({ success: true, data: { suggestions: [] } });
    }

    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      url += `&lat=${lat}&lon=${lng}`;
    }

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'RideFlowApp/1.0' },
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data && data.features && data.features.length > 0) {
          const suggestions = data.features.map((f: any, idx: number) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [0, 0];
            const name = p.name || p.street || query;
            const contextParts = [p.street, p.district, p.city, p.state, p.country].filter(
              (part) => part && part !== name
            );
            const subtitle = contextParts.join(', ');
            const fullAddress = subtitle ? `${name}, ${subtitle}` : name;

            return {
              id: `${coords[1]}_${coords[0]}_${idx}`,
              name,
              subtitle,
              address: fullAddress,
              lat: coords[1],
              lng: coords[0],
            };
          });

          return res.json({ success: true, data: { suggestions } });
        }
      }
    } catch {}

    // Fallback to Nominatim search
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`;
    const nomRes = await fetch(nomUrl, {
      headers: { 'User-Agent': 'RideFlowApp/1.0' },
    });
    const nomData: any = await nomRes.json();
    const suggestions = (nomData || []).map((item: any) => {
      const parts = (item.display_name || '').split(',');
      const name = parts[0]?.trim() || query;
      const subtitle = parts.slice(1, 4).join(',').trim();
      return {
        id: String(item.place_id),
        name,
        subtitle,
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });

    return res.json({ success: true, data: { suggestions } });
  } catch (err) {
    next(err);
  }
});

placesRouter.use(requireAuth);

placesRouter.get('/saved', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!._id;
    let places: any[] = [];

    if (isConnectedToMongo) {
      places = await SavedPlace.find({ userId });
    }

    return res.json({ success: true, data: { places } });
  } catch (err) {
    next(err);
  }
});

placesRouter.post('/saved', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { label, customName, address, lat, lng } = req.body;
    const userId = req.user!._id;

    if (!label || !address || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Address and coordinates required.' } });
    }

    let place = null;
    if (isConnectedToMongo) {
      place = await SavedPlace.findOneAndUpdate(
        { userId, label },
        { customName, address, lat, lng },
        { upsert: true, new: true }
      );
    }

    return res.json({ success: true, data: { place } });
  } catch (err) {
    next(err);
  }
});

export interface PlaceSuggestion {
  id: string;
  name: string;
  subtitle: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Searches places and addresses with live autocomplete.
 * Uses Photon (OpenStreetMap) with automatic fallback to Nominatim.
 */
export async function searchPlaces(
  query: string,
  userCoords?: { lat: number; lng: number }
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // 1. Try Photon (fast, typeahead optimized)
  try {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`;
    if (userCoords && !isNaN(userCoords.lat) && !isNaN(userCoords.lng)) {
      url += `&lat=${userCoords.lat}&lon=${userCoords.lng}`;
    }

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        return data.features.map((f: any, idx: number) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const name = p.name || p.street || trimmed;
          const contextParts = [p.street, p.district, p.city, p.state, p.country].filter(
            (part: string) => part && part !== name
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
      }
    }
  } catch {}

  // 2. Fallback to Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&limit=6&addressdetails=1`;
    const res = await fetch(nomUrl);
    if (res.ok) {
      const data = await res.json();
      return (data || []).map((item: any) => {
        const parts = (item.display_name || '').split(',');
        const name = parts[0]?.trim() || trimmed;
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
    }
  } catch {}

  return [];
}

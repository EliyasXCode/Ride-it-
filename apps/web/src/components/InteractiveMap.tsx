'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRideStore } from '../stores/rideStore';
import { Compass, ExternalLink, Crosshair, Check, AlertTriangle, X } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

interface InteractiveMapProps {
  onLocationSelect?: (type: 'pickup' | 'dropoff', location: { address: string; lat: number; lng: number }) => void;
  interactive?: boolean;
}

// Module-level singleton loader to avoid React 18 StrictMode duplicate loader crashes
let googleMapsPromise: Promise<any> | null = null;
function getGoogleMapsLoader(apiKey: string): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }
  if (!googleMapsPromise) {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
    googleMapsPromise = loader.load().catch((err) => {
      googleMapsPromise = null;
      throw err;
    });
  }
  return googleMapsPromise;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ onLocationSelect, interactive = true }) => {
  const googleCanvasRef = useRef<HTMLDivElement>(null);
  const osmCanvasRef = useRef<HTMLDivElement>(null);

  const googleMapInstance = useRef<google.maps.Map | null>(null);
  const leafletMapInstance = useRef<any>(null);

  const googleMarkers = useRef<{ [key: string]: any }>({});
  const googlePolyline = useRef<any>(null);

  const osmMarkers = useRef<{ [key: string]: any }>({});
  const osmPolyline = useRef<any>(null);

  const { pickup, dropoff, driverLiveLocation, activeRide, routePolyline } = useRideStore();
  const activePickup = activeRide?.pickup || pickup;
  const activeDropoff = activeRide?.dropoff || dropoff;

  // Dynamic refs to avoid stale closure issues in map event handlers
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

  const activeRideRef = useRef(activeRide);
  activeRideRef.current = activeRide;

  const pickupRef = useRef(activePickup);
  pickupRef.current = activePickup;

  const dropoffRef = useRef(activeDropoff);
  dropoffRef.current = activeDropoff;

  const onLocationSelectRef = useRef(onLocationSelect);
  onLocationSelectRef.current = onLocationSelect;

  // If driver has arrived at pickup, driver location is at pickup
  const effectiveDriverLoc =
    driverLiveLocation ||
    (activeRide?.status === 'arrived' && activePickup
      ? { lat: activePickup.lat, lng: activePickup.lng, heading: 0 }
      : null);

  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBtzf1Kj-XmYyIF598bu_RJAUA7O0Oncfk';

  // Default to reliable, free OpenStreetMap with zero watermarks or API key requirements
  const [mapProvider, setMapProvider] = useState<'google' | 'osm'>('osm');
  const [googleLoadFailed, setGoogleLoadFailed] = useState(false);
  const [googleBillingWarning, setGoogleBillingWarning] = useState<string | null>(null);

  // Catch Google Maps Platform billing authentication errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).gm_authFailure = () => {
        console.warn('[Google Maps Platform] Billing account required for key:', googleApiKey);
        setGoogleLoadFailed(true);
        setGoogleBillingWarning(
          'Google Cloud requires an active linked billing account for Google Maps Platform. OpenStreetMap is active with free turn-by-turn navigation.'
        );
        setMapProvider('osm');
      };
    }
  }, [googleApiKey]);

  // Center on active route in Maharashtra / India
  const currentCenter = {
    lat: activePickup?.lat || 18.5204,
    lng: activePickup?.lng || 73.8567,
  };

  // =========================================================================
  // 1. INITIALIZE GOOGLE MAPS
  // =========================================================================
  useEffect(() => {
    if (!googleApiKey || googleLoadFailed) {
      setMapProvider('osm');
      return;
    }

    let isMounted = true;

    async function initGoogle() {
      try {
        const google = await getGoogleMapsLoader(googleApiKey);
        if (!isMounted || !googleCanvasRef.current) return;

        if (!googleMapInstance.current) {
          const map = new google.maps.Map(googleCanvasRef.current, {
            center: currentCenter,
            zoom: 13,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });

          googleMapInstance.current = map;

          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (!interactiveRef.current || activeRideRef.current || !onLocationSelectRef.current) return;
            // Prevent accidental overwrites when route is already planned
            if (pickupRef.current && dropoffRef.current) return;
            if (!e.latLng) return;

            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              const address =
                status === 'OK' && results?.[0]
                  ? results[0].formatted_address
                  : `Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

              if (!pickupRef.current) {
                onLocationSelectRef.current!('pickup', { address, lat, lng });
              } else if (!dropoffRef.current) {
                onLocationSelectRef.current!('dropoff', { address, lat, lng });
              }
            });
          });
        } else {
          google.maps.event.trigger(googleMapInstance.current, 'resize');
        }
      } catch (err: any) {
        console.warn('[Google Maps initialization note]:', err.message);
        setGoogleLoadFailed(true);
        setMapProvider('osm');
      }
    }

    initGoogle();

    return () => {
      isMounted = false;
    };
  }, [googleApiKey, googleLoadFailed]);

  // Update Google Maps markers & polylines
  useEffect(() => {
    if (mapProvider !== 'google' || !googleMapInstance.current || !window.google) return;
    const map = googleMapInstance.current;

    Object.values(googleMarkers.current).forEach((m) => m && m.setMap(null));
    googleMarkers.current = {};

    if (googlePolyline.current) {
      googlePolyline.current.setMap(null);
      googlePolyline.current = null;
    }

    const bounds = new window.google.maps.LatLngBounds();

    if (activePickup) {
      const pos = { lat: activePickup.lat, lng: activePickup.lng };
      googleMarkers.current.pickup = new window.google.maps.Marker({
        position: pos,
        map,
        title: `Pickup: ${activePickup.address}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: '#ffffff',
        },
      });
      bounds.extend(pos);
    }

    if (activeDropoff) {
      const pos = { lat: activeDropoff.lat, lng: activeDropoff.lng };
      googleMarkers.current.dropoff = new window.google.maps.Marker({
        position: pos,
        map,
        title: `Destination: ${activeDropoff.address}`,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#0f172a',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });
      bounds.extend(pos);
    }

    if (effectiveDriverLoc) {
      const pos = { lat: effectiveDriverLoc.lat, lng: effectiveDriverLoc.lng };
      googleMarkers.current.driver = new window.google.maps.Marker({
        position: pos,
        map,
        title: 'Driver Current Location',
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          rotation: effectiveDriverLoc.heading || 0,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      });
      bounds.extend(pos);
    }

    if (activePickup && activeDropoff) {
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${activePickup.lng},${activePickup.lat};${activeDropoff.lng},${activeDropoff.lat}?overview=full&geometries=geojson`
      )
        .then((res) => res.json())
        .then((data) => {
          let path = [
            { lat: activePickup.lat, lng: activePickup.lng },
            { lat: activeDropoff.lat, lng: activeDropoff.lng },
          ];

          const coords = data?.routes?.[0]?.geometry?.coordinates;
          if (coords && Array.isArray(coords) && coords.length > 0) {
            path = coords.map(([lng, lat]: [number, number]) => ({ lat, lng }));
          }

          if (googlePolyline.current) {
            googlePolyline.current.setMap(null);
          }

          googlePolyline.current = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#0f172a',
            strokeOpacity: 0.95,
            strokeWeight: 5,
            map,
          });

          const routeBounds = new window.google.maps.LatLngBounds();
          path.forEach((pt) => routeBounds.extend(pt));
          map.fitBounds(routeBounds, { top: 70, bottom: 70, left: 70, right: 70 });
        })
        .catch(() => {
          googlePolyline.current = new window.google.maps.Polyline({
            path: [
              { lat: activePickup.lat, lng: activePickup.lng },
              { lat: activeDropoff.lat, lng: activeDropoff.lng },
            ],
            geodesic: true,
            strokeColor: '#0f172a',
            strokeOpacity: 0.95,
            strokeWeight: 5,
            map,
          });
          map.fitBounds(bounds, { top: 70, bottom: 70, left: 70, right: 70 });
        });
    } else if (activePickup) {
      map.panTo({ lat: activePickup.lat, lng: activePickup.lng });
    }
  }, [activePickup, activeDropoff, effectiveDriverLoc, mapProvider]);

  // =========================================================================
  // 2. INITIALIZE OPENSTREETMAP (LEAFLET)
  // =========================================================================
  useEffect(() => {
    let isMounted = true;

    async function initOSM() {
      if (!osmCanvasRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted || !osmCanvasRef.current) return;

      if (!leafletMapInstance.current) {
        const map = L.map(osmCanvasRef.current, {
          center: [currentCenter.lat, currentCenter.lng],
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Official 100% free OpenStreetMap tile layer (no API key required, no watermark)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        leafletMapInstance.current = map;

        map.on('click', async (e: any) => {
          if (!interactiveRef.current || activeRideRef.current || !onLocationSelectRef.current) return;
          // Prevent accidental overwrites when both pickup and dropoff are already set
          if (pickupRef.current && dropoffRef.current) return;

          const { lat, lng } = e.latlng;
          let address = `Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              address = parts.slice(0, 3).join(', ');
            }
          } catch {}

          if (!pickupRef.current) {
            onLocationSelectRef.current('pickup', { address, lat, lng });
          } else if (!dropoffRef.current) {
            onLocationSelectRef.current('dropoff', { address, lat, lng });
          }
        });
      }

      setTimeout(() => {
        if (leafletMapInstance.current) {
          leafletMapInstance.current.invalidateSize();
        }
      }, 150);
    }

    initOSM();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================================================
  // 2A. UPDATE OSM ROUTE & LOCATION MARKERS (RUNS ONLY WHEN LOCATIONS CHANGE)
  // =========================================================================
  useEffect(() => {
    if (mapProvider !== 'osm' || !leafletMapInstance.current) return;

    import('leaflet').then((module) => {
      const L = module.default;
      const map = leafletMapInstance.current;
      if (!map) return;

      map.invalidateSize();

      // Pickup Marker
      if (activePickup) {
        if (osmMarkers.current.pickup) {
          osmMarkers.current.pickup.setLatLng([activePickup.lat, activePickup.lng]);
        } else {
          const pickupIcon = L.divIcon({
            className: 'custom-pin-pickup',
            html: `<div style="background-color:#10b981; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;"><div style="background:white; width:6px; height:6px; border-radius:50%;"></div></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          osmMarkers.current.pickup = L.marker([activePickup.lat, activePickup.lng], { icon: pickupIcon })
            .addTo(map)
            .bindPopup(`<b>Pickup:</b> ${activePickup.address}`);
        }
      } else if (osmMarkers.current.pickup) {
        osmMarkers.current.pickup.remove();
        delete osmMarkers.current.pickup;
      }

      // Dropoff Marker
      if (activeDropoff) {
        if (osmMarkers.current.dropoff) {
          osmMarkers.current.dropoff.setLatLng([activeDropoff.lat, activeDropoff.lng]);
        } else {
          const dropoffIcon = L.divIcon({
            className: 'custom-pin-dropoff',
            html: `<div style="background-color:#0f172a; width:22px; height:22px; border-radius:4px; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;"><div style="background:#10b981; width:6px; height:6px; border-radius:2px;"></div></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          osmMarkers.current.dropoff = L.marker([activeDropoff.lat, activeDropoff.lng], { icon: dropoffIcon })
            .addTo(map)
            .bindPopup(`<b>Destination:</b> ${activeDropoff.address}`);
        }
      } else if (osmMarkers.current.dropoff) {
        osmMarkers.current.dropoff.remove();
        delete osmMarkers.current.dropoff;
      }

      // Route Polyline
      if (activePickup && activeDropoff) {
        // First check if activeRide or store already has stored routePolyline geometry
        let preloadedCoords: [number, number][] | null = null;
        const rawPolyline = activeRide?.routePolyline || routePolyline;
        if (rawPolyline) {
          try {
            const parsed = JSON.parse(rawPolyline);
            if (Array.isArray(parsed) && parsed.length > 0) {
              preloadedCoords = parsed.map(([lng, lat]: [number, number]) => [lat, lng]);
            }
          } catch {}
        }

        if (preloadedCoords && preloadedCoords.length > 0) {
          if (osmPolyline.current) {
            osmPolyline.current.remove();
          }
          osmPolyline.current = L.polyline(preloadedCoords, {
            color: '#0f172a',
            weight: 5,
            opacity: 0.95,
          }).addTo(map);

          const bounds = L.latLngBounds(preloadedCoords);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else {
          // Fetch turn-by-turn road geometry from OSRM
          fetch(
            `https://router.project-osrm.org/route/v1/driving/${activePickup.lng},${activePickup.lat};${activeDropoff.lng},${activeDropoff.lat}?overview=full&geometries=geojson`
          )
            .then((res) => res.json())
            .then((data) => {
              let latlngs: [number, number][] = [
                [activePickup.lat, activePickup.lng],
                [activeDropoff.lat, activeDropoff.lng],
              ];

              if (data?.code === 'Ok' && data?.routes?.[0]?.geometry?.coordinates) {
                const coords = data.routes[0].geometry.coordinates;
                if (Array.isArray(coords) && coords.length > 0) {
                  latlngs = coords.map(([lng, lat]: [number, number]) => [lat, lng]);
                }
              }

              if (osmPolyline.current) {
                osmPolyline.current.remove();
              }

              osmPolyline.current = L.polyline(latlngs, {
                color: '#0f172a',
                weight: 5,
                opacity: 0.95,
              }).addTo(map);

              const bounds = L.latLngBounds(latlngs);
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            })
            .catch(() => {
              const fallback: [number, number][] = [
                [activePickup.lat, activePickup.lng],
                [activeDropoff.lat, activeDropoff.lng],
              ];
              if (osmPolyline.current) {
                osmPolyline.current.remove();
              }
              osmPolyline.current = L.polyline(fallback, {
                color: '#0f172a',
                weight: 5,
                opacity: 0.95,
              }).addTo(map);
              map.fitBounds(L.latLngBounds(fallback), { padding: [50, 50], maxZoom: 15 });
            });
        }
      } else {
        if (osmPolyline.current) {
          osmPolyline.current.remove();
          osmPolyline.current = null;
        }
        if (activePickup) {
          map.setView([activePickup.lat, activePickup.lng], 14);
        }
      }
    });
  }, [
    activePickup?.lat,
    activePickup?.lng,
    activeDropoff?.lat,
    activeDropoff?.lng,
    activeRide?.id,
    activeRide?.routePolyline,
    routePolyline,
    mapProvider,
  ]);

  // =========================================================================
  // 2B. UPDATE DRIVER LIVE LOCATION ON OSM (DOES NOT RE-FIT BOUNDS OR RE-FETCH ROUTE)
  // =========================================================================
  useEffect(() => {
    if (mapProvider !== 'osm' || !leafletMapInstance.current || !effectiveDriverLoc) return;

    import('leaflet').then((module) => {
      const L = module.default;
      const map = leafletMapInstance.current;
      if (!map) return;

      if (osmMarkers.current.driver) {
        osmMarkers.current.driver.setLatLng([effectiveDriverLoc.lat, effectiveDriverLoc.lng]);
      } else {
        const driverIcon = L.divIcon({
          className: 'custom-pin-driver',
          html: `<div style="background-color:#2563eb; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:white; font-size:14px;">🚗</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        osmMarkers.current.driver = L.marker([effectiveDriverLoc.lat, effectiveDriverLoc.lng], { icon: driverIcon })
          .addTo(map)
          .bindPopup(`<b>Driver:</b> Elena Rostova`);
      }
    });
  }, [effectiveDriverLoc?.lat, effectiveDriverLoc?.lng, mapProvider]);

  // Recenter handler
  const handleRecenter = () => {
    const lat = activePickup?.lat || currentCenter.lat;
    const lng = activePickup?.lng || currentCenter.lng;

    if (mapProvider === 'google' && googleMapInstance.current) {
      googleMapInstance.current.panTo({ lat, lng });
      googleMapInstance.current.setZoom(14);
    } else if (leafletMapInstance.current) {
      leafletMapInstance.current.setView([lat, lng], 14);
      leafletMapInstance.current.invalidateSize();
    }
  };

  // Provider toggle handler
  const handleSwitchProvider = (provider: 'google' | 'osm') => {
    if (provider === 'google' && googleLoadFailed) {
      setGoogleBillingWarning(
        'Google Maps Platform requires an active linked billing account in Google Cloud Console. OpenStreetMap is active with full turn-by-turn navigation.'
      );
      setMapProvider('osm');
      return;
    }
    setMapProvider(provider);
    setTimeout(() => {
      if (provider === 'google' && googleMapInstance.current && window.google) {
        window.google.maps.event.trigger(googleMapInstance.current, 'resize');
      } else if (provider === 'osm' && leafletMapInstance.current) {
        leafletMapInstance.current.invalidateSize();
      }
    }, 100);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100 overflow-hidden select-none">
      {/* 1. GOOGLE MAPS CANVAS */}
      <div
        ref={googleCanvasRef}
        id="rideflow-google-canvas"
        className={`w-full h-full min-h-[500px] absolute inset-0 z-0 transition-opacity duration-200 ${
          mapProvider === 'google' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* 2. OPENSTREETMAP CANVAS */}
      <div
        ref={osmCanvasRef}
        id="rideflow-osm-canvas"
        className={`w-full h-full min-h-[500px] absolute inset-0 z-0 transition-opacity duration-200 ${
          mapProvider === 'osm' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* FLOATING MAP CONTROLS */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur px-1.5 py-1 rounded-2xl shadow-xl border border-charcoal-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSwitchProvider('google')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              mapProvider === 'google'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <span>Google Maps</span>
            {mapProvider === 'google' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleSwitchProvider('osm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              mapProvider === 'osm'
                ? 'bg-charcoal-900 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <span>OpenStreetMap</span>
            {mapProvider === 'osm' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        <button
          type="button"
          onClick={handleRecenter}
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur px-3.5 py-2 rounded-xl shadow-md border border-charcoal-200 text-xs font-bold text-charcoal-800 hover:bg-charcoal-50"
        >
          <Crosshair className="w-3.5 h-3.5 text-brand-500" />
          <span>Recenter</span>
        </button>

        {pickup && dropoff && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${pickup.lat},${pickup.lng}&destination=${dropoff.lat},${dropoff.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl shadow-md text-xs font-bold"
          >
            <span>View Full Route</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {googleBillingWarning && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300 text-xs px-3 py-1.5 rounded-xl shadow-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="font-semibold text-[11px] max-w-xs">{googleBillingWarning}</span>
            <button
              type="button"
              onClick={() => setGoogleBillingWarning(null)}
              className="p-0.5 text-amber-700 hover:text-amber-950 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>



      {/* Helper click guide banner */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[11px] font-medium text-charcoal-600 shadow-md border border-charcoal-200">
        <Compass className="w-3.5 h-3.5 text-brand-500" />
        <span>Click on the map to set pickup or drop-off destination</span>
      </div>
    </div>
  );
};

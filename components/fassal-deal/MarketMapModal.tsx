'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { NashikMarket, calculateDistance } from '@/lib/nashik-markets';

interface Props {
  market: NashikMarket;
  isOpen: boolean;
  onClose: () => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface RouteInfo {
  distance: number;
  estimatedTime: number;
}

export default function MarketMapModal({
  market,
  isOpen,
  onClose,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [userLocation, setUserLocation] =
    useState<UserLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'info'>('map');

  const initializeMap = useCallback(async () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const L = (await import('leaflet')).default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const map = L.map(mapRef.current, {
        center: [market.latitude, market.longitude],
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          crossOrigin: true,
        }
      ).addTo(map);

      const marketIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            background: #16a34a;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
              margin-top: 2px;
            ">🏪</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marketMarker = L.marker(
        [market.latitude, market.longitude],
        { icon: marketIcon }
      ).addTo(map);

      marketMarker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
          <div style="font-weight: 700; font-size: 15px; color: #166534; margin-bottom: 6px;">
            🏪 ${market.name} APMC Mandi
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
            📍 ${market.address}
          </div>
          <div style="font-size: 12px; color: #374151; margin-bottom: 4px;">
            📦 ${market.commodities.join(', ')}
          </div>
          <div style="font-size: 11px; color: #9ca3af;">
            🕐 ${market.openDays}
            ${market.contactNumber ? ' · 📞 ' + market.contactNumber : ''}
          </div>
        </div>
      `, {
        maxWidth: 280,
      });

      marketMarker.openPopup();
      markersRef.current.push(marketMarker);
      mapInstanceRef.current = map;
      setMapLoaded(true);
    } catch (err) {
      console.error('Map init error:', err);
    }
  }, [market]);

  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('GPS not supported in your browser.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setUserLocation({
          lat: userLat,
          lng: userLng,
          accuracy,
        });

        setIsLoadingLocation(false);
        await addUserMarkerToMap(userLat, userLng);
        await drawOSRMRoute(userLat, userLng);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('Could not get location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [market]);

  const addUserMarkerToMap = useCallback(
    async (lat: number, lng: number) => {
      if (!mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      markersRef.current
        .filter((m) => (m as any)._isUserMarker)
        .forEach((m) => mapInstanceRef.current.removeLayer(m));

      const userIcon = L.divIcon({
        className: '',
        html: `
          <div style="position: relative;">
            <div style="
              background: #2563eb;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(37,99,235,0.6);
            "></div>
            <div style="
              position: absolute;
              top: -6px;
              left: -6px;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background: rgba(37,99,235,0.2);
              border: 2px solid rgba(37,99,235,0.4);
            "></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -15],
      });

      const userMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(mapInstanceRef.current);

      (userMarker as any)._isUserMarker = true;

      userMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-weight: 700; color: #1d4ed8; font-size: 14px;">
            📍 Your Location
          </div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            GPS Accuracy: ±${Math.round(userLocation?.accuracy || 0)}m
          </div>
        </div>
      `);

      markersRef.current.push(userMarker);

      const bounds = L.latLngBounds(
        [lat, lng],
        [market.latitude, market.longitude]
      );
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 14,
      });
    },
    [market, userLocation]
  );

  const drawOSRMRoute = useCallback(
    async (fromLat: number, fromLng: number) => {
      if (!mapInstanceRef.current) return;

      setIsLoadingRoute(true);
      setRouteError(null);

      try {
        const L = (await import('leaflet')).default;

        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
        }

        const osrmUrl =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${fromLng},${fromLat};` +
          `${market.longitude},${market.latitude}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(osrmUrl, {
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          throw new Error(`OSRM error: ${response.status}`);
        }

        const data = await response.json();

        if (
          !data.routes ||
          data.routes.length === 0 ||
          data.code !== 'Ok'
        ) {
          throw new Error('No route found');
        }

        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;

        const latLngs: [number, number][] = coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        const routeOutline = L.polyline(latLngs, {
          color: '#ffffff',
          weight: 8,
          opacity: 0.4,
        }).addTo(mapInstanceRef.current);

        const routeLine = L.polyline(latLngs, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.85,
        }).addTo(mapInstanceRef.current);

        const routeGroup = L.layerGroup([
          routeOutline,
          routeLine,
        ]).addTo(mapInstanceRef.current);

        routeLayerRef.current = routeGroup;

        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);

        setRouteInfo({
          distance: parseFloat(distanceKm),
          estimatedTime: durationMin,
        });

        mapInstanceRef.current.fitBounds(routeLine.getBounds(), {
          padding: [50, 50],
          maxZoom: 13,
        });
      } catch (err: any) {
        console.error('Route error:', err);
        await drawStraightLine(fromLat, fromLng);
        setRouteError('Road route unavailable. Showing straight-line distance.');
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [market]
  );

  const drawStraightLine = useCallback(
    async (fromLat: number, fromLng: number) => {
      if (!mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
      }

      const line = L.polyline(
        [
          [fromLat, fromLng],
          [market.latitude, market.longitude],
        ],
        {
          color: '#f59e0b',
          weight: 3,
          opacity: 0.8,
          dashArray: '10, 8',
        }
      ).addTo(mapInstanceRef.current);

      routeLayerRef.current = line;

      const dist = calculateDistance(
        fromLat, fromLng,
        market.latitude, market.longitude
      );

      setRouteInfo({
        distance: dist,
        estimatedTime: Math.round((dist / 40) * 60),
      });

      mapInstanceRef.current.fitBounds(line.getBounds(), {
        padding: [50, 50],
      });
    },
    [market]
  );

  const openInOSM = useCallback(() => {
    if (userLocation) {
      const url =
        `https://www.openstreetmap.org/directions?` +
        `engine=fossgis_osrm_car&` +
        `route=${userLocation.lat},${userLocation.lng};` +
        `${market.latitude},${market.longitude}`;
      window.open(url, '_blank');
    } else {
      const url =
        `https://www.openstreetmap.org/?` +
        `mlat=${market.latitude}&mlon=${market.longitude}#map=14/` +
        `${market.latitude}/${market.longitude}`;
      window.open(url, '_blank');
    }
  }, [market, userLocation]);

  useEffect(() => {
    if (isOpen && mapRef.current && !mapInstanceRef.current) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initializeMap]);

  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      routeLayerRef.current = null;
      setUserLocation(null);
      setRouteInfo(null);
      setLocationError(null);
      setRouteError(null);
      setMapLoaded(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m} min`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ height: '92vh', maxHeight: '720px' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">
              🏪
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-base leading-tight">
                {market.name} APMC Mandi
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">
                {market.taluka} · {market.district} District
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all flex items-center justify-center text-lg font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            className={[
              'flex-1 py-3 text-sm font-semibold transition-all',
              activeTab === 'map'
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            🗺️ Map & Directions
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={[
              'flex-1 py-3 text-sm font-semibold transition-all',
              activeTab === 'info'
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            ℹ️ Market Info
          </button>
        </div>

        {activeTab === 'map' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {routeInfo && (
              <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚗</span>
                  <div>
                    <span className="font-bold text-blue-700 text-base">
                      {routeInfo.distance} km
                    </span>
                    <span className="text-blue-600 text-sm ml-2">
                      ≈ {formatTime(routeInfo.estimatedTime)}
                    </span>
                  </div>
                </div>
                <div className="flex-1" />
                <button
                  onClick={openInOSM}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>🧭</span>
                  <span>Navigate</span>
                </button>
              </div>
            )}

            {locationError && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-100 flex-shrink-0">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700 text-xs flex-1">
                  {locationError}
                </span>
                <button
                  onClick={() => setLocationError(null)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  ×
                </button>
              </div>
            )}

            {routeError && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex-shrink-0">
                <span>⚠️</span>
                <span className="text-amber-700 text-xs flex-1">
                  {routeError}
                </span>
              </div>
            )}

            <div className="flex-1 relative min-h-0">
              <div
                ref={mapRef}
                className="w-full h-full"
                style={{ minHeight: '300px' }}
              />

              {!mapLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">
                      Loading OpenStreetMap...
                    </p>
                  </div>
                </div>
              )}

              {isLoadingRoute && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2 z-20">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-sm font-medium text-gray-700">
                    Finding route...
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 p-3 border-t border-gray-100 flex-shrink-0 bg-white">
              <button
                onClick={getUserLocation}
                disabled={isLoadingLocation}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoadingLocation ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Getting GPS...</span>
                  </>
                ) : userLocation ? (
                  <>
                    <span>🔄</span>
                    <span>Update Location</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Show My Location & Route</span>
                  </>
                )}
              </button>

              <button
                onClick={openInOSM}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-600 hover:text-green-700 font-semibold text-sm transition-all"
              >
                <span>🧭</span>
                <span className="hidden sm:inline">Open OSM</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <span>📍</span>
                <span>Exact Location</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Latitude</span>
                  <span className="font-mono font-semibold text-gray-700">
                    {market.latitude}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Longitude</span>
                  <span className="font-mono font-semibold text-gray-700">
                    {market.longitude}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taluka</span>
                  <span className="font-semibold text-gray-700">
                    {market.taluka}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">District</span>
                  <span className="font-semibold text-gray-700">
                    {market.district}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span>🏪</span>
                <span>Market Details</span>
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {market.address}
              </p>
              {market.contactNumber && (
                <a
                  href={'tel:' + market.contactNumber}
                  className="flex items-center gap-2 text-green-700 font-semibold text-sm hover:underline"
                >
                  <span>📞</span>
                  <span>{market.contactNumber}</span>
                </a>
              )}
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <span>📦</span>
                <span>Main Commodities</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {market.commodities.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-white border border-amber-200 rounded-full text-amber-700 text-xs font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                <span>🕐</span>
                <span>Trading Days</span>
              </h3>
              <p className="text-blue-700 font-semibold text-sm">
                {market.openDays}
              </p>
            </div>

            {userLocation && (
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
                  <span>📏</span>
                  <span>Distance from You</span>
                </h3>
                <p className="text-purple-700 font-bold text-xl">
                  {calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    market.latitude,
                    market.longitude
                  )} km
                </p>
              </div>
            )}

            <button
              onClick={openInOSM}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-all"
            >
              <span>🗺️</span>
              <span>Open Full Navigation in OpenStreetMap</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
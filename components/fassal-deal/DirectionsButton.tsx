'use client';

import { useState, useCallback } from 'react';
import { findMarketByName, NashikMarket } from '@/lib/nashik-markets';

interface Props {
  marketName: string;
  marketLocation?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export default function DirectionsButton({
  marketName,
  marketLocation,
  className = '',
  variant = 'outline',
}: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [marketInfo, setMarketInfo] = useState<NashikMarket | null>(null);

  const handleDirectionsClick = useCallback(() => {
    const market = findMarketByName(marketName);

    if (market) {
      setMarketInfo(market);
      setShowInfo(true);
    } else {
      const query = encodeURIComponent(
        `${marketName} APMC Mandi Nashik Maharashtra India`
      );
      window.open(
        `https://www.openstreetmap.org/search?query=${query}`,
        '_blank'
      );
    }
  }, [marketName]);

  const openInOSM = useCallback((userLat?: number, userLng?: number) => {
    if (!marketInfo) return;
    
    if (userLat && userLng) {
      const url =
        `https://www.openstreetmap.org/directions?` +
        `engine=fossgis_osrm_car&` +
        `route=${userLat},${userLng};` +
        `${marketInfo.latitude},${marketInfo.longitude}`;
      window.open(url, '_blank');
    } else {
      const url =
        `https://www.openstreetmap.org/?` +
        `mlat=${marketInfo.latitude}&mlon=${marketInfo.longitude}#map=14/` +
        `${marketInfo.latitude}/${marketInfo.longitude}`;
      window.open(url, '_blank');
    }
  }, [marketInfo]);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('GPS not supported in your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        openInOSM(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        alert('Location access denied. Opening market location only.');
        openInOSM();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [openInOSM]);

  const variantStyles = {
    default:
      'bg-green-600 hover:bg-green-700 text-white border-transparent',
    outline:
      'bg-white hover:bg-green-50 text-gray-700 hover:text-green-700 border-gray-200 hover:border-green-400',
    ghost:
      'bg-transparent hover:bg-green-50 text-gray-600 hover:text-green-700 border-transparent',
  };

  if (!showInfo) {
    return (
      <button
        onClick={handleDirectionsClick}
        className={[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl',
          'border-2 font-semibold text-sm transition-all',
          'hover:scale-105 active:scale-95',
          variantStyles[variant],
          className,
        ].join(' ')}
        title={`Get directions to ${marketName} APMC Market using OpenStreetMap`}
      >
        <span>🗺️</span>
        <span>Directions</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleDirectionsClick}
        className={[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl',
          'border-2 font-semibold text-sm transition-all',
          'hover:scale-105 active:scale-95',
          variantStyles[variant],
          className,
        ].join(' ')}
      >
        <span>🗺️</span>
        <span>Directions</span>
      </button>

      {showInfo && marketInfo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInfo(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">
                  🏪
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-base">
                    {marketInfo.name} APMC Mandi
                  </h2>
                  <p className="text-gray-500 text-xs">
                    {marketInfo.taluka} · {marketInfo.district}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-2">🏪 Market Details</h3>
                <p className="text-gray-600 text-sm">{marketInfo.address}</p>
                {marketInfo.contactNumber && (
                  <p className="text-green-700 font-semibold text-sm mt-2">
                    📞 {marketInfo.contactNumber}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-2">📦 Commodities</h3>
                <div className="flex flex-wrap gap-2">
                  {marketInfo.commodities.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-white border border-amber-200 rounded-full text-amber-700 text-xs font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 text-sm mb-2">📍 Coordinates</h3>
                <p className="text-gray-600 text-sm font-mono">
                  {marketInfo.latitude}, {marketInfo.longitude}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={getUserLocation}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
                >
                  <span>📍</span>
                  <span>Get Directions</span>
                </button>
                <button
                  onClick={() => openInOSM()}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-600 hover:text-green-700 font-semibold text-sm"
                >
                  <span>🧭</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
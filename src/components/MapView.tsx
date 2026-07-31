import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Navigation, ExternalLink, Loader2, Compass } from 'lucide-react';
import { api } from '../lib/api';

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  venueName?: string;
  address?: string;
  city?: string;
  country?: string;
  editable?: boolean;
  onLocationSelect?: (loc: {
    latitude: number;
    longitude: number;
    fullAddress: string;
    city: string;
    country: string;
  }) => void;
  height?: string;
}

// Fix default Leaflet icon paths
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const MapView: React.FC<MapViewProps> = ({
  latitude = 37.7749,
  longitude = -122.4194,
  venueName = 'Event Venue',
  address = 'San Francisco, CA',
  city = 'San Francisco',
  country = 'United States',
  editable = false,
  onLocationSelect,
  height = '350px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({ lat: latitude, lng: longitude });

  useEffect(() => {
    setCurrentCoords({ lat: latitude, lng: longitude });
  }, [latitude, longitude]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: 13,
        scrollWheelZoom: !editable,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([currentCoords.lat, currentCoords.lng], {
        icon: defaultIcon,
        draggable: editable,
      }).addTo(map);

      if (!editable) {
        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <strong style="font-size: 14px; color: #1e293b;">${venueName}</strong>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">${address}</p>
          </div>
        `).openPopup();
      }

      if (editable) {
        // Handle drag end
        marker.on('dragend', async () => {
          const latLng = marker.getLatLng();
          setCurrentCoords({ lat: latLng.lat, lng: latLng.lng });
          await handleReverseGeocode(latLng.lat, latLng.lng);
        });

        // Handle click on map
        map.on('click', async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          setCurrentCoords({ lat, lng });
          await handleReverseGeocode(lat, lng);
        });
      }

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    } else {
      // Update center & marker if props changed
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], mapInstanceRef.current.getZoom());
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
        markerInstanceRef.current.options.draggable = editable;
      }
    }

    return () => {
      // Keep map reference intact or destroy on unmount
    };
  }, [editable]);

  // Handle updates to coordinates
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 14);
      markerInstanceRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
    }
  }, [currentCoords]);

  const handleReverseGeocode = async (lat: number, lng: number) => {
    if (!onLocationSelect) return;
    setIsGeocoding(true);
    try {
      const res = await api.reverseGeocode(lat, lng);
      if (res.result) {
        const addrObj = res.result.address || {};
        const fullAddr = res.result.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const detectedCity = addrObj.city || addrObj.town || addrObj.village || addrObj.county || 'Unknown City';
        const detectedCountry = addrObj.country || 'Unknown Country';

        onLocationSelect({
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          fullAddress: fullAddr,
          city: detectedCity,
          country: detectedCountry,
        });
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSearchSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchLocation(searchQuery);
      setSearchResults(res.results || []);
    } catch (err) {
      console.error('Search location error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCurrentCoords({ lat, lng });

    const addrObj = result.address || {};
    const fullAddr = result.display_name;
    const detectedCity = addrObj.city || addrObj.town || addrObj.village || addrObj.county || 'Unknown City';
    const detectedCountry = addrObj.country || 'Unknown Country';

    if (onLocationSelect) {
      onLocationSelect({
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        fullAddress: fullAddr,
        city: detectedCity,
        country: detectedCountry,
      });
    }

    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]);
  };

  const openInGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentCoords.lat},${currentCoords.lng}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900/5">
      {editable && (
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search venue or address (e.g., Madison Square Garden, New York)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit(e);
                  }
                }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={handleSearchSubmit}
              disabled={isSearching}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 z-50 relative">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-slate-700/50 flex items-start gap-2 text-slate-700 dark:text-slate-200 transition"
                >
                  <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{res.display_name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-indigo-500" />
              Click map or drag marker to pinpoint exact location
            </span>
            {isGeocoding && (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Detecting address...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Bottom overlay with Open in Maps button */}
      <div className="absolute bottom-3 right-3 z-[400] flex gap-2">
        <button
          onClick={openInGoogleMaps}
          type="button"
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition hover:scale-105"
        >
          <Navigation className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Open in Maps / Directions</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </button>
      </div>
    </div>
  );
};

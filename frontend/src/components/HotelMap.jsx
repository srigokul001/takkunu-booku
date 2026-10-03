import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet default marker icon paths in bundled environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// City coordinate dictionary fallback
const cityCoordinates = {
  miami: { lat: 25.7867, lng: -80.1300 },
  'new york': { lat: 40.7645, lng: -73.9744 },
  aspen: { lat: 39.1866, lng: -106.8188 },
  honolulu: { lat: 21.2787, lng: -157.8282 },
  scottsdale: { lat: 33.5387, lng: -111.9261 },
  'lake tahoe': { lat: 38.9566, lng: -119.9572 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
};

const getCoordinatesForHotel = (hotel) => {
  if (hotel.coordinates && hotel.coordinates.lat && hotel.coordinates.lng) {
    return [hotel.coordinates.lat, hotel.coordinates.lng];
  }

  const loc = (hotel.location || '').toLowerCase();
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (loc.includes(city)) {
      return [coords.lat, coords.lng];
    }
  }

  return [25.7617, -80.1918]; // Default
};

const HotelMap = ({ hotel }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || !hotel) return;

    const coords = getCoordinatesForHotel(hotel);

    // If map already exists, just pan
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(coords, 14);
      return;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: coords,
      zoom: 14,
      scrollWheelZoom: false,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom Hotel Marker
    const marker = L.marker(coords).addTo(map);
    marker
      .bindPopup(
        `<div style="font-family: inherit; padding: 2px;">
          <h4 style="font-weight: 800; font-size: 13px; margin: 0 0 4px 0; color: #0f172a;">${hotel.hotelName}</h4>
          <p style="font-size: 11px; margin: 0; color: #64748b;">${hotel.address || hotel.location}</p>
          <span style="display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 700; color: #0d9488;">★ ${hotel.rating || 4.8} / 5.0 Rating</span>
        </div>`
      )
      .openPopup();

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [hotel]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Interactive Property Map</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Location & Neighborhood</h3>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center space-x-1">
          <Navigation className="w-3.5 h-3.5 text-teal-600" />
          <span>{hotel.address || hotel.location}</span>
        </div>
      </div>

      {/* Leaflet Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-72 w-full z-10">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Powered by OpenStreetMap & Leaflet</span>
        <span className="font-semibold text-slate-600">Airport & Transit Accessible</span>
      </div>
    </div>
  );
};

export default HotelMap;

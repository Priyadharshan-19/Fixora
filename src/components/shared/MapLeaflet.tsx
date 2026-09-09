'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { updateTechnicianLocation, getLiveLocations } from '@/lib/tracking';
import { Clock } from 'lucide-react';

// Centers map on coordinates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0) map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
}

export default function MapLeaflet({ role, jobId }: { role: 'customer' | 'technician', jobId: string }) {
  const [custLoc, setCustLoc] = useState<{ lat: number, lng: number } | null>(null);
  const [techLoc, setTechLoc] = useState<{ lat: number, lng: number } | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [eta, setEta] = useState<string>('Calculating...');

  // 1. Sync Locations
  useEffect(() => {
    let watchId: number;
    let pollInterval: NodeJS.Timeout;

    const syncData = async () => {
      const data = await getLiveLocations(jobId);
      if (data.customerLoc) setCustLoc(data.customerLoc);
      if (role === 'customer' && data.techLoc) setTechLoc(data.techLoc);
    };

    syncData();

    if (role === 'technician') {
      // Tech: Watch real GPS and push to DB
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setTechLoc(newLoc);
          updateTechnicianLocation(jobId, newLoc.lat, newLoc.lng);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    } else {
      // Customer: Poll DB for Tech's latest location every 5 seconds
      pollInterval = setInterval(syncData, 5000);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [role, jobId]);

  // 2. Fetch Real Street Route & ETA via OSRM
  useEffect(() => {
    if (!custLoc || !techLoc) return;

    const fetchRoute = async () => {
      try {
        // OSRM requires format: lng,lat;lng,lat
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${techLoc.lng},${techLoc.lat};${custLoc.lng},${custLoc.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
          const coordinates = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          setRoute(coordinates);

          // Calculate ETA
          const durationMins = Math.ceil(data.routes[0].duration / 60);
          setEta(durationMins <= 1 ? 'Arriving Now' : `~${durationMins} Mins`);
        }
      } catch (err) {
        console.error("Failed to fetch route");
      }
    };

    fetchRoute();
  }, [techLoc, custLoc]);

  // Custom Markers
  const customerIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="flex flex-col items-center -ml-3 -mt-6"><div class="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div><span class="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full mt-1 border border-neutral-200 text-neutral-900">Destination</span></div>`,
  });

  const techIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="flex flex-col items-center -ml-4 -mt-6"><div class="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white relative"><div class="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-75"></div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div><span class="text-[10px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">Technician</span></div>`,
  });

  const mapCenter = techLoc ? [techLoc.lat, techLoc.lng] : custLoc ? [custLoc.lat, custLoc.lng] : [11.0168, 76.9558];

  return (
    <div className="relative w-full h-full">
      {/* Live ETA Banner overlay */}
      {techLoc && custLoc && (
        <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-sm border border-neutral-200 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2">
          <Clock size={14} className="text-emerald-600 animate-spin" />
          <span className="text-xs font-bold text-neutral-900">ETA: {eta}</span>
        </div>
      )}

      <MapContainer center={mapCenter as [number, number]} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <MapUpdater center={mapCenter as [number, number]} />
        {custLoc && <Marker position={[custLoc.lat, custLoc.lng]} icon={customerIcon} />}
        {techLoc && <Marker position={[techLoc.lat, techLoc.lng]} icon={techIcon} />}
        {route.length > 0 && <Polyline positions={route} pathOptions={{ color: '#10b981', weight: 5, dashArray: '10, 10' }} />}
      </MapContainer>
    </div>
  );
}
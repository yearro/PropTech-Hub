"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet markers in Next.js
if (typeof window !== "undefined") {
  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
  L.Marker.prototype.options.icon = defaultIcon;
}

// ── Helper to recenter map without remounting ──────────────────────────────────
import { useMap } from "react-leaflet";
function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function Map({ 
  locationText, 
  latitude, 
  longitude 
}: { 
  locationText: string;
  latitude?: number;
  longitude?: number;
}) {
  const baseLat = 37.4419;
  const baseLng = -122.1430;
  
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    // 1. Check if we have valid numeric coordinates
    const hasLat = typeof latitude === "number" && !isNaN(latitude);
    const hasLng = typeof longitude === "number" && !isNaN(longitude);

    if (hasLat && hasLng) {
      setPosition([latitude as number, longitude as number]);
    } else {
      // 2. Fallback to text-based estimation, handling empty strings
      const safeText = locationText || "";
      const latOffset = (safeText.length % 10) * 0.01;
      const lngOffset = safeText.length > 0 ? (safeText.charCodeAt(0) % 10) * 0.01 : 0;
      setPosition([baseLat + latOffset, baseLng - lngOffset]);
    }
  }, [locationText, latitude, longitude]);

  if (!position) return <div className="w-full h-full bg-slate-100 animate-pulse"></div>;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <Recenter position={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {locationText || `${position[0]}, ${position[1]}`}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

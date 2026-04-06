"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet markers in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export default function Map({ locationText }: { locationText: string }) {
  const baseLat = 37.4419;
  const baseLng = -122.1430;
  
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    const latOffset = (locationText.length % 10) * 0.01;
    const lngOffset = (locationText.charCodeAt(0) % 10) * 0.01;
    setPosition([baseLat + latOffset, baseLng - lngOffset]);
  }, [locationText]);

  if (!position) return <div className="w-full h-full bg-slate-100 animate-pulse"></div>;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {locationText}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

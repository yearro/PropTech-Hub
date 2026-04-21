"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});

export function LazyMap({ 
  locationText, 
  latitude, 
  longitude 
}: { 
  locationText: string; 
  latitude?: number; 
  longitude?: number; 
}) {
  return <Map locationText={locationText} latitude={latitude} longitude={longitude} />;
}

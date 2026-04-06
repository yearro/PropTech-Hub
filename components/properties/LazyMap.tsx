"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});

export function LazyMap({ locationText }: { locationText: string }) {
  return <Map locationText={locationText} />;
}

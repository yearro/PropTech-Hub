"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function MainSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("location") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (location) {
      params.set("location", location);
    } else {
      params.delete("location");
    }
    
    // reset pagination on new search
    params.set("page", "1");
    
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">
          search
        </span>
      </div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="block w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white/10 transition-all text-lg outline-none"
        placeholder="Search by city, neighborhood, or address..."
      />
      <button 
        type="submit" 
        className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20"
      >
        Search
      </button>
    </form>
  );
}

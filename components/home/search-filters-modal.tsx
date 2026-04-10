"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFiltersModalProps {
  onClose: () => void;
  dict: any;
  lang: string;
}

export function SearchFiltersModal({ onClose, dict, lang }: SearchFiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "1200000");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "4500000");
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || dict.filters.any_type);
  const [beds, setBeds] = useState(parseInt(searchParams.get("beds") || "3", 10));
  const [baths, setBaths] = useState(parseInt(searchParams.get("baths") || "2", 10));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (location) params.set("location", location);
    else params.delete("location");
    
    if (minPrice && minPrice !== "1200000") params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice && maxPrice !== "4500000") params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    if (propertyType && propertyType !== dict.filters.any_type) params.set("type", propertyType);
    else params.delete("type");
    
    if (beds > 0) params.set("beds", beds.toString());
    else params.delete("beds");
    
    if (baths > 0) params.set("baths", baths.toString());
    else params.delete("baths");
    
    params.set("page", "1");

    router.push(`/${lang}/?${params.toString()}`, { scroll: false });
    onClose();
  };

  const handleClear = () => {
    setLocation("");
    setMinPrice("1200000");
    setMaxPrice("4500000");
    setPropertyType(dict.filters.any_type);
    setBeds(0);
    setBaths(0);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <main className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
          {/* Header */}
          <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <h1 className="text-2xl font-semibold tracking-tight text-nordic-dark">{dict.filters.title}</h1>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-nordic-muted"
            >
              <span className="material-icons">close</span>
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
            {/* Section 1: Location */}
            <section>
              <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider mb-3">{dict.filters.location}</label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-nordic-muted/60 group-focus-within:text-mosque transition-colors">location_on</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 bg-[#EEF6F6] border-0 rounded-lg text-nordic-dark placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all shadow-sm outline-none" 
                  placeholder={dict.filters.location_placeholder} 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </section>

            {/* Section 2: Price Range */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider">{dict.filters.price_range}</label>
                <span className="text-sm font-medium text-mosque">{dict.filters.select_range}</span>
              </div>
              <div className="relative h-12 flex items-center mb-6 px-2 opacity-50 pointer-events-none">
                <div className="absolute w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-mosque w-1/3 ml-[20%]"></div>
                </div>
                <div className="absolute left-[20%] w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10"></div>
                <div className="absolute left-[53%] w-6 h-6 bg-white border-2 border-mosque rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EEF6F6] p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-nordic-muted uppercase font-medium mb-1">{dict.filters.min_price}</label>
                  <div className="flex items-center">
                    <span className="text-nordic-muted/60 mr-1">$</span>
                    <input 
                      className="w-full bg-transparent border-0 p-0 text-nordic-dark font-medium focus:ring-0 text-sm outline-none" 
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-[#EEF6F6] p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-nordic-muted uppercase font-medium mb-1">{dict.filters.max_price}</label>
                  <div className="flex items-center">
                    <span className="text-nordic-muted/60 mr-1">$</span>
                    <input 
                      className="w-full bg-transparent border-0 p-0 text-nordic-dark font-medium focus:ring-0 text-sm outline-none" 
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Property Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider">{dict.filters.property_type}</label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#EEF6F6] border-0 rounded-lg py-3 pl-4 pr-10 text-nordic-dark appearance-none focus:ring-2 focus:ring-mosque cursor-pointer outline-none"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value={dict.filters.any_type}>{dict.filters.any_type}</option>
                    <option value="House">{dict.filters.house}</option>
                    <option value="Apartment">{dict.filters.apartment}</option>
                    <option value="Condo">{dict.filters.condo}</option>
                    <option value="Townhouse">{dict.filters.townhouse}</option>
                    <option value="Villa">{dict.filters.villa}</option>
                    <option value="Penthouse">{dict.filters.penthouse}</option>
                  </select>
                  <span className="material-icons absolute right-3 top-3 text-nordic-muted/60 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-nordic-dark">{dict.filters.bedrooms}</span>
                  <div className="flex items-center space-x-3 bg-[#EEF6F6] rounded-full p-1">
                    <button 
                      onClick={() => setBeds(Math.max(0, beds - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-nordic-muted hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-4 text-center text-nordic-dark">{beds}+</span>
                    <button 
                      onClick={() => setBeds(beds + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-nordic-dark">{dict.filters.bathrooms}</span>
                  <div className="flex items-center space-x-3 bg-[#EEF6F6] rounded-full p-1">
                    <button 
                      onClick={() => setBaths(Math.max(0, baths - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-nordic-muted hover:text-mosque transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-4 text-center text-nordic-dark">{baths}+</span>
                    <button 
                      onClick={() => setBaths(baths + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Amenities (Visual Only) */}
            <section>
              <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider mb-4">{dict.filters.amenities_features}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="cursor-pointer group relative">
                  <input defaultChecked className="peer sr-only" type="checkbox"/>
                  <div className="h-full px-4 py-3 rounded-lg border border-mosque bg-mosque/5 text-mosque font-medium text-sm flex items-center justify-center gap-2 transition-all peer-checked:bg-mosque/10 peer-checked:border-mosque peer-checked:text-mosque hover:bg-mosque/10">
                    <span className="material-icons text-lg">pool</span>
                    {dict.property_details.pool}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                </label>

                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox"/>
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-nordic-muted text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-nordic-muted/50 group-hover:text-nordic-muted peer-checked:text-mosque">fitness_center</span>
                    {dict.filters.gym}
                  </div>
                </label>
                
                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox"/>
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-nordic-muted text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-nordic-muted/50 group-hover:text-nordic-muted peer-checked:text-mosque">local_parking</span>
                    {dict.filters.parking}
                  </div>
                </label>
                
                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox"/>
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-nordic-muted text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-nordic-muted/50 group-hover:text-nordic-muted peer-checked:text-mosque">ac_unit</span>
                    {dict.filters.air_conditioning}
                  </div>
                </label>
                
                <label className="cursor-pointer group relative">
                  <input defaultChecked className="peer sr-only" type="checkbox"/>
                  <div className="h-full px-4 py-3 rounded-lg border border-mosque bg-mosque/5 text-mosque font-medium text-sm flex items-center justify-center gap-2 transition-all peer-checked:bg-mosque/10 peer-checked:border-mosque peer-checked:text-mosque hover:bg-mosque/10">
                    <span className="material-icons text-lg">wifi</span>
                    {dict.filters.high_speed_wifi}
                  </div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                </label>
                
                <label className="cursor-pointer group">
                  <input className="peer sr-only" type="checkbox"/>
                  <div className="h-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-nordic-muted text-sm flex items-center justify-center gap-2 transition-all hover:border-gray-300 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                    <span className="material-icons text-lg text-nordic-muted/50 group-hover:text-nordic-muted peer-checked:text-mosque">deck</span>
                    {dict.filters.patio_terrace}
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
            <button 
              onClick={handleClear}
              className="text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-colors underline decoration-gray-300 underline-offset-4"
            >
              {dict.filters.clear_all}
            </button>
            <button 
              onClick={handleApply}
              className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95"
            >
              {dict.filters.apply}
              <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </footer>
        </main>
      </div>
    </>
  );
}

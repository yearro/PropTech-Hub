"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageGallery({ images, title }: { images: string[], title: string }) {
  const validImages = images?.length > 0 ? images : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000"];
  // Ensuring we show up to 20 images
  const displayImages = validImages.slice(0, 20);
  const [mainImage, setMainImage] = useState(displayImages[0]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-gray-100">
        <Image 
          src={mainImage} 
          alt={title} 
          fill 
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">Premium</span>
        </div>
        <button 
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic-dark px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2"
          onClick={() => {
            // Optional: open a full screen gallery modal here
          }}
        >
          <span className="material-icons text-sm">grid_view</span>
          View All {displayImages.length} Photos
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
        {displayImages.map((img, idx) => (
          <div 
            key={idx} 
            onClick={() => setMainImage(img)}
            className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer snap-start transition-all ${mainImage === img ? "ring-2 ring-mosque ring-offset-2 ring-offset-clear-day opacity-100" : "opacity-70 hover:opacity-100"}`}
          >
            <Image 
              src={img} 
              alt={`${title} - view ${idx + 1}`} 
              width={300} 
              height={225} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

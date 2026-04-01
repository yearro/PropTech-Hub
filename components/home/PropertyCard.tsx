import { Property } from "@/types";
import Image from "next/image";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          alt={property.title}
          src={property.imageUrl}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-mosque hover:text-white transition-colors text-nordic-dark z-10">
          <span className="material-icons text-lg">favorite_border</span>
        </button>
        <div 
          className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded z-10 ${
            property.type === "FOR SALE" ? "bg-nordic-dark/90" : "bg-mosque/90"
          }`}
        >
          {property.type}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            ${property.price.toLocaleString()}
            {property.type === "FOR RENT" ? <span className="text-sm font-normal text-nordic-muted">/mo</span> : ""}
          </h3>
        </div>
        <h4 className="text-nordic-dark font-medium truncate mb-1">
          {property.title}
        </h4>
        <p className="text-nordic-muted text-xs mb-4">{property.location}</p>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">king_bed</span> {property.beds}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">bathtub</span> {property.baths}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">square_foot</span> {property.area.toLocaleString()}m²
          </div>
        </div>
      </div>
    </article>
  );
}

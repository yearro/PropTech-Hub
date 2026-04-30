import { Property } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { getCurrencyByCode } from "@/config/currencies";

export function PropertyCard({ property, lang, dict }: { property: Property; lang: string; dict: any }) {
  return (
    <Link href={`/${lang}/properties/${property.slug || property.id}`} className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          alt={property.title}
          src={property.images[0]}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton 
            propertyId={property.id} 
            lang={lang} 
            addLabel={dict.admin.favorites.add_favorite}
            removeLabel={dict.admin.favorites.remove_favorite}
          />
        </div>
        <div 
          className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded z-10 ${
            property.type === "FOR SALE" ? "bg-nordic-dark/90" : "bg-mosque/90"
          }`}
        >
          {property.type === "FOR SALE" ? dict.common.for_sale : dict.common.for_rent}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            {getCurrencyByCode(property.currency).symbol}
            {property.price.toLocaleString()}
            {property.currency && property.currency !== 'USD' && <span className="ml-1 text-[10px] font-bold text-mosque uppercase">{property.currency}</span>}
            {property.type === "FOR RENT" ? <span className="text-sm font-normal text-nordic-muted">{dict.common.per_month}</span> : ""}
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
            <span className="material-icons text-sm text-mosque/80">square_foot</span> {property.area.toLocaleString()}{dict.common.sqm}
          </div>
        </div>
      </div>
    </Link>
  );
}

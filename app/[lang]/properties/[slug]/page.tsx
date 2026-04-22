import { supabase } from "@/utils/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Property } from "@/types";
import { ImageGallery } from "@/components/properties/ImageGallery";
import { AgentCard } from "@/components/properties/AgentCard";

import { LazyMap } from "@/components/properties/LazyMap";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";

// Next.js 15 requires awaiting params
type Props = {
  params: Promise<{ slug: string; lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const dict = await getDictionary(lang as Locale);
  
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data || data.is_active === false) return { title: dict.property_details.not_found };

  return {
    title: `${data.title} | LuxeEstate`,
    description: dict.property_details.meta_description
      .replace("{title}", data.title)
      .replace("{location}", data.location)
      .replace("{price}", data.price.toLocaleString()),
    openGraph: {
      images: data.images || [],
    }
  };
}

export default async function PropertyDetails({ params }: Props) {
  const { slug, lang } = await params;
  const dict = await getDictionary(lang as Locale);
  
  const { data } = await supabase
    .from("properties")
    .select("*, agent:profiles(*)")
    .eq("slug", slug)
    .single();

  if (!data || data.is_active === false) {
    notFound();
  }

  // Handle camelCase mapping vs raw db snake_case
  const property: Property = {
    ...data,
    isFeatured: data.is_featured,
    images: data.images || []
  };

  const images = property.images;

  return (
    <div className="bg-background-light min-h-screen text-nordic-dark selection:bg-mosque/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 space-y-4">
            <ImageGallery images={images} title={property.title} dict={dict.property_details} />
          </div>

          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
                <div className="mb-4">
                  <h1 className="text-4xl font-display font-light text-nordic-dark mb-2">
                    ${property.price.toLocaleString()}
                    {property.type === "FOR RENT" ? <span className="text-xl text-nordic-muted">{dict.common.per_month}</span> : ""}
                  </h1>
                  <p className="text-nordic-dark/60 font-medium flex items-center gap-1">
                    <span className="material-icons text-mosque text-sm">location_on</span>
                    {property.location}
                  </p>
                </div>
                <div className="h-px bg-slate-100 my-6"></div>
                {property.agent && (
                  <AgentCard agent={property.agent} dict={dict.property_details} />
                )}
                {!property.agent && (
                  <div className="space-y-3">
                    <button className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group">
                      <span className="material-icons text-xl group-hover:scale-110 transition-transform">calendar_today</span>
                      {dict.property_details.schedule_visit}
                    </button>
                    <button className="w-full bg-transparent border border-nordic-dark/10 hover:border-mosque text-nordic-dark/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                      <span className="material-icons text-xl">mail_outline</span>
                      {dict.property_details.contact_agent}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                  <LazyMap 
                    locationText={property.location} 
                    latitude={data.latitude}
                    longitude={data.longitude}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 lg:-mt-8">
          <div className="lg:col-span-8 flex flex-col space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic-dark">{dict.property_details.features}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.area}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{dict.property_details.square_meters}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">bed</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.beds}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{dict.property_details.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">shower</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.baths}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{dict.property_details.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
                  <span className="text-xl font-bold text-nordic-dark">2</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{dict.property_details.garage}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-4 text-nordic-dark">{dict.property_details.about}</h2>
              <div className="prose prose-slate max-w-none text-nordic-dark/70 leading-relaxed">
                <p className="mb-4">
                  {dict.property_details.about_p1
                    .replace("{location}", property.location)
                    .replace("{type}", (property.type === "FOR RENT" ? dict.nav.rent : dict.nav.buy).toLowerCase())}
                </p>
                <p>
                  {dict.property_details.about_p2}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic-dark">{dict.property_details.amenities}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center gap-3 text-nordic-dark/70">
                  <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                  <span>{dict.property_details.smart_home}</span>
                </div>
                <div className="flex items-center gap-3 text-nordic-dark/70">
                  <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                  <span>{dict.property_details.pool}</span>
                </div>
                <div className="flex items-center gap-3 text-nordic-dark/70">
                  <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                  <span>{dict.property_details.heating_cooling}</span>
                </div>
                <div className="flex items-center gap-3 text-nordic-dark/70">
                  <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                  <span>{dict.property_details.ev_charging}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
                  <span className="material-icons">calculate</span>
                </div>
                <div>
                  <h3 className="font-semibold text-nordic-dark">{dict.property_details.estimated_payment}</h3>
                  <p className="text-sm text-nordic-dark/60">
                    {dict.property_details.starting_from} <strong className="text-mosque">${Math.round(property.price * 0.005).toLocaleString()}{dict.common.per_month}</strong> {dict.property_details.with_down}
                  </p>
                </div>
              </div>
              <button className="whitespace-nowrap px-4 py-2 bg-white border border-nordic-dark/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic-dark shadow-sm">
                {dict.property_details.calculate_mortgage}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-nordic-dark/50">
            © 2026 LuxeEstate Inc. {dict.common.rights_reserved}
          </div>
        </div>
      </footer>
    </div>
  );
}

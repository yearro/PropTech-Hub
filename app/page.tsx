import { FeaturedPropertyCard } from "@/components/home/featured-property-card";
import { PropertyCard } from "@/components/home/property-card";
import { supabase } from "@/utils/supabase";
import { Property } from "@/types";
import Link from "next/link";
import { FiltersAction } from "@/components/home/filters-action";

import { MainSearch } from "@/components/home/main-search";

export default async function Home(props: { 
  searchParams: Promise<{ 
    page?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string;
    beds?: string;
    baths?: string;
  }> 
}) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1', 10);
  const location = searchParams.location;
  const minPrice = searchParams.minPrice ? parseInt(searchParams.minPrice, 10) : undefined;
  const maxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice, 10) : undefined;
  const type = searchParams.type;
  const beds = searchParams.beds ? parseInt(searchParams.beds, 10) : undefined;
  const baths = searchParams.baths ? parseInt(searchParams.baths, 10) : undefined;

  const PAGE_SIZE = 8;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: featuredData } = await supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true);

  let query = supabase.from('properties').select('*', { count: 'exact' }).eq('is_featured', false);

  if (location) {
    // Basic ilike on location or title
    query = query.or(`location.ilike.%${location}%,title.ilike.%${location}%`);
  }
  if (minPrice) {
    query = query.gte('price', minPrice);
  }
  if (maxPrice) {
    query = query.lte('price', maxPrice);
  }
  if (type && type !== 'Any Type') {
    query = query.ilike('type', type);
  }
  if (beds) {
    query = query.gte('beds', beds);
  }
  if (baths) {
    query = query.gte('baths', baths);
  }

  const { data: propertiesData, count } = await query
    .range(from, to)
    .order('id', { ascending: true });

  const totalPages = count !== null ? Math.ceil(count / PAGE_SIZE) : 0;

  const mapProperty = (p: any): Property => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    area: p.area,
    images: p.images,
    isFeatured: p.is_featured,
    tag: p.tag,
    type: p.type,
    slug: p.slug
  });

  const featuredProperties = (featuredData || []).map(mapProperty);
  const standardProperties = (propertiesData || []).map(mapProperty);

  const hasFilters = !!(location || minPrice || maxPrice || (type && type !== 'Any Type') || beds || baths);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (minPrice) params.set("minPrice", minPrice.toString());
    if (maxPrice) params.set("maxPrice", maxPrice.toString());
    if (type) params.set("type", type);
    if (beds) params.set("beds", beds.toString());
    if (baths) params.set("baths", baths.toString());
    params.set("page", p.toString());
    return `/?${params.toString()}`;
  };

  return (
    <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-10">
      <section className="py-12 md:py-16 w-full max-w-[950px] mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight">
            Find your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 font-medium">sanctuary</span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
            </span>
            .
          </h1>

          <MainSearch />

          <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
            <Link href="/" scroll={false}>
              <button className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${!type || type === 'Any Type' ? 'bg-nordic-dark text-white border border-transparent shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5' : 'bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5'}`}>
                All
              </button>
            </Link>
            <Link href="/?type=House" scroll={false}>
              <button className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${type === 'House' ? 'bg-nordic-dark text-white border border-transparent shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5' : 'bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5'}`}>
                House
              </button>
            </Link>
            <Link href="/?type=Apartment" scroll={false}>
              <button className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${type === 'Apartment' ? 'bg-nordic-dark text-white border border-transparent shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5' : 'bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5'}`}>
                Apartment
              </button>
            </Link>
            <Link href="/?type=Villa" scroll={false}>
              <button className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${type === 'Villa' ? 'bg-nordic-dark text-white border border-transparent shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5' : 'bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5'}`}>
                Villa
              </button>
            </Link>
            <Link href="/?type=Penthouse" scroll={false}>
              <button className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${type === 'Penthouse' ? 'bg-nordic-dark text-white border border-transparent shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5' : 'bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5'}`}>
                Penthouse
              </button>
            </Link>
            <div className="w-px h-6 bg-nordic-dark/10 mx-2"></div>
            <FiltersAction />
          </div>
        </div>
      </section>

      {!hasFilters && (
        <section className="mb-16 w-full max-w-[950px] mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">Featured Collections</h2>
              <p className="text-nordic-muted mt-1 text-sm">Curated properties for the discerning eye.</p>
            </div>
            <a href="#" className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity">
              View all <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {featuredProperties.map((property) => (
              <FeaturedPropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      <section className="w-full max-w-[950px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
            <p className="text-nordic-muted mt-1 text-sm">Fresh opportunities added this week.</p>
          </div>
          <div className="hidden md:flex bg-white p-1 rounded-lg">
            <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">All</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark dark:hover:text-white transition-colors">Buy</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark dark:hover:text-white transition-colors">Rent</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start auto-rows-max">
          {standardProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        <div className="mt-12 flex justify-center items-center gap-2">
          {page > 1 && (
            <Link href={buildPageUrl(page - 1)} scroll={false}>
              <button className="flex items-center justify-center p-3 bg-white rounded-lg border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark transition-all">
                <span className="material-icons text-sm">chevron_left</span>
              </button>
            </Link>
          )}
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <Link key={pageNum} href={buildPageUrl(pageNum)} scroll={false}>
                <button
                  className={`flex items-center justify-center w-12 h-12 rounded-lg text-sm font-medium transition-all ${
                    pageNum === page
                      ? "bg-nordic-dark text-white border-transparent shadow-md hover:bg-nordic-dark/90"
                      : "bg-white border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark"
                  }`}
                >
                  {pageNum}
                </button>
              </Link>
            );
          })}

          {page < totalPages && (
            <Link href={buildPageUrl(page + 1)} scroll={false}>
              <button className="flex items-center justify-center p-3 bg-white rounded-lg border border-nordic-dark/10 hover:border-mosque hover:text-mosque text-nordic-dark transition-all">
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

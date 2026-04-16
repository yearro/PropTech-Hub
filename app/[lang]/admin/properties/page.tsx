import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import Image from "next/image";

export default async function AdminPropertiesPage(props: { 
  params: Promise<{ lang: string }>,
  searchParams: Promise<{ page?: string, type?: string, section?: string }> 
}) {
  const { lang } = await props.params;
  const { page = "1", type, section } = await props.searchParams;
  const dict = await getDictionary(lang as Locale);
  
  const pageSize = 10;
  const currentPage = parseInt(page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch properties with filters and pagination
  let query = supabase
    .from("properties")
    .select("*", { count: "exact" });

  if (type) {
    query = query.eq("type", type);
  }

  const { data: properties, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased font-display">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nordic-dark dark:text-white tracking-tight">
            {lang === 'es' ? 'Mis Propiedades' : 'My Properties'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {lang === 'es' ? 'Gestiona tu portafolio y monitorea el rendimiento.' : 'Manage your portfolio and track performance.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white dark:bg-[#152e2a] border border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-mosque/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
            <span className="material-icons text-base">filter_list</span> {dict.filters.title}
          </button>
          <button className="bg-mosque hover:bg-mosque/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-mosque/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
            <span className="material-icons text-base">add</span> {lang === 'es' ? 'Nueva Propiedad' : 'Add New Property'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Listings</p>
            <p className="text-2xl font-bold text-nordic-dark dark:text-white mt-1">{count || 0}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
            <span className="material-icons">apartment</span>
          </div>
        </div>
        {/* Mock stats for visual consistency with design */}
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Properties</p>
            <p className="text-2xl font-bold text-nordic-dark dark:text-white mt-1">18</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/10 flex items-center justify-center text-green-600">
            <span className="material-icons">check_circle</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Sale</p>
            <p className="text-2xl font-bold text-nordic-dark dark:text-white mt-1">4</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <span className="material-icons">pending</span>
          </div>
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-200 dark:border-mosque/20 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-mosque/5 border-b border-gray-100 dark:border-mosque/10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-6">Property Details</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Property Items */}
        {properties?.map((property) => (
          <div key={property.id} className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 dark:border-mosque/10 hover:bg-[#EEF6F6] dark:hover:bg-mosque/5 transition-colors items-center">
            {/* Property Details */}
            <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
              <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                <Image 
                  alt={property.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400'}
                  fill
                  sizes="112px"
                />
              </div>
              <div className="overflow-hidden">
                <h3 className="text-lg font-bold text-nordic-dark dark:text-white group-hover:text-mosque transition-colors cursor-pointer truncate">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{property.location}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bed</span> {property.beds} Beds</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bathtub</span> {property.baths} Baths</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{property.area} {dict.common.sqm}</span>
                </div>
              </div>
            </div>
            {/* Price */}
            <div className="col-span-6 md:col-span-2">
              <div className="text-base font-semibold text-nordic-dark dark:text-gray-200">${property.price.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Monthly: ${(property.price / 360).toFixed(0)}</div>
            </div>
            {/* Status */}
            <div className="col-span-6 md:col-span-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                Active
              </span>
            </div>
            {/* Actions */}
            <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
              <button className="p-2 rounded-lg text-gray-400 hover:text-mosque hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
                <span className="material-icons text-xl">edit</span>
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <span className="material-icons text-xl">delete_outline</span>
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(!properties || properties.length === 0) && (
          <div className="px-6 py-20 text-center">
            <span className="material-icons text-5xl text-gray-300 mb-4">inventory_2</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No properties found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-mosque/20 flex items-center justify-between bg-gray-50/50 dark:bg-mosque/5">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-nordic-dark dark:text-white">{from + 1}</span> to <span className="font-medium text-nordic-dark dark:text-white">{Math.min(to + 1, count || 0)}</span> of <span className="font-medium text-nordic-dark dark:text-white">{count || 0}</span> results
          </div>
          <div className="flex gap-2">
            <a 
              href={`/${lang}/admin/properties?page=${currentPage - 1}`}
              className={`px-3 py-1 text-sm border border-gray-200 dark:border-mosque/30 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-mosque/20 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Previous
            </a>
            <a 
              href={`/${lang}/admin/properties?page=${currentPage + 1}`}
              className={`px-3 py-1 text-sm border border-gray-200 dark:border-mosque/30 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-mosque/20 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
            >
              Next
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

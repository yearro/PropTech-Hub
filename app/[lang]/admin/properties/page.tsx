"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";

export default function AdminPropertiesPage(props: { 
  params: Promise<{ lang: string }>,
  searchParams: Promise<{ page?: string, type?: string, section?: string }> 
}) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const lang = params.lang as Locale;
  const page = searchParams.page || "1";
  const type = searchParams.type;

  const [properties, setProperties] = useState<any[]>([]);
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dict, setDict] = useState<any>(null);

  const pageSize = 10;
  const currentPage = isNaN(parseInt(page)) ? 1 : Math.max(1, parseInt(page));
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        // Load Dictionary
        const d = await getDictionary(lang);
        setDict(d);

        // Fetch properties with filters and pagination
        let query = supabase
          .from("properties")
          .select("id, title, location, price, beds, baths, area, images, type", { count: "exact" });

        if (type && type !== "All") {
          query = query.ilike("type", type);
        }

        const { data, count: totalCount, error: fetchError } = await query
          .order("title", { ascending: true })
          .range(from, to);

        if (fetchError) {
          setError(fetchError);
          console.error("[AdminPropertiesPage] Fetch error:", fetchError);
        } else {
          setProperties(data || []);
          setCount(totalCount || 0);
          setError(null);
        }
      } catch (e) {
        setError(e);
        console.error("[AdminPropertiesPage] Critical error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [lang, page, type, from, to]);

  const totalPages = Math.ceil(count / pageSize);

  if (!dict && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mosque"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased font-display">
      {/* Error Debug Section */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="material-icons text-xl font-bold">error_outline</span>
            <div>
              <p className="font-bold">Database Connection Error</p>
              <p className="text-xs opacity-80 mt-0.5">{error.message || "An unexpected error occurred while fetching properties."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nordic-dark dark:text-white tracking-tight">
            {lang === 'es' ? 'Listado de Propiedades' : 'Property List'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {lang === 'es' ? 'Gestiona tu portafolio y monitorea el rendimiento.' : 'Manage your portfolio and track performance.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white dark:bg-[#152e2a] border border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-mosque/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
            <span className="material-icons text-base">filter_list</span> {dict?.filters?.title || 'Filters'}
          </button>
          <button className="bg-mosque hover:bg-mosque/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-mosque/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 font-bold">
            <span className="material-icons text-base">add</span> {lang === 'es' ? 'Nueva Propiedad' : 'Add Property'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Listings</p>
            <p className="text-2xl font-black text-nordic-dark dark:text-white mt-1">{count}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
            <span className="material-icons">apartment</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</p>
            <p className="text-2xl font-black text-nordic-dark dark:text-white mt-1">{count}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/10 flex items-center justify-center text-green-600">
            <span className="material-icons text-xl font-bold">check_circle</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</p>
            <p className="text-2xl font-black text-nordic-dark dark:text-white mt-1 truncate max-w-[120px]">{type || 'All'}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <span className="material-icons">category</span>
          </div>
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-xl shadow-black/5 border border-gray-200 dark:border-mosque/20 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-mosque/5 border-b border-gray-100 dark:border-mosque/10 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <div className="col-span-6">Property Details</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-[#152e2a] divide-y divide-gray-100 dark:divide-mosque/10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-8 animate-pulse flex gap-6">
                <div className="w-28 h-20 bg-gray-200 dark:bg-mosque/10 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-mosque/10 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-100 dark:bg-mosque/5 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Property Items */}
        {!loading && properties.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-mosque/10">
            {properties.map((property) => (
              <div key={property.id} className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-[#EEF6F6] dark:hover:bg-mosque/5 transition-all items-center">
                {/* Property Details */}
                <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                  <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-sm">
                    <Image 
                      alt={property.title}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400'}
                      fill
                      sizes="112px"
                      unoptimized
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-lg font-black text-nordic-dark dark:text-white group-hover:text-mosque transition-colors cursor-pointer truncate leading-tight">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{property.location}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5"><span className="material-icons text-[14px]">bed</span> {property.beds}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5"><span className="material-icons text-[14px]">bathtub</span> {Math.floor(property.baths)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5"><span className="material-icons text-[14px]">square_foot</span> {Math.floor(property.area)} {dict?.common?.sqm || 'm²'}</span>
                    </div>
                  </div>
                </div>
                {/* Price */}
                <div className="col-span-6 md:col-span-2">
                  <div className="text-lg font-black text-nordic-dark dark:text-white">${Number(property.price).toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">EST. VALUE</div>
                </div>
                {/* Status */}
                <div className="col-span-6 md:col-span-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Active
                  </span>
                </div>
                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                  <button className="p-2 rounded-xl text-gray-400 hover:text-mosque hover:bg-white dark:hover:bg-mosque/20 shadow-none hover:shadow-lg transition-all">
                    <span className="material-icons text-xl">edit</span>
                  </button>
                  <button className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-red-900/10 shadow-none hover:shadow-lg transition-all">
                    <span className="material-icons text-xl">delete_outline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="px-6 py-24 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 dark:bg-mosque/5 text-gray-300 mb-6">
              <span className="material-icons text-5xl">inventory_2</span>
            </div>
            <p className="text-xl font-black text-nordic-dark dark:text-white">{lang === 'es' ? 'No se encontraron propiedades' : 'No properties found'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
              {lang === 'es' ? 'Intenta limpiar los filtros o asegúrate de que haya datos registrados.' : 'Try clearing your filters or ensure there is data registered in the database.'}
            </p>
          </div>
        )}

        {/* Pagination Section */}
        <div className="px-6 py-6 border-t border-gray-100 dark:border-mosque/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-mosque/5">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Showing <span className="text-nordic-dark dark:text-white">{Math.min(from + 1, count)}</span> - <span className="text-nordic-dark dark:text-white">{Math.min(to + 1, count)}</span> of <span className="text-nordic-dark dark:text-white">{count}</span> listings
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href={`/${lang}/admin/properties?page=${currentPage - 1}${type ? `&type=${type}` : ''}`}
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#152e2a] border border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 shadow-sm transition-all hover:-translate-y-0.5 ${currentPage <= 1 ? 'pointer-events-none opacity-30 shadow-none' : 'hover:border-mosque hover:text-mosque'}`}
            >
              <span className="material-icons text-sm font-bold">chevron_left</span>
            </Link>
            <div className="flex items-center gap-1.5 px-3">
              {[...Array(totalPages)].map((_, i) => (
                <Link 
                  key={i} 
                  href={`/${lang}/admin/properties?page=${i + 1}${type ? `&type=${type}` : ''}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${currentPage === i + 1 ? 'w-6 bg-mosque' : 'bg-gray-300 dark:bg-mosque/30 hover:bg-mosque/50'}`}
                />
              ))}
            </div>
            <Link 
              href={`/${lang}/admin/properties?page=${currentPage + 1}${type ? `&type=${type}` : ''}`}
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#152e2a] border border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 shadow-sm transition-all hover:-translate-y-0.5 ${currentPage >= totalPages ? 'pointer-events-none opacity-30 shadow-none' : 'hover:border-mosque hover:text-mosque'}`}
            >
              <span className="material-icons text-sm font-bold">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

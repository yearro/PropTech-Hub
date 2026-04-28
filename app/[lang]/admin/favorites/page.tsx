"use client";

import { useState, useEffect, use, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";

export default function FavoritesPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = use(props.params);
  const lang = params.lang as Locale;

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dict, setDict] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error: fetchError } = await supabase
        .from("saved_properties")
        .select(`
          id,
          property:properties (
            id, title, location, price, beds, baths, area, images, type, status, is_active, slug
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError);
      } else {
        // Filter out any entries where property might be null (deleted property)
        setFavorites(data?.filter(f => f.property) || []);
      }
    } catch (e) {
      setError(e);
      console.error("Error fetching favorites:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dict) fetchFavorites();
  }, [dict, fetchFavorites]);

  const handleRemoveFavorite = async (id: string) => {
    if (!confirm(dict?.admin?.favorites?.remove_confirm || "Are you sure?")) return;

    try {
      const { error: deleteError } = await supabase
        .from("saved_properties")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (e) {
      console.error("Failed to remove favorite:", e);
    }
  };

  if (!dict && loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mosque" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased font-display">
      {/* Error banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-icons text-xl">error_outline</span>
            <div>
              <p className="font-bold">Database Error</p>
              <p className="text-xs opacity-80 mt-0.5">{error.message || "An unexpected error occurred."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-white tracking-tight">
          {dict?.admin?.favorites?.title || "My Favorites"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {dict?.admin?.favorites?.subtitle || "Properties you have saved."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {dict?.admin?.favorites?.stats_total || "Total Favorites"}
            </p>
            <p className="font-black text-nordic-dark dark:text-white mt-1 text-2xl">
              {favorites.length}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-mosque/10 text-mosque">
            <span className="material-icons">favorite</span>
          </div>
        </div>
      </div>

      {/* List container */}
      <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-xl shadow-black/5 border border-gray-200 dark:border-mosque/20 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-mosque/5 border-b border-gray-100 dark:border-mosque/10 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <div className="col-span-6">{dict?.admin?.favorites?.table_property || "Property Details"}</div>
          <div className="col-span-2">{dict?.admin?.favorites?.table_price || "Price"}</div>
          <div className="col-span-2">{dict?.admin?.favorites?.table_status || "Status"}</div>
          <div className="col-span-2 text-right">{dict?.admin?.favorites?.table_actions || "Actions"}</div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-mosque/10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-8 animate-pulse flex gap-6">
                <div className="w-28 h-20 bg-gray-200 dark:bg-mosque/10 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-mosque/10 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-mosque/5 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-mosque/10">
            {favorites.map((fav) => {
              const p = fav.property;
              return (
                <div
                  key={fav.id}
                  className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-[#EEF6F6] dark:hover:bg-mosque/5 transition-all items-center"
                >
                  {/* Details */}
                  <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                    <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-sm">
                      <Image
                        alt={p.title}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400"}
                        fill
                        sizes="112px"
                        unoptimized
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-base font-black text-nordic-dark dark:text-white group-hover:text-mosque transition-colors truncate leading-tight flex items-center gap-2">
                        {p.title}
                        {!p.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-600 border border-red-200 uppercase font-black tracking-tighter">
                            Inactive
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {p.location}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-[13px]">bed</span>
                          {p.beds}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-[13px]">bathtub</span>
                          {Math.floor(p.baths)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-[13px]">square_foot</span>
                          {Math.floor(p.area)} m²
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-6 md:col-span-2">
                    <div className="text-base font-black text-nordic-dark dark:text-white">
                      ${Number(p.price).toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                      Price
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-6 md:col-span-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      p.status === 'sold' 
                        ? 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 text-gray-500 dark:text-gray-400'
                        : 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${p.status === 'sold' ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
                      {p.status?.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                    <Link
                      href={`/${lang}/properties/${p.slug || p.id}`}
                      className="p-2 rounded-xl text-gray-400 hover:text-mosque hover:bg-white dark:hover:bg-mosque/20 shadow-none hover:shadow-lg transition-all"
                      title={dict?.admin?.favorites?.view_details || "View Details"}
                    >
                      <span className="material-icons text-xl">visibility</span>
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 shadow-none hover:shadow-lg transition-all"
                      title={dict?.admin?.favorites?.remove_favorite || "Remove from favorites"}
                    >
                      <span className="material-icons text-xl">favorite</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-24 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 dark:bg-mosque/5 text-gray-300 mb-6">
              <span className="material-icons text-5xl">favorite_border</span>
            </div>
            <p className="text-xl font-black text-nordic-dark dark:text-white">
              {dict?.admin?.favorites?.empty_title || "No favorites yet"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
              {dict?.admin?.favorites?.empty_subtitle || "Explore our properties and click the heart icon to save them."}
            </p>
            <Link
              href={`/${lang}`}
              className="mt-6 px-6 py-3 rounded-xl bg-mosque text-white text-sm font-bold hover:bg-mosque/90 transition-all shadow-md shadow-mosque/20 inline-flex items-center gap-2"
            >
              <span className="material-icons text-base">explore</span>
              {lang === "es" ? "Explorar propiedades" : "Explore Properties"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

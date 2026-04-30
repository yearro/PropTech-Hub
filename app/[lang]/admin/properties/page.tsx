"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { getCurrencyByCode } from "@/config/currencies";

// ─── Filter state ────────────────────────────────────────────────────────────
interface Filters {
  search: string;
  type: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  visibility: "all" | "active" | "inactive";
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  type: "all",
  status: "all",
  minPrice: "",
  maxPrice: "",
  sortBy: "title_asc",
  visibility: "all",
};

const PROPERTY_TYPES = ["apartment", "house", "villa", "penthouse", "commercial"];
const SORT_OPTIONS = [
  { value: "title_asc",   col: "title",  asc: true  },
  { value: "title_desc",  col: "title",  asc: false },
  { value: "price_asc",   col: "price",  asc: true  },
  { value: "price_desc",  col: "price",  asc: false },
  { value: "area_desc",   col: "area",   asc: false },
];

// ─── Status badge helper ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    "for-sale": {
      bg: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50",
      text: "text-green-700 dark:text-green-300",
      dot: "bg-green-500",
      label: "For Sale",
    },
    "for-rent": {
      bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50",
      text: "text-blue-700 dark:text-blue-300",
      dot: "bg-blue-500",
      label: "For Rent",
    },
    sold: {
      bg: "bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50",
      text: "text-gray-500 dark:text-gray-400",
      dot: "bg-gray-400",
      label: "Sold",
    },
  };
  const s = map[status ?? ""] ?? map["for-sale"];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.bg} ${s.text} border`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} mr-2 animate-pulse`} />
      {s.label}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPropertiesPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const lang = params.lang as Locale;
  const pageParam = searchParams.page || "1";

  const [properties, setProperties] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0); // unfiltered total
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dict, setDict] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  // Filter panel state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Pagination (resets to 1 when filters change)
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, isNaN(parseInt(pageParam)) ? 1 : parseInt(pageParam))
  );
  const pageSize = 10;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const activeFilterCount = [
    appliedFilters.search !== "",
    appliedFilters.type !== "all",
    appliedFilters.status !== "all",
    appliedFilters.minPrice !== "",
    appliedFilters.maxPrice !== "",
    appliedFilters.sortBy !== "title_asc",
    appliedFilters.visibility !== "all",
  ].filter(Boolean).length;

  // ── dictionary ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getDictionary(lang).then(setDict);
    // Fetch current user session and role
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase
          .from("profiles")
          .select("id, role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setCurrentUser({ id: data.id, role: data.role });
          });
      }
    });
  }, [lang]);

  // ── Fetch total (unfiltered) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!dict || !currentUser) return;
    let query = supabase
      .from("properties")
      .select("id", { count: "exact", head: true });
    
    if (currentUser.role !== 'admin') {
      query = query.eq('agent_id', currentUser.id);
    }
    
    query.then(({ count: c }) => setTotalCount(c ?? 0));
  }, [dict, currentUser]);

  // ── Fetch with filters ──────────────────────────────────────────────────────
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("properties")
        .select("id, title, location, price, beds, baths, area, images, type, status, is_active, agent_id, currency", {
          count: "exact",
        });

      // Role-based filtering
      if (currentUser && currentUser.role !== 'admin') {
        query = query.eq('agent_id', currentUser.id);
      }

      // Search
      if (appliedFilters.search.trim()) {
        const searchTerm = appliedFilters.search.trim();
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
      }
      // Type
      if (appliedFilters.type !== "all") {
        query = query.ilike("type", appliedFilters.type);
      }
      // Status
      if (appliedFilters.status !== "all") {
        query = query.eq("status", appliedFilters.status);
      }
      // Price range
      if (appliedFilters.minPrice !== "") {
        query = query.gte("price", parseFloat(appliedFilters.minPrice));
      }
      if (appliedFilters.maxPrice !== "") {
        query = query.lte("price", parseFloat(appliedFilters.maxPrice));
      }
      // Visibility
      if (appliedFilters.visibility === "active") {
        query = query.eq("is_active", true);
      } else if (appliedFilters.visibility === "inactive") {
        query = query.eq("is_active", false);
      }

      // Sorting
      const sortOpt = SORT_OPTIONS.find((o) => o.value === appliedFilters.sortBy) ?? SORT_OPTIONS[0];
      query = query.order(sortOpt.col, { ascending: sortOpt.asc });

      // Pagination
      query = query.range(from, to);

      const { data, count: filteredCount, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError);
      } else {
        setProperties(data || []);
        setCount(filteredCount ?? 0);
        setError(null);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, from, to, currentUser]);

  useEffect(() => {
    if (dict && currentUser) fetchProperties();
  }, [dict, fetchProperties, currentUser]);

  const totalPages = Math.ceil(count / pageSize);

  // ── Toggle Visibility ────────────────────────────────────────────────────────
  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_active: !currentStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state to reflect change immediately without full reload
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
      );
    } catch (e) {
      console.error("Failed to toggle visibility:", e);
      alert(lang === "es" ? "Error al cambiar la visibilidad" : "Failed to change visibility");
    }
  };

  // ── Apply / reset filters ────────────────────────────────────────────────────
  const applyFilters = () => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const setField = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  if (!dict || !currentUser || (loading && properties.length === 0)) {
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
              <p className="text-xs opacity-80 mt-0.5">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-nordic-dark dark:text-white tracking-tight">
            {lang === "es" ? "Listado de Propiedades" : "Property List"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {lang === "es"
              ? "Gestiona tu portafolio y monitorea el rendimiento."
              : "Manage your portfolio and track performance."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter toggle button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`relative border px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm inline-flex items-center gap-2 ${
              filtersOpen || activeFilterCount > 0
                ? "bg-mosque text-white border-mosque shadow-mosque/20"
                : "bg-white dark:bg-[#152e2a] border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-mosque/10"
            }`}
          >
            <span className="material-icons text-base">
              {filtersOpen ? "filter_list_off" : "filter_list"}
            </span>
            {lang === "es" ? "Filtros" : "Filters"}
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-white text-mosque text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          <Link
            href={`/${lang}/admin/properties/new`}
            className="bg-mosque hover:bg-mosque/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-mosque/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 font-bold"
          >
            <span className="material-icons text-base">add</span>
            {lang === "es" ? "Nueva Propiedad" : "Add Property"}
          </Link>
        </div>
      </div>

      {/* ── Filter Panel ────────────────────────────────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          filtersOpen ? "max-h-[600px] opacity-100 mb-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white dark:bg-[#152e2a] rounded-xl border border-gray-200 dark:border-mosque/20 shadow-sm p-6">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
                <span className="material-icons text-base">tune</span>
              </div>
              <h2 className="font-bold text-nordic-dark dark:text-white text-sm">
                {lang === "es" ? "Filtros de búsqueda" : "Search Filters"}
              </h2>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 bg-mosque/10 text-mosque rounded-full uppercase tracking-wide">
                  {activeFilterCount} {lang === "es" ? "activos" : "active"}
                </span>
              )}
            </div>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <span className="material-icons text-sm">restart_alt</span>
              {lang === "es" ? "Limpiar todo" : "Clear all"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {lang === "es" ? "Buscar" : "Search"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-icons text-base">
                  search
                </span>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setField("search", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  placeholder={lang === "es" ? "Título o ubicación..." : "Title or location..."}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-mosque/30 bg-gray-50 dark:bg-[#0f2320] text-nordic-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mosque/40 focus:border-mosque transition-all"
                />
              </div>
            </div>

            {/* Property type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {lang === "es" ? "Tipo" : "Property Type"}
              </label>
              <select
                value={filters.type}
                onChange={(e) => setField("type", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-mosque/30 bg-gray-50 dark:bg-[#0f2320] text-nordic-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-mosque/40 focus:border-mosque transition-all cursor-pointer"
              >
                <option value="all">{lang === "es" ? "Todos los tipos" : "All types"}</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {lang === "es" ? "Estado" : "Status"}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setField("status", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-mosque/30 bg-gray-50 dark:bg-[#0f2320] text-nordic-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-mosque/40 focus:border-mosque transition-all cursor-pointer"
              >
                <option value="all">{lang === "es" ? "Todos los estados" : "All statuses"}</option>
                <option value="for-sale">{lang === "es" ? "En Venta" : "For Sale"}</option>
                <option value="for-rent">{lang === "es" ? "En Renta" : "For Rent"}</option>
                <option value="sold">{lang === "es" ? "Vendido" : "Sold"}</option>
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {lang === "es" ? "Precio mín ($)" : "Min Price ($)"}
              </label>
              <input
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(e) => setField("minPrice", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-mosque/30 bg-gray-50 dark:bg-[#0f2320] text-nordic-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mosque/40 focus:border-mosque transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {lang === "es" ? "Precio máx ($)" : "Max Price ($)"}
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => setField("maxPrice", e.target.value)}
                placeholder="∞"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-mosque/30 bg-gray-50 dark:bg-[#0f2320] text-nordic-dark dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-mosque/40 focus:border-mosque transition-all"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {lang === "es" ? "Ordenar por" : "Sort By"}
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setField("sortBy", e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-mosque/30 bg-gray-50 dark:bg-[#0f2320] text-nordic-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-mosque/40 focus:border-mosque transition-all cursor-pointer"
              >
                <option value="title_asc">{lang === "es" ? "Nombre A–Z" : "Name A–Z"}</option>
                <option value="title_desc">{lang === "es" ? "Nombre Z–A" : "Name Z–A"}</option>
                <option value="price_asc">{lang === "es" ? "Precio ↑" : "Price ↑"}</option>
                <option value="price_desc">{lang === "es" ? "Precio ↓" : "Price ↓"}</option>
                <option value="area_desc">{lang === "es" ? "Área mayor primero" : "Largest area first"}</option>
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                {lang === "es" ? "Visibilidad" : "Visibility"}
              </label>
              <select
                value={filters.visibility}
                onChange={(e) => setField("visibility", e.target.value as any)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-mosque/30 bg-gray-50 dark:bg-[#0f2320] text-nordic-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-mosque/40 focus:border-mosque transition-all cursor-pointer"
              >
                <option value="all">{lang === "es" ? "Mostrar todas" : "Show all"}</option>
                <option value="active">{lang === "es" ? "Solo activas" : "Active only"}</option>
                <option value="inactive">{lang === "es" ? "Solo inactivas" : "Inactive only"}</option>
              </select>
            </div>
          </div>

          {/* Action row */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-mosque/10">
            <button
              onClick={() => setFiltersOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-mosque/30 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-mosque/10 transition-colors"
            >
              {lang === "es" ? "Cancelar" : "Cancel"}
            </button>
            <button
              onClick={applyFilters}
              className="px-5 py-2 text-sm font-bold rounded-lg bg-mosque text-white hover:bg-mosque/90 transition-colors shadow-sm shadow-mosque/20 inline-flex items-center gap-2"
            >
              <span className="material-icons text-base">search</span>
              {lang === "es" ? "Aplicar filtros" : "Apply Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Applied filter chips ─────────────────────────────────────────── */}
      {activeFilterCount > 0 && !filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mr-1">
            {lang === "es" ? "Filtrando por:" : "Filters:"}
          </span>
          {appliedFilters.search && (
            <FilterChip
              label={`"${appliedFilters.search}"`}
              onRemove={() => { setFilters(f => ({ ...f, search: "" })); setAppliedFilters(f => ({ ...f, search: "" })); setCurrentPage(1); }}
            />
          )}
          {appliedFilters.type !== "all" && (
            <FilterChip
              label={appliedFilters.type.charAt(0).toUpperCase() + appliedFilters.type.slice(1)}
              onRemove={() => { setFilters(f => ({ ...f, type: "all" })); setAppliedFilters(f => ({ ...f, type: "all" })); setCurrentPage(1); }}
            />
          )}
          {appliedFilters.status !== "all" && (
            <FilterChip
              label={appliedFilters.status}
              onRemove={() => { setFilters(f => ({ ...f, status: "all" })); setAppliedFilters(f => ({ ...f, status: "all" })); setCurrentPage(1); }}
            />
          )}
          {appliedFilters.minPrice && (
            <FilterChip
              label={`≥ $${Number(appliedFilters.minPrice).toLocaleString()}`}
              onRemove={() => { setFilters(f => ({ ...f, minPrice: "" })); setAppliedFilters(f => ({ ...f, minPrice: "" })); setCurrentPage(1); }}
            />
          )}
          {appliedFilters.maxPrice && (
            <FilterChip
              label={`≤ $${Number(appliedFilters.maxPrice).toLocaleString()}`}
              onRemove={() => { setFilters(f => ({ ...f, maxPrice: "" })); setAppliedFilters(f => ({ ...f, maxPrice: "" })); setCurrentPage(1); }}
            />
          )}
          <button
            onClick={resetFilters}
            className="text-xs text-red-400 hover:text-red-600 font-semibold ml-1 transition-colors flex items-center gap-1"
          >
            <span className="material-icons text-sm">close</span>
            {lang === "es" ? "Limpiar" : "Clear all"}
          </button>
        </div>
      )}

      {/* ── Stats cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard
          label={lang === "es" ? "Total general" : "Total Listings"}
          value={totalCount}
          icon="apartment"
          iconClass="bg-mosque/10 text-mosque"
        />
        <StatCard
          label={lang === "es" ? "Resultados filtrados" : "Filtered Results"}
          value={count}
          icon="filter_list"
          iconClass="bg-blue-100 dark:bg-blue-900/20 text-blue-600"
        />
        <StatCard
          label={lang === "es" ? "Página actual" : "Current Page"}
          value={`${currentPage} / ${totalPages || 1}`}
          icon="pages"
          iconClass="bg-orange-100 dark:bg-orange-900/20 text-orange-600"
          small
        />
      </div>

      {/* ── Property list container ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-xl shadow-black/5 border border-gray-200 dark:border-mosque/20 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-mosque/5 border-b border-gray-100 dark:border-mosque/10 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          <div className="col-span-6">
            {lang === "es" ? "Detalles de la propiedad" : "Property Details"}
          </div>
          <div className="col-span-2">{lang === "es" ? "Precio" : "Price"}</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">{lang === "es" ? "Acciones" : "Actions"}</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="divide-y divide-gray-100 dark:divide-mosque/10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-8 animate-pulse flex gap-6">
                <div className="w-28 h-20 bg-gray-200 dark:bg-mosque/10 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-mosque/10 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-mosque/5 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 dark:bg-mosque/5 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rows */}
        {!loading && properties.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-mosque/10">
            {properties.map((property) => (
              <div
                key={property.id}
                className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-[#EEF6F6] dark:hover:bg-mosque/5 transition-all items-center"
              >
                {/* Details */}
                <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                  <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-sm">
                    <Image
                      alt={property.title}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      src={
                        property.images?.[0] ||
                        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400"
                      }
                      fill
                      sizes="112px"
                      unoptimized
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-base font-black text-nordic-dark dark:text-white group-hover:text-mosque transition-colors truncate leading-tight flex items-center gap-2">
                      {property.title}
                      {!property.is_active && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 text-red-600 border border-red-200 uppercase font-black tracking-tighter">
                          {dict?.admin?.properties?.inactive || "Inactive"}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {property.location}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[13px]">bed</span>
                        {property.beds}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[13px]">bathtub</span>
                        {Math.floor(property.baths)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[13px]">square_foot</span>
                        {Math.floor(property.area)} {dict?.common?.sqm || "m²"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-6 md:col-span-2">
                  <div className="text-base font-black text-nordic-dark dark:text-white">
                    {getCurrencyByCode(property.currency).symbol}{Number(property.price).toLocaleString()}
                    {property.currency !== 'USD' && <span className="ml-1 text-[10px] text-gray-400 font-bold">{property.currency}</span>}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                    EST. VALUE
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-6 md:col-span-2">
                  <StatusBadge status={property.status} />
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                  <Link
                    href={`/${lang}/admin/properties/${property.id}`}
                    className="p-2 rounded-xl text-gray-400 hover:text-mosque hover:bg-white dark:hover:bg-mosque/20 shadow-none hover:shadow-lg transition-all"
                    title={lang === "es" ? "Editar" : "Edit"}
                  >
                    <span className="material-icons text-xl">edit</span>
                  </Link>
                  <button
                    onClick={() => handleToggleVisibility(property.id, property.is_active)}
                    className={`p-2 rounded-xl transition-all shadow-none hover:shadow-lg ${
                      property.is_active 
                        ? "text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10" 
                        : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
                    }`}
                    title={
                      property.is_active
                        ? (dict?.admin?.properties?.hide || (lang === "es" ? "Ocultar" : "Hide"))
                        : (dict?.admin?.properties?.show || (lang === "es" ? "Mostrar" : "Show"))
                    }
                  >
                    <span className="material-icons text-xl">
                      {property.is_active ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && properties.length === 0 && (
          <div className="px-6 py-24 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 dark:bg-mosque/5 text-gray-300 mb-6">
              <span className="material-icons text-5xl">
                {activeFilterCount > 0 ? "search_off" : "inventory_2"}
              </span>
            </div>
            <p className="text-xl font-black text-nordic-dark dark:text-white">
              {activeFilterCount > 0
                ? lang === "es"
                  ? "Sin resultados"
                  : "No results found"
                : lang === "es"
                ? "No se encontraron propiedades"
                : "No properties found"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
              {activeFilterCount > 0
                ? lang === "es"
                  ? "Intenta ajustar o limpiar los filtros activos."
                  : "Try adjusting or clearing the active filters."
                : lang === "es"
                ? "Agrega tu primera propiedad usando el botón de arriba."
                : "Add your first property using the button above."}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="mt-5 px-5 py-2.5 rounded-lg bg-mosque text-white text-sm font-bold hover:bg-mosque/90 transition-colors inline-flex items-center gap-2"
              >
                <span className="material-icons text-base">restart_alt</span>
                {lang === "es" ? "Limpiar filtros" : "Clear filters"}
              </button>
            )}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-mosque/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-mosque/5">
          <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {lang === "es" ? "Mostrando" : "Showing"}{" "}
            <span className="text-nordic-dark dark:text-white">{Math.min(from + 1, count)}</span>
            {" – "}
            <span className="text-nordic-dark dark:text-white">{Math.min(to + 1, count)}</span>
            {" "}{lang === "es" ? "de" : "of"}{" "}
            <span className="text-nordic-dark dark:text-white">{count}</span>{" "}
            {lang === "es" ? "propiedades" : "listings"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#152e2a] border border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 shadow-sm transition-all ${
                currentPage <= 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:border-mosque hover:text-mosque hover:-translate-y-0.5"
              }`}
            >
              <span className="material-icons text-sm">chevron_left</span>
            </button>

            <div className="flex items-center gap-1.5 px-2">
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`transition-all rounded-full ${
                      currentPage === p
                        ? "w-6 h-2 bg-mosque rounded-full"
                        : "w-2 h-2 bg-gray-300 dark:bg-mosque/30 hover:bg-mosque/50 rounded-full"
                    }`}
                  />
                );
              })}
              {totalPages > 7 && (
                <span className="text-xs text-gray-400 px-1">…{totalPages}</span>
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#152e2a] border border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 shadow-sm transition-all ${
                currentPage >= totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:border-mosque hover:text-mosque hover:-translate-y-0.5"
              }`}
            >
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  iconClass,
  small = false,
}: {
  label: string;
  value: number | string;
  icon: string;
  iconClass: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02] cursor-default">
      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className={`font-black text-nordic-dark dark:text-white mt-1 ${small ? "text-xl" : "text-2xl"}`}>
          {value}
        </p>
      </div>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconClass}`}>
        <span className="material-icons">{icon}</span>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-mosque/10 text-mosque border border-mosque/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-red-500 transition-colors rounded-full"
      >
        <span className="material-icons text-sm leading-none">close</span>
      </button>
    </span>
  );
}

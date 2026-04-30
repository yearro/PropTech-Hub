"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { getAvatarFallback } from "@/utils/avatarFallback";
import { SUPPORTED_CURRENCIES, getCurrencyByCode } from "@/config/currencies";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const BUCKET = "property-images";

const AMENITIES_KEYS = [
  "pool",
  "garden",
  "ac",
  "smart_home",
  "gym",
  "sauna",
  "ev",
  "security",
] as const;

interface UploadedImage {
  url: string;
  path: string; // bucket path, null for pre-existing remote URLs
  isMain: boolean;
}

interface PropertyForm {
  title: string;
  price: string;
  status: string;
  type: string;
  description: string;
  location: string;
  latitude: string;
  longitude: string;
  slug: string;
  tag: string;
  area: string;
  year_built: string;
  beds: number;
  baths: number;
  parking: number;
  is_featured: boolean;
  is_active: boolean;
  amenities: string[];
  agent_id: string;
  currency: string;
}

const defaultForm: PropertyForm = {
  title: "",
  price: "",
  status: "for-sale",
  type: "apartment",
  description: "",
  location: "",
  latitude: "",
  longitude: "",
  slug: "",
  tag: "",
  area: "",
  year_built: "",
  beds: 1,
  baths: 1,
  parking: 0,
  is_featured: false,
  is_active: true,
  amenities: [],
  agent_id: "",
  currency: 'USD',
};

export default function PropertyFormPage(props: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const params = use(props.params);
  const lang = params.lang as Locale;
  const id = params.id; // "new" | uuid
  const isNew = id === "new";

  const router = useRouter();
  const [dict, setDict] = useState<any>(null);
  const [form, setForm] = useState<PropertyForm>(defaultForm);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [geocoding, setGeocoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Agents/brokers list for assignment
  interface AgentOption {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: string | null;
  }
  const [agents, setAgents] = useState<AgentOption[]>([]);

  // ── Load dictionary ──────────────────────────────────────────────────────────
  useEffect(() => {
    getDictionary(lang).then(setDict);
    // Fetch current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase
          .from("profiles")
          .select("id, role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setCurrentUser({ id: data.id, role: data.role });
              if (isNew && data.role !== 'admin') {
                setField("agent_id", data.id);
              }
            }
          });
      }
    });

    // Fetch agents/brokers for the assignment dropdown
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role")
      .in("role", ["admin", "broker", "agent"])
      .then(({ data }) => {
        if (data) setAgents(data);
      });
  }, [lang, isNew]);

  // ── Load existing property for edit ─────────────────────────────────────────
  useEffect(() => {
    if (isNew || !dict) return;
    async function load() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error || !data) return;

      // Ownership check
      if (currentUser && currentUser.role !== 'admin' && data.agent_id !== currentUser.id) {
        console.error("Unauthorized access to property");
        router.push(`/${lang}/admin/properties`);
        return;
      }

      setForm({
        title: data.title ?? "",
        price: data.price?.toString() ?? "",
        status: data.status ?? "for-sale",
        type: data.type ?? "apartment",
        description: data.description ?? "",
        location: data.location ?? "",
        latitude: data.latitude?.toString() ?? "",
        longitude: data.longitude?.toString() ?? "",
        slug: data.slug ?? "",
        tag: data.tag ?? "",
        area: data.area?.toString() ?? "",
        year_built: data.year_built?.toString() ?? "",
        beds: data.beds ?? 1,
        baths: data.baths ?? 1,
        parking: data.parking ?? 0,
        is_featured: data.is_featured ?? false,
        is_active: data.is_active ?? true,
        amenities: data.amenities ?? [],
        agent_id: data.agent_id ?? "",
        currency: data.currency ?? 'USD',
      });
      setCharCount((data.description ?? "").length);

      const existingImages: UploadedImage[] = (data.images ?? []).map(
        (url: string, i: number) => ({ url, path: "", isMain: i === 0 })
      );
      setImages(existingImages);
    }
    if (currentUser) load();
  }, [id, isNew, dict, currentUser, lang, router]);

  // ── Reverse Geocoding Logic ──────────────────────────────────────────────────
  useEffect(() => {
    const lat = parseFloat(form.latitude);
    const lon = parseFloat(form.longitude);

    if (isNaN(lat) || isNaN(lon)) return;

    const timer = setTimeout(async () => {
      setGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "LuxeEstate-Admin-Panel",
            },
          }
        );
        const data = await res.json();
        if (data && data.display_name) {
          setField("location", data.display_name);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setGeocoding(false);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [form.latitude, form.longitude]);

  // ── Toast auto-dismiss ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Field helpers ─────────────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const toggleAmenity = (key: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }));
  };

  const adjustCounter = (
    field: "beds" | "baths" | "parking",
    delta: number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: Math.max(0, prev[field] + delta),
    }));
  };

  // ── Image upload ──────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push({ url: pub.publicUrl, path, isMain: false });
      }
      setImages((prev) => {
        const next = [...prev, ...uploaded];
        if (next.length > 0 && !next.some((i) => i.isMain)) {
          next[0] = { ...next[0], isMain: true };
        }
        return next;
      });
    } catch {
      setToast({ type: "error", msg: dict?.admin?.properties?.upload_error ?? "Upload error." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (idx: number) => {
    const img = images[idx];
    if (img.path) {
      await supabase.storage.from(BUCKET).remove([img.path]);
    }
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((i) => i.isMain)) {
        next[0] = { ...next[0], isMain: true };
      }
      return next;
    });
  };

  const handleSetMain = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isMain: i === idx }))
    );
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // 1. Generate core slug from user input or title
    let baseSlug = (form.slug || "").trim() || (form.title || "").trim();
    baseSlug = baseSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, "");    // trim leading/trailing hyphens

    if (!baseSlug) baseSlug = "prop";

    // 2. Ensure uniqueness in database
    let uniqueSlug = baseSlug;
    try {
      const { data: existing } = await supabase
        .from("properties")
        .select("slug")
        .ilike("slug", `${baseSlug}%`)
        .neq("id", isNew ? "00000000-0000-0000-0000-000000000000" : id);

      if (existing && existing.length > 0) {
        const existingSlugs = new Set(existing.map((e) => e.slug));
        let counter = 1;
        while (existingSlugs.has(uniqueSlug)) {
          uniqueSlug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
    } catch (err) {
      console.warn("Could not check slug uniqueness", err);
    }

    // Sort images so main comes first
    const sorted = [...images].sort((a, b) =>
      a.isMain ? -1 : b.isMain ? 1 : 0
    );
    const imageUrls = sorted.map((i) => i.url);

    const payload = {
      title: form.title,
      price: parseFloat(form.price) || 0,
      status: form.status,
      type: form.type,
      description: form.description,
      location: form.location,
      latitude: parseFloat(form.latitude) || null,
      longitude: parseFloat(form.longitude) || null,
      slug: uniqueSlug,
      tag: form.tag || null,
      area: parseFloat(form.area) || 0,
      year_built: parseInt(form.year_built) || null,
      beds: form.beds,
      baths: form.baths,
      parking: form.parking,
      is_featured: form.is_featured,
      is_active: form.is_active,
      amenities: form.amenities,
      images: imageUrls,
      agent_id: form.agent_id || null,
      currency: form.currency,
    };

    let error;
    if (isNew) {
      const res = await supabase.from("properties").insert({ ...payload, id: crypto.randomUUID() });
      error = res.error;
    } else {
      const res = await supabase.from("properties").update(payload).eq("id", id);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      setToast({ type: "error", msg: dict?.admin?.properties?.save_error ?? "Save error." });
    } else {
      setToast({ type: "success", msg: dict?.admin?.properties?.saved_success ?? "Saved!" });
      setTimeout(() => router.push(`/${lang}/admin/properties`), 1500);
    }
  };

  if (!dict || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mosque" />
      </div>
    );
  }

  const t = dict.admin.properties;
  const breadcrumbLabel = isNew ? t.breadcrumb_new : t.breadcrumb_edit;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-sm font-medium font-sf-pro transition-all animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-mosque text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <span className="material-icons text-lg">
            {toast.type === "success" ? "check_circle" : "error_outline"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium font-sf-pro">
              <li>
                <Link
                  href={`/${lang}/admin/properties`}
                  className="hover:text-mosque transition-colors"
                >
                  {t.breadcrumb_list}
                </Link>
              </li>
              <li>
                <span className="material-icons text-xs text-gray-400">
                  chevron_right
                </span>
              </li>
              <li aria-current="page" className="text-nordic">
                {breadcrumbLabel}
              </li>
            </ol>
          </nav>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-nordic tracking-tight mb-2">
              {isNew ? t.new_title : t.edit_title}
            </h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal font-sf-pro">
              {isNew ? t.new_subtitle : t.edit_subtitle}
            </p>
          </div>
        </div>

        {/* Action buttons - desktop */}
        <div className="hidden md:flex gap-3">
          <Link
            href={`/${lang}/admin/properties`}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-nordic hover:bg-gray-50 transition-colors font-medium font-sf-pro text-sm"
          >
            {t.cancel}
          </Link>
          <button
            form="property-form"
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-sf-pro text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <span className="material-icons text-sm">save</span>
                {t.save_property}
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <form
        id="property-form"
        onSubmit={handleSave}
        className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
      >
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="xl:col-span-8 space-y-8">
          {/* Basic Information */}
          <FormCard
            icon="info"
            title={t.basic_info}
          >
            <div className="p-8 space-y-6">
              {/* Title */}
              <div>
                <label
                  className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                  htmlFor="prop-title"
                >
                  {t.property_title}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="prop-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder={t.title_placeholder}
                  className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro outline-none"
                />
              </div>

              {/* Price + Status + Type */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                      htmlFor="prop-price"
                    >
                      {t.price} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sf-pro text-sm">
                        {getCurrencyByCode(form.currency).symbol}
                      </span>
                      <input
                        id="prop-price"
                        type="number"
                        min="0"
                        required
                        value={form.price}
                        onChange={(e) => setField("price", e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-medium font-sf-pro outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                      htmlFor="prop-currency"
                    >
                      {lang === 'es' ? 'Moneda' : 'Currency'}
                    </label>
                    <select
                      id="prop-currency"
                      value={form.currency}
                      onChange={(e) => setField("currency", e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer outline-none font-bold"
                    >
                      {SUPPORTED_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                      ))}
                    </select>
                  </div>

                <div>
                  <label
                    className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                    htmlFor="prop-status"
                  >
                    {t.status}
                  </label>
                  <select
                    id="prop-status"
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer outline-none"
                  >
                    <option value="for-sale">{t.status_for_sale}</option>
                    <option value="for-rent">{t.status_for_rent}</option>
                    <option value="sold">{t.status_sold}</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                    htmlFor="prop-type"
                  >
                    {t.type}
                  </label>
                  <select
                    id="prop-type"
                    value={form.type}
                    onChange={(e) => setField("type", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer outline-none"
                  >
                    <option value="apartment">{t.type_apartment}</option>
                    <option value="house">{t.type_house}</option>
                    <option value="villa">{t.type_villa}</option>
                    <option value="penthouse">{t.type_penthouse}</option>
                    <option value="commercial">{t.type_commercial}</option>
                  </select>
                </div>
              </div>

              {/* Tag */}
              <div>
                <label
                  className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                  htmlFor="prop-tag"
                >
                  {t.tag}
                </label>
                <input
                  id="prop-tag"
                  type="text"
                  value={form.tag}
                  onChange={(e) => setField("tag", e.target.value)}
                  placeholder={t.tag_placeholder}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro outline-none"
                />
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setField("is_featured", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-checked:bg-mosque rounded-full transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-medium text-nordic font-sf-pro group-hover:text-mosque transition-colors">
                  {t.featured}
                </span>
              </label>
            </div>
          </FormCard>

          {/* Description */}
          <FormCard icon="description" title={t.description_section}>
            <div className="p-8">
              <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    const ta = descRef.current;
                    if (!ta) return;
                    const { selectionStart: s, selectionEnd: e, value: v } = ta;
                    const newVal =
                      v.slice(0, s) + "**" + v.slice(s, e) + "**" + v.slice(e);
                    setField("description", newVal);
                    setCharCount(newVal.length);
                  }}
                  className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                  title="Bold"
                >
                  <span className="material-icons text-lg">format_bold</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ta = descRef.current;
                    if (!ta) return;
                    const { selectionStart: s, selectionEnd: e, value: v } = ta;
                    const newVal =
                      v.slice(0, s) + "_" + v.slice(s, e) + "_" + v.slice(e);
                    setField("description", newVal);
                    setCharCount(newVal.length);
                  }}
                  className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                  title="Italic"
                >
                  <span className="material-icons text-lg">format_italic</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ta = descRef.current;
                    if (!ta) return;
                    const { selectionStart: s, value: v } = ta;
                    const newVal = v.slice(0, s) + "\n• " + v.slice(s);
                    setField("description", newVal);
                    setCharCount(newVal.length);
                  }}
                  className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                  title="Bullet"
                >
                  <span className="material-icons text-lg">
                    format_list_bulleted
                  </span>
                </button>
              </div>
              <textarea
                ref={descRef}
                id="prop-description"
                value={form.description}
                onChange={(e) => {
                  setField("description", e.target.value);
                  setCharCount(e.target.value.length);
                }}
                maxLength={2000}
                placeholder={t.description_placeholder}
                className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro leading-relaxed resize-y min-h-[200px] outline-none"
              />
              <div className="mt-2 text-right text-xs text-gray-400 font-sf-pro">
                {charCount} / 2000
              </div>
            </div>
          </FormCard>

          {/* Gallery */}
          <FormCard
            icon="image"
            title={t.gallery_section}
            badge="JPG, PNG, WEBP"
          >
            <div className="p-8">
              {/* Drop zone */}
              <div
                className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-10 text-center hover:bg-hint-green/10 hover:border-mosque/40 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
                    {uploading ? (
                      <span className="w-6 h-6 border-2 border-mosque/30 border-t-mosque rounded-full animate-spin" />
                    ) : (
                      <span className="material-icons text-2xl">
                        cloud_upload
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-nordic font-sf-pro">
                      {uploading ? t.uploading : t.upload_label}
                    </p>
                    <p className="text-xs text-gray-400 font-sf-pro">
                      {t.upload_hint}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg overflow-hidden relative group shadow-sm"
                    >
                      <Image
                        src={img.url}
                        alt={`Property image ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="150px"
                      />
                      <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                        {!img.isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMain(idx)}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-white text-nordic hover:bg-hint-green transition-colors font-sf-pro uppercase tracking-wide"
                          >
                            {t.set_main}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(idx)}
                          className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </div>
                      {img.isMain && (
                        <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm font-sf-pro uppercase tracking-wider">
                          Main
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-mosque hover:border-mosque hover:bg-hint-green/20 transition-all group"
                  >
                    <span className="material-icons group-hover:scale-110 transition-transform">
                      add
                    </span>
                    <span className="text-xs mt-1 font-medium font-sf-pro">
                      Add More
                    </span>
                  </button>
                </div>
              )}
            </div>
          </FormCard>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="xl:col-span-4 space-y-8">
          {/* Location */}
          <FormCard icon="place" title={t.location_section} small>
            <div className="p-6 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                  htmlFor="prop-location"
                >
                  {t.address}
                </label>
                <input
                  id="prop-location"
                  type="text"
                  value={geocoding ? (dict?.admin?.properties?.geocoding || "Obteniendo dirección...") : form.location}
                  readOnly
                  placeholder={t.address_placeholder}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-nordic placeholder-gray-400 cursor-not-allowed text-sm font-sf-pro outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-medium text-gray-500 mb-1.5 font-sf-pro"
                    htmlFor="prop-lat"
                  >
                    {t.latitude}
                  </label>
                  <input
                    id="prop-lat"
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setField("latitude", e.target.value)}
                    placeholder={t.latitude_placeholder}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro outline-none"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium text-gray-500 mb-1.5 font-sf-pro"
                    htmlFor="prop-lng"
                  >
                    {t.longitude}
                  </label>
                  <input
                    id="prop-lng"
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setField("longitude", e.target.value)}
                    placeholder={t.longitude_placeholder}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro outline-none"
                  />
                </div>
              </div>

              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Map 
                  locationText={form.location} 
                  latitude={parseFloat(form.latitude) || undefined}
                  longitude={parseFloat(form.longitude) || undefined}
                />
              </div>
            </div>
          </FormCard>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">straighten</span>
              </div>
              <h2 className="text-lg font-bold text-nordic">{t.details_section}</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Area + Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block"
                    htmlFor="prop-area"
                  >
                    {t.area}
                  </label>
                  <input
                    id="prop-area"
                    type="number"
                    min="0"
                    value={form.area}
                    onChange={(e) => setField("area", e.target.value)}
                    placeholder="0"
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro text-sm outline-none"
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block"
                    htmlFor="prop-year"
                  >
                    {t.year_built}
                  </label>
                  <input
                    id="prop-year"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={form.year_built}
                    onChange={(e) => setField("year_built", e.target.value)}
                    placeholder="YYYY"
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro text-sm outline-none"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Counters */}
              <div className="space-y-4">
                <CounterRow
                  icon="bed"
                  label={t.bedrooms}
                  value={form.beds}
                  onDecrement={() => adjustCounter("beds", -1)}
                  onIncrement={() => adjustCounter("beds", 1)}
                />
                <CounterRow
                  icon="shower"
                  label={t.bathrooms}
                  value={form.baths}
                  onDecrement={() => adjustCounter("baths", -1)}
                  onIncrement={() => adjustCounter("baths", 1)}
                />
                <CounterRow
                  icon="directions_car"
                  label={t.parking}
                  value={form.parking}
                  onDecrement={() => adjustCounter("parking", -1)}
                  onIncrement={() => adjustCounter("parking", 1)}
                />
              </div>

              <hr className="border-gray-100" />

              {/* Amenities */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 font-sf-pro">
                  {t.amenities_section}
                </h3>
                <div className="space-y-2">
                  {AMENITIES_KEYS.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={form.amenities.includes(key)}
                        onChange={() => toggleAmenity(key)}
                        className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque accent-mosque"
                      />
                      <span className="text-sm text-gray-700 font-sf-pro group-hover:text-nordic transition-colors">
                        {t[`amenity_${key}` as keyof typeof t] ?? key}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Agent */}
          <FormCard icon="person" title={t.assigned_agent || "Agente Asignado"} small>
            <div className="p-6 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro"
                  htmlFor="prop-agent"
                >
                  {t.assigned_agent || "Agente / Broker Responsable"}
                </label>
                <select
                  id="prop-agent"
                  value={form.agent_id}
                  onChange={(e) => setField("agent_id", e.target.value)}
                  disabled={currentUser?.role !== "admin"}
                  className={`w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro outline-none ${
                    currentUser?.role !== "admin"
                      ? "bg-gray-50 cursor-not-allowed opacity-80"
                      : "cursor-pointer"
                  }`}
                >
                  <option value="">{t.select_agent || "— Seleccionar agente —"}</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name || a.email} ({a.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview of selected agent */}
              {form.agent_id && (() => {
                const selected = agents.find((a) => a.id === form.agent_id);
                if (!selected) return null;
                return (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-hint-green/20 border border-mosque/10">
                    <img
                      src={selected.avatar_url || getAvatarFallback(selected.full_name)}
                      alt={selected.full_name || "Agent"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(selected.full_name); }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-nordic truncate">{selected.full_name || "Sin nombre"}</p>
                      <p className="text-xs text-gray-500 truncate">{selected.email}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-mosque/10 text-mosque px-2 py-0.5 rounded">
                      {selected.role}
                    </span>
                  </div>
                );
              })()}
            </div>
          </FormCard>
        </div>
      </form>

      {/* Mobile sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
        <Link
          href={`/${lang}/admin/properties`}
          className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-nordic font-medium font-sf-pro text-center"
        >
          {t.cancel}
        </Link>
        <button
          form="property-form"
          type="submit"
          disabled={saving}
          className="flex-1 py-3 rounded-lg bg-mosque text-white font-medium font-sf-pro flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-icons text-sm">save</span>
          )}
          {saving ? t.saving : t.save_property}
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FormCard({
  icon,
  title,
  badge,
  small = false,
  children,
}: {
  icon: string;
  title: string;
  badge?: string;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className={`${
          small ? "px-6 py-4" : "px-8 py-6"
        } border-b border-hint-green/30 flex items-center justify-between bg-gradient-to-r from-hint-green/10 to-transparent`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
            <span className="material-icons text-lg">{icon}</span>
          </div>
          <h2
            className={`${
              small ? "text-lg" : "text-xl"
            } font-bold text-nordic`}
          >
            {title}
          </h2>
        </div>
        {badge && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded font-sf-pro">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function CounterRow({
  icon,
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  icon: string;
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-nordic font-sf-pro flex items-center gap-2">
        <span className="material-icons text-gray-400 text-sm">{icon}</span>
        {label}
      </label>
      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={onDecrement}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100"
        >
          −
        </button>
        <span className="w-10 text-center text-nordic text-sm font-medium font-sf-pro select-none">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100"
        >
          +
        </button>
      </div>
    </div>
  );
}

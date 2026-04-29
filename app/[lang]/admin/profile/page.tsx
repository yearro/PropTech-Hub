"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAvatarFallback } from "@/utils/avatarFallback";

export default function ProfilePage(props: { params: Promise<{ lang: string }> }) {
  const params = use(props.params);
  const lang = params.lang as Locale;
  const router = useRouter();

  const [dict, setDict] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    countryCode: "+52",
    phoneNumber: "",
    avatar_url: "",
  });

  useEffect(() => {
    getDictionary(lang).then(setDict);
    
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${lang}/login`);
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setProfile(profile);
        
        // Parse phone
        let countryCode = "+52";
        let phoneNumber = "";
        if (profile.phone) {
          const match = profile.phone.match(/^(\+\d{1,3})\s+(.*)$/);
          if (match) {
            countryCode = match[1];
            phoneNumber = match[2];
          } else {
            phoneNumber = profile.phone;
          }
        }

        setFormData({
          full_name: profile.full_name || "",
          email: profile.email || user.email || "",
          countryCode,
          phoneNumber,
          avatar_url: profile.avatar_url || "",
        });
      }
      setLoading(false);
    };

    fetchUserData();
  }, [lang, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const phone = formData.phoneNumber
        ? `${formData.countryCode} ${formData.phoneNumber.trim()}`
        : null;

      // Update profile info directly from client to use browser session for RLS
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone,
          avatar_url: formData.avatar_url,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage({ type: "success", text: dict.admin.profile.success });
      router.refresh();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setMessage({ type: "error", text: dict.admin.profile.error });
    } finally {
      setSaving(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: lang === 'es' ? "La imagen es demasiado grande (máx 2MB)" : "Image is too large (max 2MB)" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      setImgError(false);
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setMessage({ type: "error", text: lang === 'es' ? "Error al subir la imagen" : "Error uploading image" });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !dict) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mosque" />
      </div>
    );
  }

  const t = dict.admin.profile;
  const avatarSrc = imgError || !formData.avatar_url
    ? getAvatarFallback(formData.full_name || user?.email)
    : formData.avatar_url;

  const countryCodes = [
    { code: "+1", label: "+1 (US/CA)" },
    { code: "+34", label: "+34 (ES)" },
    { code: "+52", label: "+52 (MX)" },
    { code: "+54", label: "+54 (AR)" },
    { code: "+56", label: "+56 (CL)" },
    { code: "+57", label: "+57 (CO)" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-white mb-2">{t.title}</h1>
        <p className="text-nordic-dark/60 dark:text-gray-400">{t.subtitle}</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          <span className="material-icons">{message.type === "success" ? "check_circle" : "error"}</span>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-white dark:bg-[#1a3833] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-mosque/20">
          <h2 className="text-lg font-bold text-nordic-dark dark:text-white mb-6 flex items-center gap-2">
            <span className="material-icons text-mosque">account_circle</span>
            {t.avatar}
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-mosque/40 shadow-xl relative bg-gray-100">
                <Image
                  alt={formData.full_name || 'User'}
                  src={avatarSrc}
                  fill
                  className="object-cover"
                  sizes="128px"
                  onError={() => setImgError(true)}
                  unoptimized
                />
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <span className="material-icons text-white text-3xl">photo_camera</span>
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-mosque text-white rounded-xl text-sm font-semibold hover:bg-mosque-dark transition-colors disabled:opacity-50"
                  >
                    <span className="material-icons text-lg">{isUploading ? 'sync' : 'upload'}</span>
                    {isUploading ? t.uploading_img : t.upload}
                  </button>
                </div>

                <div className="relative pt-2">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-100 dark:border-mosque/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-[#1a3833] px-2 text-nordic-dark/40 dark:text-gray-500 font-medium">
                      {t.url_hint}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
                    {t.url_label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-lg">link</span>
                    <input
                      type="url"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner text-sm"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar_url}
                      onChange={(e) => {
                        setFormData({ ...formData, avatar_url: e.target.value });
                        setImgError(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="bg-white dark:bg-[#1a3833] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-mosque/20">
          <h2 className="text-lg font-bold text-nordic-dark dark:text-white mb-6 flex items-center gap-2">
            <span className="material-icons text-mosque">person</span>
            {t.personal_info}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
                {t.full_name}
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
                {t.email}
              </label>
              <input
                disabled
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-100 dark:border-mosque/20 outline-none text-nordic-dark/50 dark:text-gray-500 cursor-not-allowed"
                value={formData.email}
              />
              <p className="mt-1 text-[10px] text-nordic-dark/40 dark:text-gray-600">El correo no se puede cambiar directamente.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
                {t.phone}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="px-3 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner appearance-none cursor-pointer min-w-[max-content]"
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner"
                  placeholder="(555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 rounded-xl bg-mosque text-white font-bold shadow-lg shadow-mosque/30 hover:shadow-mosque/40 transform active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t.saving}
              </>
            ) : (
              <>
                <span className="material-icons">save</span>
                {t.save_changes}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string }>;
}) {
  const params = use(paramsPromise);
  const lang = params.lang as Locale;
  const router = useRouter();
  
  const [dict, setDict] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [navbarTitle, setNavbarTitle] = useState<string>("LuxeEstate");
  const [systemTitle, setSystemTitle] = useState<string>("LuxeEstate - Premium Real Estate");
  const [logoIcon, setLogoIcon] = useState<string>("apartment");

  useEffect(() => {
    getDictionary(lang).then(setDict);
    
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");
      
      if (data) {
        data.forEach(setting => {
          if (setting.key === "theme") {
            setCurrentTheme(setting.value);
            document.documentElement.setAttribute("data-theme", setting.value);
          }
          if (setting.key === "navbar_title") setNavbarTitle(setting.value);
          if (setting.key === "system_title") setSystemTitle(setting.value);
          if (setting.key === "logo_icon") setLogoIcon(setting.value);
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, [lang]);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const updates = [
        { key: "navbar_title", value: navbarTitle },
        { key: "system_title", value: systemTitle },
        { key: "logo_icon", value: logoIcon }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(update, { onConflict: "key" });
        if (error) throw error;
      }

      setMessage({ type: "success", text: dict.admin.settings.success });
      setTimeout(() => setMessage(null), 3000);
      router.refresh();
    } catch (err) {
      console.error("Error saving branding:", err);
      setMessage({ type: "error", text: dict.admin.settings.error });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = async (themeId: string) => {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "theme", value: themeId }, { onConflict: "key" });

      if (error) throw error;

      setCurrentTheme(themeId);
      document.documentElement.setAttribute("data-theme", themeId);
      setMessage({ type: "success", text: dict.admin.settings.success });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error saving theme:", err);
      setMessage({ type: "error", text: dict.admin.settings.error });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !dict) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mosque"></div>
      </div>
    );
  }

  const themes = [
    {
      id: "default",
      name: dict.admin.themes.nordic.name,
      description: dict.admin.themes.nordic.description,
      preview: "bg-[#EEF6F6]",
      colors: ["#006655", "#06f9d0", "#19322F"]
    },
    {
      id: "midnight",
      name: dict.admin.themes.midnight.name,
      description: dict.admin.themes.midnight.description,
      preview: "bg-[#121212]",
      colors: ["#C5A059", "#D4AF37", "#FFFFFF"]
    },
    {
      id: "tuscan",
      name: dict.admin.themes.tuscan.name,
      description: dict.admin.themes.tuscan.description,
      preview: "bg-[#FFF8E1]",
      colors: ["#D35400", "#F39C12", "#2C3E50"]
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-white mb-2">
          {dict.admin.settings.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {dict.admin.settings.subtitle}
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-200 border ${
          message.type === "success" 
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        }`}>
          <span className="material-icons">{message.type === "success" ? "check_circle" : "error"}</span>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branding Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1a3a35] p-6 rounded-2xl shadow-sm border border-mosque/10">
            <h2 className="text-lg font-bold text-nordic-dark dark:text-white mb-6 flex items-center gap-2">
              <span className="material-icons text-mosque">branding_watermark</span>
              {dict.admin.settings.branding_section}
            </h2>
            
            <form onSubmit={handleSaveBranding} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {dict.admin.settings.navbar_title}
                </label>
                <input
                  type="text"
                  value={navbarTitle}
                  onChange={(e) => setNavbarTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-mosque/20 bg-gray-50 dark:bg-[#152e2a] text-nordic-dark dark:text-white focus:ring-2 focus:ring-mosque focus:border-transparent outline-none transition-all"
                  placeholder="LuxeEstate"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {dict.admin.settings.system_title}
                </label>
                <input
                  type="text"
                  value={systemTitle}
                  onChange={(e) => setSystemTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-mosque/20 bg-gray-50 dark:bg-[#152e2a] text-nordic-dark dark:text-white focus:ring-2 focus:ring-mosque focus:border-transparent outline-none transition-all"
                  placeholder="LuxeEstate - Premium Real Estate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {dict.admin.settings.logo_section}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {["apartment", "location_city", "villa", "house", "real_estate_agent", "domain", "holiday_village", "account_balance"].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setLogoIcon(icon)}
                      className={`h-12 rounded-xl flex items-center justify-center transition-all ${
                        logoIcon === icon
                          ? "bg-mosque text-white shadow-lg ring-2 ring-mosque/20"
                          : "bg-gray-50 dark:bg-[#152e2a] text-nordic-dark/40 dark:text-gray-500 hover:bg-mosque/5 hover:text-mosque"
                      }`}
                    >
                      <span className="material-icons">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-4 py-3 bg-mosque text-white rounded-xl font-bold hover:bg-mosque-dark transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {dict.admin.settings.saving}
                  </>
                ) : (
                  <>
                    <span className="material-icons text-lg">save</span>
                    {dict.admin.settings.save}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="lg:col-span-2">
          <div className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-mosque/5">
            <h2 className="text-lg font-bold text-nordic-dark dark:text-white mb-6 flex items-center gap-2">
              <span className="material-icons text-mosque">palette</span>
              {dict.admin.settings.themes_section}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <div 
                  key={theme.id}
                  className={`relative rounded-xl border-2 p-5 transition-all cursor-pointer group ${
                    currentTheme === theme.id 
                      ? "border-mosque bg-white dark:bg-[#1a3a35] shadow-md" 
                      : "border-transparent bg-white dark:bg-white/5 hover:border-mosque/20"
                  }`}
                  onClick={() => handleApplyTheme(theme.id)}
                >
                  {currentTheme === theme.id && (
                    <div className="absolute top-3 right-3 bg-mosque text-white rounded-full p-0.5 shadow-sm">
                      <span className="material-icons text-[12px]">check</span>
                    </div>
                  )}

                  <div className={`w-full h-24 rounded-lg mb-4 overflow-hidden shadow-inner ${theme.preview} relative border border-black/5`}>
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                          {theme.colors.map((color, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }}></div>
                          ))}
                      </div>
                  </div>

                  <h3 className="text-base font-bold text-nordic-dark dark:text-white mb-1">
                    {theme.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                    {theme.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function ThemesPage({
  params: paramsPromise,
}: {
  params: Promise<{ lang: string }>;
}) {
  const params = use(paramsPromise);
  const lang = params.lang as Locale;
  const router = useRouter();
  
  const [dict, setDict] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
    
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "theme")
        .single();
      
      if (data) {
        setCurrentTheme(data.value);
        // Also apply it to the document for preview
        document.documentElement.setAttribute("data-theme", data.value);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [lang]);

  const handleApplyTheme = async (themeId: string) => {
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "theme", value: themeId }, { onConflict: "key" });

      if (error) throw error;

      setCurrentTheme(themeId);
      document.documentElement.setAttribute("data-theme", themeId);
      setMessage({ type: "success", text: dict.admin.themes.success });
      
      // Auto-hide message
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error saving theme:", err);
      setMessage({ type: "error", text: dict.admin.themes.error });
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-white mb-2">
          {dict.admin.themes.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {dict.admin.themes.subtitle}
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" 
            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        }`}>
          <span className="material-icons">{message.type === "success" ? "check_circle" : "error"}</span>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div 
            key={theme.id}
            className={`relative rounded-2xl border-2 p-6 transition-all cursor-pointer group ${
              currentTheme === theme.id 
                ? "border-mosque bg-white dark:bg-[#1a3a35] shadow-xl ring-4 ring-mosque/10" 
                : "border-transparent bg-white/50 dark:bg-white/5 hover:border-mosque/30 hover:bg-white dark:hover:bg-white/10"
            }`}
            onClick={() => handleApplyTheme(theme.id)}
          >
            {currentTheme === theme.id && (
              <div className="absolute top-4 right-4 bg-mosque text-white rounded-full p-1 shadow-md">
                <span className="material-icons text-sm">check</span>
              </div>
            )}

            <div className={`w-full aspect-video rounded-lg mb-6 overflow-hidden shadow-inner ${theme.preview} relative border border-black/5`}>
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                    {theme.colors.map((color, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }}></div>
                    ))}
                </div>
            </div>

            <h3 className="text-xl font-bold text-nordic-dark dark:text-white mb-2">
              {theme.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              {theme.description}
            </p>

            <button
              disabled={saving || currentTheme === theme.id}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                currentTheme === theme.id
                  ? "bg-mosque/10 text-mosque cursor-default"
                  : "bg-mosque text-white hover:bg-mosque-dark shadow-md hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {saving && currentTheme === theme.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {dict.admin.themes.applying}
                </>
              ) : (
                <>
                  <span className="material-icons text-lg">{currentTheme === theme.id ? "done" : "palette"}</span>
                  {currentTheme === theme.id ? dict.admin.nav.favorites.replace('Favorites', 'Active') : dict.admin.themes.apply}
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

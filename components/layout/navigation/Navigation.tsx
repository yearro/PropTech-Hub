"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { LanguageSelector } from "./LanguageSelector";
import { Locale } from "@/lib/i18n/config";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { getAvatarFallback } from "@/utils/avatarFallback";

interface NavigationProps {
  dict: {
    login: string;
    user_menu: {
      profile: string;
      settings: string;
      admin_dashboard: string;
      admin_properties: string;
      admin_users: string;
      favorites: string;
      sign_out: string;
    };
  };
  lang: Locale;
}

export function Navigation({ dict, lang }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [navbarTitle, setNavbarTitle] = useState("LuxeEstate");
  const [logoIcon, setLogoIcon] = useState("apartment");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const fetchPendingCount = async (userId: string, userRole: string) => {
    // Only Agents and Brokers receive notification badges for their appointments
    if (userRole === "admin" || userRole === "viewer") {
      setPendingCount(0);
      return;
    }

    const { count } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("agent_id", userId);

    setPendingCount(count || 0);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            const userRole = data?.role ?? 'viewer';
            setRole(userRole);
            fetchPendingCount(session.user.id, userRole);
          });
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            const userRole = data?.role ?? 'viewer';
            setRole(userRole);
            fetchPendingCount(session.user.id, userRole);
          });
      } else {
        setRole(null);
        setPendingCount(0);
      }
    });

    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["navbar_title", "logo_icon"])
      .then(({ data }) => {
        if (data) {
          data.forEach(setting => {
            if (setting.key === "navbar_title") setNavbarTitle(setting.value);
            if (setting.key === "logo_icon") setLogoIcon(setting.value);
          });
        }
        setSettingsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname.includes(`/${lang}/admin`)) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${lang}`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center relative overflow-hidden">
              {settingsLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-icons text-white text-lg animate-in fade-in duration-300">{logoIcon}</span>
              )}
            </div>
            <div className={`transition-all duration-300 ${settingsLoading ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'}`}>
              <span className="text-xl font-semibold tracking-tight text-nordic-dark">
                {navbarTitle}
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden sm:block">
              <LanguageSelector currentLang={lang} />
            </div>
            
            {pendingCount > 0 ? (
              <Link 
                href={`/${lang}/admin/appointments`}
                className="text-nordic-dark hover:text-mosque transition-colors relative flex items-center"
              >
                <span className="material-icons">notifications_none</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background-light flex items-center justify-center animate-bounce">
                  {pendingCount}
                </span>
              </Link>
            ) : (
              <div className="text-nordic-dark/30 cursor-not-allowed flex items-center" title="No pending notifications">
                <span className="material-icons">notifications_none</span>
              </div>
            )}
            
            {user ? (
              <div className="relative border-l border-nordic-dark/10 ml-2 pl-2">
                <button 
                  className="flex items-center gap-2 group focus:outline-none" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-mosque transition-all relative">
                    {user.user_metadata?.avatar_url && !imgError ? (
                      <Image
                        alt="Profile Avatar"
                        className="object-cover"
                        src={user.user_metadata.avatar_url}
                        fill
                        sizes="40px"
                        unoptimized
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <img
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                        src={getAvatarFallback(user.user_metadata?.full_name || user.email)}
                      />
                    )}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white dark:bg-[#152e2a] shadow-xl border border-nordic-dark/10 dark:border-mosque/20 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-nordic-dark/5 dark:border-mosque/10">
                        <p className="text-sm font-semibold text-nordic-dark dark:text-white truncate">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs text-nordic-dark/50 dark:text-gray-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      
                      <Link 
                        href={`/${lang}/admin/profile`} 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-nordic-dark/80 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="material-icons text-lg">person_outline</span>
                        {dict.user_menu.profile}
                      </Link>
                      <Link 
                        href={`/${lang}/admin/favorites`} 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-nordic-dark/80 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="material-icons text-lg">favorite_outline</span>
                        {dict.user_menu.favorites}
                      </Link>
                      
                      {(role === "admin" || role === "agent" || role === "broker") && (
                        <>
                          <div className="px-4 py-1.5 text-[10px] font-bold text-mosque/40 uppercase tracking-widest">
                            {dict.user_menu.admin_dashboard}
                          </div>
                          {role === "admin" && (
                            <Link
                              href={`/${lang}/admin/settings`}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-mosque font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="material-icons text-lg">settings</span>
                              {dict.user_menu.settings}
                            </Link>
                          )}
                          <Link
                            href={`/${lang}/admin/properties`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-mosque font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span className="material-icons text-lg">house_siding</span>
                            {dict.user_menu.admin_properties}
                          </Link>
                          {role === "admin" && (
                            <Link
                              href={`/${lang}/admin/users`}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-mosque font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <span className="material-icons text-lg">group</span>
                              {dict.user_menu.admin_users}
                            </Link>
                          )}
                        </>
                      )}
                      
                      <div className="h-px bg-nordic-dark/5 dark:bg-mosque/10 my-1"></div>
                      
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" 
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setIsUserMenuOpen(false);
                          router.push(`/${lang}`);
                        }}
                      >
                        <span className="material-icons text-lg">logout</span>
                        {dict.user_menu.sign_out}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href={`/${lang}/login`} className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2">
                <button className="px-4 py-2 text-sm font-medium text-white bg-nordic-dark rounded-full hover:bg-mosque transition-colors">
                  {dict.login}
                </button>
              </Link>
            )}
            
            <button 
              className="md:hidden text-nordic-dark"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-icons">{isMobileMenuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'h-auto py-2' : 'h-0'}`}>
        <div className="px-4 space-y-1 pb-4">

          <div className="pt-4 px-3">
            <LanguageSelector currentLang={lang} />
          </div>
        </div>
      </div>
    </nav>
  );
}

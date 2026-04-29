"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Locale } from "@/lib/i18n/config";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { getAvatarFallback } from "@/utils/avatarFallback";

interface AdminNavProps {
  lang: Locale;
  dict: any;
}

export function AdminNav({ lang, dict }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoIcon, setLogoIcon] = useState("apartment");
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
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
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });


    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["logo_icon"])
      .single()
      .then(({ data }) => {
        if (data?.value) setLogoIcon(data.value);
        setSettingsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    router.push(`/${lang}`);
  };

  const navItems = [
    ...(profile?.role === "admin" || profile?.role === "agent" || profile?.role === "broker"
      ? [{ name: dict.admin.nav.properties, href: `/${lang}/admin/properties`, icon: "house_siding" }]
      : []),
    { name: dict.admin.nav.favorites, href: `/${lang}/admin/favorites`, icon: "favorite" },
    ...(profile?.role === "admin"
      ? [{ name: dict.admin.nav.users, href: `/${lang}/admin/users`, icon: "people" }]
      : []),
    ...(profile?.role === "admin"
      ? [{ name: dict.admin.settings.title, href: `/${lang}/admin/settings`, icon: "settings" }]
      : []),
    { name: dict.admin.nav.profile, href: `/${lang}/admin/profile`, icon: "person" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#152e2a] border-b border-mosque/10 dark:border-mosque/20 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href={`/${lang}`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded bg-mosque flex items-center justify-center text-white relative overflow-hidden">
                {settingsLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-icons text-lg animate-in fade-in duration-300">{logoIcon}</span>
                )}
              </div>
              <span className="font-bold text-xl tracking-tight text-nordic-dark dark:text-white">
                {dict.admin.nav.title}
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                        ? "border-mosque text-nordic-dark dark:text-white"
                        : "border-transparent text-gray-500 hover:text-mosque hover:border-mosque/30 dark:text-gray-400"
                      }`}
                  >
                    <span className="material-icons mr-2 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-mosque/5 transition-colors focus:outline-none ring-2 ring-transparent hover:ring-mosque/20"
              >
                <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white dark:ring-mosque/20 relative">
                  {user?.user_metadata?.avatar_url && !imgError ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <img
                      src={getAvatarFallback(user?.user_metadata?.full_name || user?.email)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
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
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#1a3a35] ring-1 ring-black ring-opacity-5 py-1 z-20 border border-mosque/10 dark:border-mosque/20">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-mosque/10 mb-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {dict.admin.nav.session}
                      </p>
                      <p className="text-sm font-medium text-nordic-dark dark:text-white truncate mt-1">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors gap-2"
                    >
                      <span className="material-icons text-lg">logout</span>
                      {dict.admin.nav.sign_out}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

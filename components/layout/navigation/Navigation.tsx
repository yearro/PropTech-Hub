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

interface NavigationProps {
  dict: {
    buy: string;
    rent: string;
    sell: string;
    saved: string;
    login: string;
    user_menu: {
      profile: string;
      settings: string;
      admin_dashboard: string;
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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setRole(data?.role ?? 'viewer'));
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
          .then(({ data }) => setRole(data?.role ?? 'viewer'));
      } else {
        setRole(null);
      }
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
            <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark">
              LuxeEstate
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all">
              {dict.buy}
            </Link>
            <Link href="#" className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all">
              {dict.rent}
            </Link>
            <Link href="#" className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all">
              {dict.sell}
            </Link>
            <Link href="#" className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all">
              {dict.saved}
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden sm:block">
              <LanguageSelector currentLang={lang} />
            </div>
            
            <button className="text-nordic-dark hover:text-mosque transition-colors">
              <span className="material-icons">search</span>
            </button>
            <button className="text-nordic-dark hover:text-mosque transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
            
            {user ? (
              <div className="relative border-l border-nordic-dark/10 ml-2 pl-2">
                <button 
                  className="flex items-center gap-2 group focus:outline-none" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-mosque transition-all relative">
                    <Image
                      alt="Profile Avatar"
                      className="object-cover"
                      src={user.user_metadata?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWXbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"}
                      fill
                      sizes="40px"
                    />
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
                        href="#" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-nordic-dark/80 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="material-icons text-lg">person_outline</span>
                        {dict.user_menu.profile}
                      </Link>
                      <Link 
                        href="#" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-nordic-dark/80 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="material-icons text-lg">settings</span>
                        {dict.user_menu.settings}
                      </Link>
                      
                      {role === 'admin' && (
                        <>
                          <div className="px-4 py-1.5 text-[10px] font-bold text-mosque/40 uppercase tracking-widest">
                            {dict.user_menu.admin_dashboard}
                          </div>
                          <Link 
                            href={`/${lang}/admin/properties`} 
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-mosque font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span className="material-icons text-lg">house_siding</span>
                            {dict.user_menu.admin_properties}
                          </Link>
                          <Link 
                            href={`/${lang}/admin/users`} 
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-mosque font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <span className="material-icons text-lg">group</span>
                            {dict.user_menu.admin_users}
                          </Link>
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
          <Link href="#" className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5">
            {dict.buy}
          </Link>
          <Link href="#" className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5">
            {dict.rent}
          </Link>
          <Link href="#" className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5">
            {dict.sell}
          </Link>
          <Link href="#" className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5">
            {dict.saved}
          </Link>
          <div className="pt-4 px-3">
            <LanguageSelector currentLang={lang} />
          </div>
        </div>
      </div>
    </nav>
  );
}

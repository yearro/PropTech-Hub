"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/i18n/config";

interface AdminNavProps {
  lang: Locale;
}

export function AdminNav({ lang }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: `/${lang}/admin/properties`, icon: "dashboard" },
    { name: "Users", href: `/${lang}/admin/users`, icon: "people" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#152e2a] border-b border-mosque/10 dark:border-mosque/20 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href={`/${lang}`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded bg-mosque flex items-center justify-center text-white font-bold text-lg">H</div>
              <span className="font-bold text-xl tracking-tight text-nordic-dark dark:text-white">Haven Admin</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => {
                const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
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
             <button className="p-2 rounded-full text-gray-400 hover:text-mosque hover:bg-mosque/5 transition-colors">
               <span className="material-icons text-xl">notifications_none</span>
             </button>
             <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white dark:ring-mosque/20 cursor-pointer">
               <div className="w-full h-full bg-mosque/10 flex items-center justify-center text-mosque">
                 <span className="material-icons">person</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

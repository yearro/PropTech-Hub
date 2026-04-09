"use client";

import { useTransition } from "react";
import { Locale, locales } from "@/lib/i18n/config";
import { setLocale } from "@/app/actions";
import { usePathname } from "next/navigation";

interface LanguageSelectorProps {
  currentLang: Locale;
}

export function LanguageSelector({ currentLang }: LanguageSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLang) return;

    // Construct the new path by replacing the locale segment
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");

    startTransition(async () => {
      await setLocale(newLocale, newPath);
    });
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-nordic-dark/5 rounded-full border border-nordic-dark/10">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          disabled={isPending}
          className={`text-xs font-semibold uppercase tracking-wider transition-all px-2 py-0.5 rounded-md ${
            currentLang === locale
              ? "bg-nordic-dark text-white shadow-sm"
              : "text-nordic-dark/50 hover:text-nordic-dark"
          } ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}

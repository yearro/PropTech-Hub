import type { Metadata } from "next";
import "./../globals.css";
import { Navigation } from "@/components/layout/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { supabase } from "@/utils/supabase";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  // Fetch system title for metadata
  const { data: titleData } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "system_title")
    .single();

  const systemTitle = titleData?.value || `LuxeEstate - ${lang === 'es' ? 'Bienes Raíces Premium' : 'Premium Real Estate'}`;
  
  return {
    title: systemTitle,
    description: dict.home.featured_subtitle,
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { children } = props;
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);

  // Fetch current theme
  const { data: themeData } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "theme")
    .single();
  
  const currentTheme = themeData?.value || "default";

  return (
    <html 
      lang={lang} 
      data-theme={currentTheme}
      className="h-full antialiased font-sans selection:bg-mosque selection:text-white" 
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background-light text-nordic-dark font-display" suppressHydrationWarning>
        <Navigation dict={{ ...dict.nav, user_menu: dict.user_menu }} lang={lang as Locale} />
        {children}
      </body>
    </html>
  );
}

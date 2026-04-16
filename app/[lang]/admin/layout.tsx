import { AdminNav } from "@/components/admin/AdminNav";
import { Locale } from "@/lib/i18n/config";
import { supabase } from "@/utils/supabase";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Role validation on the server
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${lang}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect(`/${lang}`);
  }

  return (
    <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f2320] flex flex-col">
      <AdminNav lang={lang as Locale} />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="mt-auto border-t border-gray-200 dark:border-mosque/20 bg-white dark:bg-[#152e2a] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} LuxeEstate Property Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

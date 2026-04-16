"use client";

import { AdminNav } from "@/components/admin/AdminNav";
import { Locale } from "@/lib/i18n/config";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

export default function AdminLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = use(paramsPromise);
  const lang = params.lang as Locale;
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Wait a small moment to ensure auth is hydrated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("[AdminLayout] No session found, redirecting...");
          if (mounted) router.push(`/${lang}/login`);
          return;
        }

        console.log("[AdminLayout] Session found for:", session.user.email);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("[AdminLayout] Error fetching profile:", profileError);
          if (mounted) setError("Could not verify your role.");
          return;
        }

        console.log("[AdminLayout] Profile role:", profile?.role);

        if (profile?.role !== 'admin') {
          console.log("[AdminLayout] Not an admin, redirecting...");
          if (mounted) router.push(`/${lang}`);
          return;
        }

        if (mounted) setIsAuthorized(true);
      } catch (err) {
        console.error("[AdminLayout] Unexpected error:", err);
        if (mounted) setError("An unexpected error occurred.");
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [lang, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-nordic-white flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <span className="material-icons text-red-500 text-5xl mb-4">error_outline</span>
          <h2 className="text-2xl font-bold text-nordic-dark mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-mosque text-white py-3 rounded-xl font-semibold hover:bg-mosque-dark transition-colors"
          >
            Retry Login
          </button>
        </div>
      </div>
    );
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f2320] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mosque border-t-transparent rounded-full animate-spin"></div>
          <p className="text-mosque font-medium animate-pulse">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f2320] flex flex-col">
      <AdminNav lang={lang} />
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

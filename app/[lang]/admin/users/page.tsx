"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { UserCard } from "@/components/admin/UserCard";
import { UsersHeader } from "@/components/admin/UsersHeader";

export default function AdminUsersPage(props: { 
  params: Promise<{ lang: string }>,
  searchParams: Promise<{ role?: string, search?: string }> 
}) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const lang = params.lang as Locale;
  const role = searchParams.role;
  const search = searchParams.search;

  const [dict, setDict] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [currentUserRole, setCurrentUserRole] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // 1. Load dictionary and session
  useEffect(() => {
    getDictionary(lang).then(setDict);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id;
      setCurrentUserId(uid);
      
      if (uid) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", uid)
          .single()
          .then(({ data }) => {
            setCurrentUserRole(data?.role);
            setIsAdmin(data?.role === 'admin');
          });
      } else {
        setIsAdmin(false);
      }
    });
  }, [lang]);

  // 2. Fetch users when filters or auth state changes
  useEffect(() => {
    if (!dict || isAdmin === null) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    async function fetchUsers() {
      setLoading(true);
      let query = supabase.from("profiles").select("*");

      if (role && role !== 'all') {
        query = query.eq("role", role);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data } = await query.order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }

    fetchUsers();
  }, [dict, isAdmin, role, search]);

  if (!dict || (loading && isAdmin === null)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mosque" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="material-icons text-5xl text-red-500 mb-4">gpp_maybe</span>
        <h1 className="text-2xl font-bold text-nordic-dark mb-2">Acceso Restringido</h1>
        <p className="text-nordic-dark/60">Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const t = dict.admin.users;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased font-display">
      <UsersHeader lang={lang} dict={dict} search={search} />
      
      <header className="mb-8">
        <div className="flex gap-6 border-b border-nordic-dark/10 overflow-x-auto">
          <a href={`/${lang}/admin/users`} className={`pb-3 text-sm transition-colors ${!role || role === 'all' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {t.all}
          </a>
          <a href={`/${lang}/admin/users?role=agent`} className={`pb-3 text-sm transition-colors ${role === 'agent' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {t.roles.agent}
          </a>
          <a href={`/${lang}/admin/users?role=broker`} className={`pb-3 text-sm transition-colors ${role === 'broker' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {t.roles.broker}
          </a>
          <a href={`/${lang}/admin/users?role=admin`} className={`pb-3 text-sm transition-colors ${role === 'admin' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {t.roles.admin}
          </a>
        </div>
      </header>

      <main className="space-y-4">
        {/* Table Header for Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic-dark/50 mb-2">
          <div className="col-span-4">{t.user_details}</div>
          <div className="col-span-3">{t.role_status}</div>
          <div className="col-span-3">{t.activity}</div>
          <div className="col-span-2 text-right">{t.actions}</div>
        </div>

        {/* User Cards */}
        {loading ? (
          <div className="text-center py-10 text-nordic-dark/40">Cargando usuarios...</div>
        ) : (
          users.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              lang={lang} 
              dict={dict} 
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          ))
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-20 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="material-icons text-5xl text-gray-300 mb-4">person_off</span>
            <p className="text-xl font-bold text-nordic-dark dark:text-white mb-2">{t.empty_title}</p>
            <p className="text-nordic-dark/60 dark:text-gray-400 font-medium">{t.empty_subtitle}</p>
          </div>
        )}
      </main>

      {/* Basic Pagination */}
      <footer className="mt-8 flex items-center justify-between border-t border-nordic-dark/5 pt-6">
        <p className="text-sm text-nordic-dark/60 dark:text-gray-400">
          {t.showing} <span className="font-medium text-nordic-dark dark:text-white">{users.length}</span> {t.users_count}
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-nordic-dark bg-white border border-gray-100 opacity-50 cursor-not-allowed">
            {t.previous}
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-nordic-dark bg-white border border-gray-100 opacity-50 cursor-not-allowed">
            {t.next}
          </button>
        </div>
      </footer>
    </div>
  );
}

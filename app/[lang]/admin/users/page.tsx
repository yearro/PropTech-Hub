import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { UserCard } from "@/components/admin/UserCard";
import { UsersHeader } from "@/components/admin/UsersHeader";

export default async function AdminUsersPage(props: { 
  params: Promise<{ lang: string }>,
  searchParams: Promise<{ role?: string, search?: string }> 
}) {
  const { lang } = await props.params;
  const { role, search } = await props.searchParams;
  const dict = await getDictionary(lang as Locale);

  // Fetch users from profiles table
  let query = supabase
    .from("profiles")
    .select("*");

  if (role && role !== 'all') {
    query = query.eq("role", role);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, error } = await query
    .order("created_at", { ascending: false });

  // Get current session to identify the logged-in user
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased font-display">
      <UsersHeader lang={lang} dict={dict} search={search} />
      
      <header className="mb-8">
        <div className="flex gap-6 border-b border-nordic-dark/10 overflow-x-auto">
          <a href={`/${lang}/admin/users`} className={`pb-3 text-sm transition-colors ${!role || role === 'all' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {lang === 'es' ? 'Todos' : 'All'}
          </a>
          <a href={`/${lang}/admin/users?role=agent`} className={`pb-3 text-sm transition-colors ${role === 'agent' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {dict.admin.users.roles.agent}
          </a>
          <a href={`/${lang}/admin/users?role=broker`} className={`pb-3 text-sm transition-colors ${role === 'broker' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {dict.admin.users.roles.broker}
          </a>
          <a href={`/${lang}/admin/users?role=admin`} className={`pb-3 text-sm transition-colors ${role === 'admin' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>
            {dict.admin.users.roles.admin}
          </a>
        </div>
      </header>

      <main className="space-y-4">
        {/* Table Header for Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic-dark/50 mb-2">
          <div className="col-span-4">{lang === 'es' ? 'Detalles de Usuario' : 'User Details'}</div>
          <div className="col-span-3">{lang === 'es' ? 'Rol y Estado' : 'Role & Status'}</div>
          <div className="col-span-3">{lang === 'es' ? 'Actividad' : 'Activity'}</div>
          <div className="col-span-2 text-right">{lang === 'es' ? 'Acciones' : 'Actions'}</div>
        </div>

        {/* User Cards */}
        {users?.map((user) => (
          <UserCard 
            key={user.id} 
            user={user} 
            lang={lang} 
            dict={dict} 
            currentUserId={currentUserId}
          />
        ))}

        {/* Empty State */}
        {(!users || users.length === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-20 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="material-icons text-5xl text-gray-300 mb-4">person_off</span>
            <p className="text-xl font-bold text-nordic-dark dark:text-white mb-2">{dict.admin.users.empty_title}</p>
            <p className="text-nordic-dark/60 dark:text-gray-400 font-medium">{dict.admin.users.empty_subtitle}</p>
          </div>
        )}
      </main>

      {/* Basic Pagination (Simplified for now) */}
      <footer className="mt-8 flex items-center justify-between border-t border-nordic-dark/5 pt-6">
        <p className="text-sm text-nordic-dark/60 dark:text-gray-400">
          {dict.admin.users.showing} <span className="font-medium text-nordic-dark dark:text-white">{users?.length || 0}</span> {dict.admin.users.users_count}
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-nordic-dark bg-white border border-gray-100 opacity-50 cursor-not-allowed">
            {lang === 'es' ? 'Anterior' : 'Previous'}
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-nordic-dark bg-white border border-gray-100 opacity-50 cursor-not-allowed">
             {lang === 'es' ? 'Siguiente' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  );
}

import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { UserCard } from "@/components/admin/UserCard";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased font-display">
      <header className="w-full pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic-dark dark:text-white">
              {lang === 'es' ? 'Directorio de Usuarios' : 'User Directory'}
            </h1>
            <p className="text-nordic-dark/60 dark:text-gray-400 mt-1 text-sm">
              {lang === 'es' ? 'Gestiona el acceso y roles de usuario para tus propiedades.' : 'Manage user access and roles for your properties.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <form className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-nordic-dark/40 group-focus-within:text-mosque text-xl">search</span>
              </div>
              <input 
                name="search"
                defaultValue={search}
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white dark:bg-gray-800 text-nordic-dark dark:text-white shadow-soft placeholder-nordic-dark/30 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-sm" 
                placeholder={lang === 'es' ? 'Buscar por nombre, email...' : 'Search by name, email...'} 
                type="text"
              />
            </form>
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-transparent hover:bg-mosque/5 transition-colors whitespace-nowrap">
              <span className="material-icons text-lg mr-2">add</span>
              {lang === 'es' ? 'Agregar Usuario' : 'Add User'}
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex gap-6 border-b border-nordic-dark/10 overflow-x-auto">
          <a href={`/${lang}/admin/users`} className={`pb-3 text-sm transition-colors ${!role || role === 'all' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>All Users</a>
          <a href={`/${lang}/admin/users?role=agent`} className={`pb-3 text-sm transition-colors ${role === 'agent' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>Agents</a>
          <a href={`/${lang}/admin/users?role=broker`} className={`pb-3 text-sm transition-colors ${role === 'broker' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>Brokers</a>
          <a href={`/${lang}/admin/users?role=admin`} className={`pb-3 text-sm transition-colors ${role === 'admin' ? 'font-semibold text-mosque border-b-2 border-mosque' : 'font-medium text-nordic-dark/60 hover:text-nordic-dark'}`}>Admins</a>
        </div>
      </header>

      <main className="space-y-4">
        {/* Table Header for Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic-dark/50 mb-2">
          <div className="col-span-4">User Details</div>
          <div className="col-span-3">Role & Status</div>
          <div className="col-span-3">Activity</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* User Cards */}
        {users?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}

        {/* Empty State */}
        {(!users || users.length === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-20 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="material-icons text-5xl text-gray-300 mb-4">person_off</span>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
          </div>
        )}
      </main>

      {/* Basic Pagination (Simplified for now) */}
      <footer className="mt-8 flex items-center justify-between border-t border-nordic-dark/5 pt-6">
        <p className="text-sm text-nordic-dark/60 dark:text-gray-400">
          Showing <span className="font-medium text-nordic-dark dark:text-white">{users?.length || 0}</span> users
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-nordic-dark bg-white border border-gray-100 opacity-50 cursor-not-allowed">Previous</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-nordic-dark bg-white border border-gray-100 opacity-50 cursor-not-allowed">Next</button>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, use, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import Image from "next/image";
import Link from "next/link";

export default function AdminAppointmentsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const params = use(props.params);
  const lang = params.lang as Locale;

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dict, setDict] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        supabase
          .from("profiles")
          .select("id, role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setCurrentUser({ id: data.id, role: data.role });
          });
      }
    });
  }, [lang]);

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          property:properties(title, location, images),
          viewer:profiles!appointments_viewer_id_fkey(full_name, email, phone),
          agent:profiles!appointments_agent_id_fkey(full_name, email)
        `)
        .order("appointment_date", { ascending: false });

      if (currentUser.role === "viewer") {
        query = query.eq("viewer_id", currentUser.id);
      } else if (currentUser.role !== "admin") {
        query = query.eq("agent_id", currentUser.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setAppointments(data || []);
    } catch (e) {
      console.error("Error fetching appointments:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchAppointments();
  }, [currentUser, fetchAppointments]);

  const handleUpdateStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (updateError) throw updateError;
      
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (e) {
      console.error("Error updating status:", e);
      alert("Error updating appointment status");
    }
  };

  if (!dict || !currentUser || (loading && appointments.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mosque" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nordic-dark dark:text-white tracking-tight">
          {dict.appointments.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {dict.appointments.subtitle}
        </p>
      </div>

      <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-xl shadow-black/5 border border-gray-200 dark:border-mosque/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-mosque/5 border-b border-gray-100 dark:border-mosque/10 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-4">{dict.appointments.property}</th>
                <th className="px-6 py-4">{currentUser.role === "viewer" ? dict.appointments.agent : dict.appointments.client}</th>
                <th className="px-6 py-4">{dict.appointments.date}</th>
                <th className="px-6 py-4">{dict.appointments.status}</th>
                <th className="px-6 py-4 text-right">{dict.appointments.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-mosque/10">
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-mosque/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                        {app.property?.images?.[0] ? (
                          <Image
                            src={app.property.images[0]}
                            alt={app.property.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="material-icons">image</span>
                          </div>
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <p className="text-sm font-bold text-nordic-dark dark:text-white truncate">
                          {app.property?.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {app.property?.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {currentUser.role === "viewer" ? (
                      <div>
                        <p className="text-sm font-medium text-nordic-dark dark:text-white">
                          {app.agent?.full_name || "LuxeEstate Agent"}
                        </p>
                        <p className="text-xs text-gray-500">{app.agent?.email}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-nordic-dark dark:text-white">
                          {app.viewer?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{app.viewer?.email}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-nordic-dark dark:text-white">
                      {new Date(app.appointment_date).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(app.appointment_date).toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} dict={dict} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {currentUser.role !== "viewer" && app.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app.id, "accepted")}
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title={dict.appointments.accept}
                          >
                            <span className="material-icons text-base">check</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, "rejected")}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title={dict.appointments.reject}
                          >
                            <span className="material-icons text-base">close</span>
                          </button>
                        </>
                      )}
                      {app.notes && (
                        <div className="relative group/note">
                          <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
                            <span className="material-icons text-base">speaker_notes</span>
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-white dark:bg-[#0a1a18] rounded-xl shadow-xl border border-gray-100 dark:border-mosque/20 text-xs text-gray-600 dark:text-gray-400 hidden group-hover/note:block z-10">
                            {app.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-mosque/5 text-gray-300 mb-4">
                      <span className="material-icons text-4xl">calendar_today</span>
                    </div>
                    <p className="text-lg font-bold text-nordic-dark dark:text-white">
                      {dict.appointments.empty_title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {dict.appointments.empty_subtitle}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, dict }: { status: string; dict: any }) {
  const styles: any = {
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  const labels: any = {
    pending: dict.appointments.pending,
    accepted: dict.appointments.accepted,
    rejected: dict.appointments.rejected,
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { AgentCard } from "./AgentCard";

import { LazyMap } from "./LazyMap";

interface PropertySidebarProps {
  property: any;
  dict: any;
  lang: string;
}

export function PropertySidebar({ property, dict, lang }: PropertySidebarProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setUserRole(profile?.role || 'viewer');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
        <div className="mb-4">
          <h1 className="text-4xl font-display font-light text-nordic-dark mb-2">
            ${property.price.toLocaleString()}
            {property.type === "FOR RENT" ? (
              <span className="text-xl text-nordic-muted">{dict.common.per_month}</span>
            ) : (
              ""
            )}
          </h1>
          <p className="text-nordic-dark/60 font-medium flex items-center gap-1">
            <span className="material-icons text-mosque text-sm">location_on</span>
            {property.location}
          </p>
        </div>
        <div className="h-px bg-slate-100 my-6"></div>
        
        {property.agent ? (
          <AgentCard
            agent={property.agent}
            dict={dict.property_details}
            appointmentsDict={dict.appointments}
            userRole={userRole}
            viewerId={user?.id || null}
            propertyId={property.id}
            propertyTitle={property.title}
          />
        ) : (
          <div className="space-y-3">
            {userRole === "viewer" && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group"
              >
                <span className="material-icons text-xl group-hover:scale-110 transition-transform">calendar_today</span>
                {dict.property_details.schedule_visit}
              </button>
            )}
            <AppointmentModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              propertyId={property.id}
              propertyTitle={property.title}
              agentId={null}
              viewerId={user?.id || null}
              dict={{ ...dict.property_details, appointments: dict.appointments }}
            />
            <button className="w-full bg-transparent border border-nordic-dark/10 hover:border-mosque text-nordic-dark/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <span className="material-icons text-xl">mail_outline</span>
              {dict.property_details.contact_agent}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
          <LazyMap 
            locationText={property.location} 
            latitude={property.latitude}
            longitude={property.longitude}
          />
        </div>
      </div>
    </div>
  );
}

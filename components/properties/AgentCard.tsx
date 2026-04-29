"use client";

import { useState } from "react";
import { getAvatarFallback } from "@/utils/avatarFallback";
import { AppointmentModal } from "./AppointmentModal";

interface AgentCardProps {
  agent: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    phone: string | null;
    role: string | null;
    id?: string | null;
  };
  dict: {
    top_rated?: string;
    schedule_visit?: string;
    contact_agent?: string;
  };
  appointmentsDict: any;
  userRole: string | null;
  viewerId: string | null;
  propertyId: string;
  propertyTitle: string;
}

export function AgentCard({ agent, dict, appointmentsDict, userRole, viewerId, propertyId, propertyTitle }: AgentCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const avatarSrc = imgError
    ? getAvatarFallback(agent.full_name)
    : (agent.avatar_url || getAvatarFallback(agent.full_name));

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <img
          alt={agent.full_name || "Agent"}
          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
          src={avatarSrc}
          onError={() => setImgError(true)}
        />
        <div>
          <h3 className="font-semibold text-nordic-dark">
            {agent.full_name || "Agente Inmobiliario"}
          </h3>
          <div className="flex items-center gap-1 text-xs text-mosque font-medium">
            <span className="material-icons text-[14px]">star</span>
            <span>
              {agent.role === "broker"
                ? "Broker Destacado"
                : dict.top_rated || "Agente Destacado"}
            </span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <a
            href={agent.email ? `mailto:${agent.email}` : "#"}
            className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors flex items-center justify-center"
          >
            <span className="material-icons text-sm">chat</span>
          </a>
          <a
            href={agent.phone ? `tel:${agent.phone}` : "#"}
            className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors flex items-center justify-center"
          >
            <span className="material-icons text-sm">call</span>
          </a>
        </div>
      </div>

      <div className="space-y-3">
        {userRole === "viewer" && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group"
          >
            <span className="material-icons text-xl group-hover:scale-110 transition-transform">
              calendar_today
            </span>
            {dict.schedule_visit}
          </button>
        )}

        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          agentId={agent.id || null}
          viewerId={viewerId}
          dict={{ ...dict, appointments: appointmentsDict }}
        />
        {agent.email ? (
          <a
            href={`mailto:${agent.email}`}
            className="w-full bg-transparent border border-nordic-dark/10 hover:border-mosque text-nordic-dark/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons text-xl">mail_outline</span>
            {dict.contact_agent}
          </a>
        ) : (
          <button className="w-full bg-transparent border border-nordic-dark/10 hover:border-mosque text-nordic-dark/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
            <span className="material-icons text-xl">mail_outline</span>
            {dict.contact_agent}
          </button>
        )}
      </div>
    </>
  );
}

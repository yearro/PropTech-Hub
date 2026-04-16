"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
  onRoleChange?: (newRole: string) => void;
}

const roles = [
  { value: "admin", label: "Administrator", icon: "shield" },
  { value: "broker", label: "Broker", icon: "business_center" },
  { value: "agent", label: "Agent", icon: "support_agent" },
  { value: "viewer", label: "Viewer", icon: "visibility" },
];

export function RoleSelector({ userId, currentRole, onRoleChange }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      onRoleChange?.(newRole);
    }
    setLoading(false);
    setIsOpen(false);
  };

  const currentRoleData = roles.find(r => r.value === currentRole) || roles[3];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`inline-flex items-center px-4 py-2 border shadow-sm text-xs font-medium rounded-lg transition-colors w-full md:w-auto justify-center ${
          isOpen 
            ? "bg-mosque text-white border-mosque" 
            : "border-nordic-dark/10 bg-white dark:bg-gray-800 text-nordic-dark hover:bg-nordic-dark hover:text-white"
        }`}
      >
        {loading ? "Updating..." : "Change Role"}
        <span className="material-icons text-[16px] ml-2">{isOpen ? "expand_less" : "expand_more"}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl bg-mosque ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-40 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="py-1">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                    currentRole === role.value
                      ? "bg-white/20 text-white font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={`material-icons text-sm mr-3 ${currentRole === role.value ? "text-white" : "text-white/50 group-hover:text-white"}`}>
                    {role.icon}
                  </span>
                  {role.label}
                </button>
              ))}
              <div className="border-t border-white/10 my-1"></div>
              <button
                className="group flex items-center w-full px-4 py-3 text-xs text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="material-icons text-sm mr-3 text-red-300 group-hover:text-red-100">block</span>
                Suspend User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

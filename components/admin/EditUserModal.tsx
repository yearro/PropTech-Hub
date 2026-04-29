"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  dict: any;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
  currentUserId?: string;
  currentUserRole?: string;
  onUserUpdated?: (updated: any) => void;
}

export function EditUserModal({ isOpen, onClose, lang, dict, user, currentUserId, currentUserRole, onUserUpdated }: EditUserModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isSelf = user.id === currentUserId;
  const canChangeRole = currentUserRole === 'admin' && !isSelf;

  // Parse existing phone into country code + number
  const parsePhone = (phone?: string | null) => {
    if (!phone) return { countryCode: "+52", phoneNumber: "" };
    const match = phone.match(/^(\+\d{1,3})\s+(.*)$/);
    if (match) return { countryCode: match[1], phoneNumber: match[2] };
    return { countryCode: "+52", phoneNumber: phone };
  };

  const parsed = parsePhone(user.phone);

  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    countryCode: parsed.countryCode,
    phoneNumber: parsed.phoneNumber,
    role: user.role || "agent",
  });

  const countryCodes = [
    { code: "+1", label: "+1 (US/CA)" },
    { code: "+34", label: "+34 (ES)" },
    { code: "+52", label: "+52 (MX)" },
    { code: "+54", label: "+54 (AR)" },
    { code: "+56", label: "+56 (CL)" },
    { code: "+57", label: "+57 (CO)" },
  ];

  const roles = [
    { value: "admin", label: dict.admin.users.roles.admin, icon: "shield" },
    { value: "broker", label: dict.admin.users.roles.broker, icon: "business_center" },
    { value: "agent", label: dict.admin.users.roles.agent, icon: "support_agent" },
    { value: "viewer", label: dict.admin.users.roles.viewer, icon: "visibility" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const phone = formData.phoneNumber
        ? `${formData.countryCode} ${formData.phoneNumber.trim()}`
        : null;

      // Update profile info directly from client to use browser session for RLS
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone,
          role: !isSelf ? formData.role : user.role // Update role here too if admin
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      onUserUpdated?.(updatedData);
      router.refresh();
      onClose();
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(`${dict.admin.users.edit_error}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dict.admin.users.edit_modal_title}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
            {dict.admin.users.full_name}
          </label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
            {dict.admin.users.email}
          </label>
          <input
            required
            type="email"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
            {dict.admin.users.phone}
          </label>
          <div className="flex gap-2">
            <select
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
              className="px-3 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner appearance-none cursor-pointer min-w-[max-content]"
            >
              {countryCodes.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <input
              type="tel"
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-mosque/20 focus:ring-2 focus:ring-mosque focus:bg-white transition-all outline-none text-nordic-dark dark:text-white shadow-inner"
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
        </div>

        {/* Role selector */}
        <div>
          <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
            {dict.admin.users.role}
          </label>
          {!canChangeRole ? (
            <>
              <div className="inline-flex items-center px-4 py-2.5 rounded-lg bg-mosque/10 text-mosque text-sm font-medium capitalize">
                <span className="material-icons text-sm mr-2">shield</span>
                {dict.admin.users.roles[user.role as keyof typeof dict.admin.users.roles] || user.role}
              </div>
              <p className="text-[11px] text-nordic-dark/40 dark:text-gray-500 mt-1.5">
                {isSelf 
                  ? dict.admin.users.self_role_warning 
                  : (lang === 'es' ? "Solo los administradores pueden cambiar roles." : "Only administrators can change roles.")}
              </p>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    formData.role === role.value
                      ? "bg-mosque text-white border-mosque shadow-md shadow-mosque/20"
                      : "bg-white dark:bg-[#1a3833] border-gray-100 dark:border-mosque/10 text-nordic-dark/60 dark:text-gray-400 hover:border-mosque/50"
                  }`}
                >
                  <span className="material-icons text-sm">{role.icon}</span>
                  {role.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-bold text-nordic-dark/60 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-mosque/20 transition-colors"
          >
            {dict.admin.users.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-mosque text-white text-sm font-bold shadow-lg shadow-mosque/30 hover:shadow-mosque/40 transform active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {dict.admin.users.saving}
              </>
            ) : (
              dict.admin.users.save_changes
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

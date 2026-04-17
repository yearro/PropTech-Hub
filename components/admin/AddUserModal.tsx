"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { createUserProfile } from "@/app/actions";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  dict: any;
}

export function AddUserModal({ isOpen, onClose, lang, dict }: AddUserModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "agent"
  });

  const DEFAULT_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWXbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, error, data } = await createUserProfile({
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        avatar_url: DEFAULT_AVATAR
      });

      if (!success) {
        throw new Error(error || (lang === 'es' ? 'Error al guardar en la base de datos' : 'Database error'));
      }

      router.refresh();
      onClose();
      // Reset form
      setFormData({
        full_name: "",
        email: "",
        role: "agent"
      });
    } catch (error: any) {
      console.error("Error adding user:", error);
      alert(`${lang === 'es' ? 'Error al agregar usuario' : 'Error adding user'}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "admin", label: dict.admin.users.roles.admin },
    { value: "broker", label: dict.admin.users.roles.broker },
    { value: "agent", label: dict.admin.users.roles.agent },
    { value: "viewer", label: dict.admin.users.roles.viewer }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={dict.admin.users.modal_title}
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
            placeholder="John Doe"
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
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-nordic-dark/60 dark:text-gray-400 uppercase tracking-widest mb-2">
            {dict.admin.users.role}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: role.value })}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  formData.role === role.value
                    ? "bg-mosque text-white border-mosque shadow-md shadow-mosque/20"
                    : "bg-white dark:bg-[#1a3833] border-gray-100 dark:border-mosque/10 text-nordic-dark/60 dark:text-gray-400 hover:border-mosque/50"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
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
              dict.admin.users.save
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

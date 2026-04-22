"use client";

import Image from "next/image";
import { EditUserModal } from "./EditUserModal";
import { useState } from "react";
import { getAvatarFallback } from "@/utils/avatarFallback";

interface UserCardProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
    phone?: string | null;
    created_at: string;
  };
  lang: string;
  dict: any;
  currentUserId?: string;
  currentUserRole?: string;
}

export function UserCard({ user: initialUser, lang, dict, currentUserId, currentUserRole }: UserCardProps) {
  const [user, setUser] = useState(initialUser);
  const [imgError, setImgError] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleUserUpdated = (updated: any) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const avatarSrc = imgError
    ? getAvatarFallback(user.full_name)
    : (user.avatar_url || getAvatarFallback(user.full_name));

  const t = dict.admin.users;

  return (
    <>
      <div className={`group relative rounded-xl p-5 shadow-sm border transition-all hover:shadow-md flex flex-col md:grid md:grid-cols-12 gap-4 items-center ${
        user.role === 'admin' 
          ? 'bg-[#D9ECC8] dark:bg-mosque/20 border-mosque/20' 
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-[#D9ECC8] dark:hover:bg-mosque/10'
      }`}>
        <div className="col-span-12 md:col-span-4 flex items-center w-full">
          <div className="relative flex-shrink-0">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white dark:border-mosque relative bg-gray-100">
              <Image
                alt={user.full_name || 'User'}
                src={avatarSrc}
                fill
                className="object-cover"
                sizes="48px"
                onError={() => setImgError(true)}
                unoptimized
              />
            </div>
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
          </div>
          <div className="ml-4 overflow-hidden">
            <div className="text-sm font-bold text-nordic-dark dark:text-white truncate">{user.full_name || t.new_user}</div>
            <div className="text-xs text-nordic-dark/70 dark:text-gray-300 truncate">{user.email}</div>
            <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-white/50 dark:bg-black/20 rounded text-nordic-dark/60 dark:text-gray-400 capitalize">
              {t.roles[user.role as keyof typeof t.roles] || user.role}
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
            user.role === 'admin' ? 'bg-mosque text-white' : 'bg-mosque/10 text-mosque'
          }`}>
            {t.roles[user.role as keyof typeof t.roles] || user.role}
          </span>
          <div className="flex items-center text-xs text-nordic-dark/60 dark:text-gray-400">
            <span className="material-icons text-[14px] mr-1 text-mosque">check_circle</span>
            {t.active}
          </div>
        </div>

        <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">{t.joined}</div>
            <div className="text-sm font-semibold text-nordic-dark dark:text-white">
              {new Date(user.created_at).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US')}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">{t.status}</div>
            <div className="text-sm font-semibold text-nordic-dark dark:text-white">{t.active}</div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-2 w-full flex justify-end">
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-nordic-dark/10 bg-white dark:bg-gray-800 text-nordic-dark hover:bg-mosque hover:text-white hover:border-mosque shadow-sm text-xs font-medium rounded-lg transition-colors"
            title={t.edit_user}
          >
            <span className="material-icons text-[16px] mr-1.5">edit</span>
            {t.edit_user}
          </button>
        </div>
      </div>

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        lang={lang}
        dict={dict}
        user={user}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onUserUpdated={handleUserUpdated}
      />
    </>
  );
}

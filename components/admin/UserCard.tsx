"use client";

import Image from "next/image";
import { RoleSelector } from "./RoleSelector";
import { useState } from "react";

interface UserCardProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
  };
  lang: string;
  dict: any;
  currentUserId?: string;
}

export function UserCard({ user: initialUser, lang, dict, currentUserId }: UserCardProps) {
  const [user, setUser] = useState(initialUser);

  const handleRoleChange = (newRole: string) => {
    setUser({ ...user, role: newRole });
  };

  return (
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
              src={user.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWXbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA'}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
        </div>
        <div className="ml-4 overflow-hidden">
          <div className="text-sm font-bold text-nordic-dark dark:text-white truncate">{user.full_name || 'New User'}</div>
          <div className="text-xs text-nordic-dark/70 dark:text-gray-300 truncate">{user.email}</div>
          <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-white/50 dark:bg-black/20 rounded text-nordic-dark/60 dark:text-gray-400 capitalize">
            {user.role}
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
          user.role === 'admin' ? 'bg-mosque text-white' : 'bg-mosque/10 text-mosque'
        }`}>
          {user.role}
        </span>
        <div className="flex items-center text-xs text-nordic-dark/60 dark:text-gray-400">
          <span className="material-icons text-[14px] mr-1 text-mosque">check_circle</span>
          Active
        </div>
      </div>

      <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">Joined</div>
          <div className="text-sm font-semibold text-nordic-dark dark:text-white">
            {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">Status</div>
          <div className="text-sm font-semibold text-nordic-dark dark:text-white">Active</div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-2 w-full flex justify-end">
        <RoleSelector 
          userId={user.id} 
          currentRole={user.role} 
          onRoleChange={handleRoleChange} 
          lang={lang}
          dict={dict}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}

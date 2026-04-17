"use client";

import { useState } from "react";
import { AddUserModal } from "./AddUserModal";

interface UsersHeaderProps {
  lang: string;
  dict: any;
  search: string | undefined;
}

export function UsersHeader({ lang, dict, search }: UsersHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="w-full pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic-dark dark:text-white">
              {dict.admin.users.title}
            </h1>
            <p className="text-nordic-dark/60 dark:text-gray-400 mt-1 text-sm">
              {dict.admin.users.subtitle}
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
                placeholder={dict.admin.users.search_placeholder} 
                type="text"
              />
            </form>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-transparent hover:bg-mosque/5 transition-colors whitespace-nowrap"
            >
              <span className="material-icons text-lg mr-2">add</span>
              {dict.admin.users.add_user}
            </button>
          </div>
        </div>
      </header>

      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lang={lang}
        dict={dict}
      />
    </>
  );
}

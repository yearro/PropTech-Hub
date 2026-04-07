"use client";

import { useState } from "react";
import { SearchFiltersModal } from "./search-filters-modal";

export function FiltersAction() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <span className="material-icons text-base">tune</span> Filters
      </button>

      {isOpen && <SearchFiltersModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

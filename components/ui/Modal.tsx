"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-nordic-dark/40 backdrop-blur-md z-[60] transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div 
          ref={modalRef}
          className="bg-white dark:bg-[#152e2a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-white/50 dark:border-mosque/20 animate-in zoom-in-95 fade-in duration-300 transform"
        >
          {/* Header */}
          <header className="px-6 py-4 border-b border-gray-100 dark:border-mosque/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-nordic-dark dark:text-white tracking-tight">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-mosque/20 text-nordic-dark/50 dark:text-gray-400 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </header>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

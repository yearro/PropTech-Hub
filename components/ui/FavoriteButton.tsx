"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorited?: boolean;
  className?: string;
  lang: string;
  addLabel?: string;
  removeLabel?: string;
}

export function FavoriteButton({ 
  propertyId, 
  initialIsFavorited = false, 
  className = "", 
  lang,
  addLabel = "Add to favorites",
  removeLabel = "Remove from favorites"
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !mounted) return;

      const { data, error } = await supabase
        .from("saved_properties")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (mounted && data) {
        setIsFavorited(true);
      }
    };

    if (!initialIsFavorited) {
      checkStatus();
    }

    return () => {
      mounted = false;
    };
  }, [propertyId, initialIsFavorited]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${lang}/login`);
        return;
      }

      if (isFavorited) {
        const { error } = await supabase
          .from("saved_properties")
          .delete()
          .eq("user_id", session.user.id)
          .eq("property_id", propertyId);

        if (!error) setIsFavorited(false);
      } else {
        const { error } = await supabase
          .from("saved_properties")
          .insert({
            user_id: session.user.id,
            property_id: propertyId,
          });

        if (!error) setIsFavorited(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-300 z-10 flex items-center justify-center ${
        isFavorited
          ? "bg-mosque text-white shadow-lg scale-110"
          : "bg-white/90 text-nordic-dark hover:bg-mosque hover:text-white shadow-sm hover:scale-110"
      } ${className} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      title={isFavorited ? removeLabel : addLabel}
    >
      <span className={`material-icons text-lg ${isLoading ? "animate-pulse" : ""}`}>
        {isFavorited ? "favorite" : "favorite_border"}
      </span>
    </button>
  );
}

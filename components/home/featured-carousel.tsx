"use client";

import { useRef, useState, useEffect } from "react";
import { FeaturedPropertyCard } from "./featured-property-card";
import { Property } from "@/types";

interface FeaturedCarouselProps {
  properties: Property[];
  lang: string;
  dict: any;
}

export function FeaturedCarousel({ properties, lang, dict }: FeaturedCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    
    // Check again after a short delay to ensure layout is complete
    const timeout = setTimeout(checkScroll, 100);
    
    return () => {
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timeout);
    };
  }, [properties]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/carousel">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-nordic-dark/5 items-center justify-center text-nordic-dark hover:text-mosque transition-all hover:scale-110"
          aria-label="Previous properties"
        >
          <span className="material-icons">chevron_left</span>
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-8 pb-8 scroll-smooth hide-scroll snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {properties.map((property) => (
          <div key={property.id} className="min-w-[85%] md:min-w-[45%] lg:min-w-[48%] snap-start">
            <FeaturedPropertyCard
              property={property}
              lang={lang}
              dict={dict}
            />
          </div>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-nordic-dark/5 items-center justify-center text-nordic-dark hover:text-mosque transition-all hover:scale-110"
          aria-label="Next properties"
        >
          <span className="material-icons">chevron_right</span>
        </button>
      )}
    </div>
  );
}

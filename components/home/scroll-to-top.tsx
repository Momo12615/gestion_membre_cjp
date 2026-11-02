"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ScrollToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const checkScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > 350) {
        if (!isVisible) setIsVisible(true);
      } else {
        if (isVisible) setIsVisible(false);
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, [isVisible]);

  useEffect(() => {
    if (!btnRef.current) return;

    if (isVisible) {
      // Animation d'entrée fluide
      gsap.to(btnRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        pointerEvents: "auto",
        duration: 0.45,
        ease: "back.out(1.5)",
      });
    } else {
      // Animation de sortie très fluide
      gsap.to(btnRef.current, {
        opacity: 0,
        scale: 0.75,
        y: 15,
        pointerEvents: "none",
        duration: 0.35,
        ease: "power2.in",
      });
    }
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={scrollToTop}
      aria-label="Retour en haut de page"
      className="fixed bottom-6 right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md border border-[#FFA500]/40 text-[#FFA500] hover:text-[#171717] hover:bg-[#FFA500] dark:hover:bg-[#FFA500] dark:hover:text-[#171717] shadow-lg shadow-[#FFA500]/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group opacity-0 scale-75 translate-y-4 pointer-events-none"
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#E5E5E5] dark:border-[#383838] bg-[#F7F7F7] dark:bg-[#171717] text-[#737373] dark:text-[#A3A3A3] text-xs transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Identité CJP */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-[#FFA500]/30">
            <Image
              src="/cjp-logo.png"
              alt="Logo CJP"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-heading font-semibold text-[#171717] dark:text-white">
              Club des Jeunes Programmeurs
            </span>
            <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
              Innovation • Technologie • Excellence
            </p>
          </div>
        </div>

        {/* Valeurs et Copyright */}
        <div className="flex flex-col sm:items-end text-center sm:text-right gap-1">
          <p className="flex items-center justify-center sm:justify-end gap-1.5 text-xs text-[#171717] dark:text-white font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FFA500]" />
            Communauté de passionnés d&apos;informatique
          </p>
          <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">
            © {currentYear} CJP. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "toggle" | "segmented";
}

const emptySubscribe = () => () => {};

export function ThemeToggle({
  className,
  variant = "toggle",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-9 h-9 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222]",
          className
        )}
      />
    );
  }

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 rounded-xl bg-[#F7F7F7] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#383838]",
          className
        )}
        role="group"
        aria-label="Sélection du thème"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
            theme === "light"
              ? "bg-white dark:bg-[#292929] text-[#171717] dark:text-white shadow-xs"
              : "text-[#737373] hover:text-[#171717] dark:hover:text-white"
          )}
          title="Thème clair"
        >
          <Sun className="w-3.5 h-3.5 text-[#FFA500]" />
          <span className="hidden sm:inline">Clair</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
            theme === "dark"
              ? "bg-white dark:bg-[#292929] text-[#171717] dark:text-white shadow-xs"
              : "text-[#737373] hover:text-[#171717] dark:hover:text-white"
          )}
          title="Thème sombre"
        >
          <Moon className="w-3.5 h-3.5 text-[#FFA500]" />
          <span className="hidden sm:inline">Sombre</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
            theme === "system"
              ? "bg-white dark:bg-[#292929] text-[#171717] dark:text-white shadow-xs"
              : "text-[#737373] hover:text-[#171717] dark:hover:text-white"
          )}
          title="Thème système"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Système</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative w-9 h-9 rounded-xl border border-[#E5E5E5] dark:border-[#383838] bg-white dark:bg-[#222222] text-[#171717] dark:text-white flex items-center justify-center hover:bg-[#F7F7F7] dark:hover:bg-[#292929] hover:border-[#FFA500]/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]",
        className
      )}
      aria-label={`Basculer vers le mode ${resolvedTheme === "dark" ? "clair" : "sombre"}`}
      title={`Mode actuel : ${resolvedTheme === "dark" ? "Sombre" : "Clair"}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-[#FFA500] transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#171717] transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}

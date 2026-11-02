import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "cjp"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "neutral"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  children,
  variant = "cjp",
  size = "md",
  dot = false,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    // CJP Official: Fond teinté orange doux, texte et bordure harmonisés
    cjp: "bg-[#FFF4D6] dark:bg-[#FFA500]/15 text-[#171717] dark:text-[#FFA500] border border-[#FFA500]/30 font-semibold",
    // Succès
    success:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-medium",
    // En attente / Avertissement
    warning:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-medium",
    // Erreur
    error:
      "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-medium",
    // Information
    info: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-medium",
    // Neutre / Gris
    neutral:
      "bg-[#F7F7F7] dark:bg-[#292929] text-[#737373] dark:text-[#A3A3A3] border border-[#E5E5E5] dark:border-[#383838] font-medium",
    // Outline sobre
    outline:
      "bg-transparent border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-white font-medium",
  };

  const dotStyles = {
    cjp: "bg-[#FFA500]",
    success: "bg-[#16A34A]",
    warning: "bg-[#EAB308]",
    error: "bg-[#DC2626]",
    info: "bg-[#2563EB]",
    neutral: "bg-[#737373]",
    outline: "bg-current",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium leading-none select-none transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

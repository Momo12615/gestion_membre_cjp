"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2.5 gap-2 h-10",
      lg: "text-base px-6 py-3.5 gap-2.5 h-12",
    };

    const variantStyles = {
      // Primary: Orange CJP #FFA500, hover sur Or #F5B51B, texte noir profond pour lisibilité et contraste optimal
      primary:
        "bg-[#FFA500] hover:bg-[#F5B51B] text-[#171717] font-semibold shadow-sm shadow-[#FFA500]/20 hover:shadow-md hover:shadow-[#FFA500]/30 active:bg-[#FFA500]",
      // Secondary: Fond blanc / surface sombre, bordure grise subtile
      secondary:
        "bg-white dark:bg-[#222222] text-[#171717] dark:text-white border border-[#E5E5E5] dark:border-[#383838] hover:bg-[#F7F7F7] dark:hover:bg-[#292929] hover:border-[#FFA500]/40 shadow-xs",
      // Outline: Fond transparent avec bordure
      outline:
        "bg-transparent border border-[#E5E5E5] dark:border-[#383838] text-[#171717] dark:text-white hover:border-[#FFA500] hover:text-[#FFA500] dark:hover:text-[#FFA500]",
      // Ghost: Sans fond
      ghost:
        "bg-transparent text-[#171717] dark:text-white hover:bg-[#FFF4D6] dark:hover:bg-[#FFA500]/10 hover:text-[#FFA500] dark:hover:text-[#FFA500]",
      // Danger: Rouge fonctionnel
      danger:
        "bg-[#DC2626] hover:bg-red-700 text-white shadow-xs focus-visible:ring-red-500",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

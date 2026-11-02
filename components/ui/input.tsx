"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-medium text-[#171717] dark:text-white"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#737373] dark:text-[#A3A3A3]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              "w-full rounded-xl bg-white dark:bg-[#1f1f1f] border text-[#171717] dark:text-white placeholder-[#737373]/60 dark:placeholder-[#A3A3A3]/50 text-sm py-2.5 transition-all duration-200 outline-none",
              leftIcon ? "pl-10" : "px-3.5",
              rightIcon ? "pr-10" : "px-3.5",
              error
                ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                : "border-[#E5E5E5] dark:border-[#383838] focus:border-[#FFA500] focus:ring-2 focus:ring-[#FFA500]/25 dark:focus:ring-[#FFA500]/30",
              disabled && "opacity-50 cursor-not-allowed bg-[#F7F7F7] dark:bg-[#292929]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#DC2626] flex items-center gap-1 font-medium">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#737373] dark:text-[#A3A3A3]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

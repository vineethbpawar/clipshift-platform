"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = ({
  label,
  error,
  className,
  value,
  onFocus,
  onBlur,
  ...props
}: FloatingInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;

  return (
    <div className="relative w-full mb-6">
      <div
        className={cn(
          "relative glass transition-all duration-300 rounded-xl",
          isFocused ? "border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10",
          error && "border-red-500/50"
        )}
      >
        <motion.label
          initial={false}
          animate={{
            top: isFocused || hasValue ? "6px" : "18px",
            fontSize: isFocused || hasValue ? "12px" : "16px",
            color: isFocused ? "var(--color-neon-purple)" : "rgba(156, 163, 175, 1)",
          }}
          className="absolute left-4 pointer-events-none z-10 font-medium"
        >
          {label}
        </motion.label>
        <input
          className={cn(
            "w-full bg-transparent px-4 pb-2 pt-6 text-white text-base outline-none placeholder-transparent min-h-[56px]",
            className
          )}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </div>
      {error && <span className="text-red-500 text-xs mt-1 ml-2">{error}</span>}
    </div>
  );
};

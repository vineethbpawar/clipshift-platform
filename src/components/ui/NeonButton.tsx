"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NeonButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  variant?: "purple" | "blue";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export const NeonButton = ({
  className,
  variant = "purple",
  size = "md",
  glow = true,
  children,
  ...props
}: NeonButtonProps) => {
  const variants = {
    purple: "bg-neon-purple/20 border-neon-purple/50 text-neon-purple hover:bg-neon-purple/30",
    blue: "bg-neon-blue/20 border-neon-blue/50 text-neon-blue hover:bg-neon-blue/30",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const glowStyles = {
    purple: "neon-glow-purple",
    blue: "neon-glow-blue",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative rounded-full border font-bold transition-all duration-300",
        variants[variant],
        sizes[size],
        glow && glowStyles[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard = ({
  children,
  className,
  animate = true,
  hoverEffect = true,
}: GlassCardProps) => {
  const Component = animate ? motion.div : "div";

  return (
    <Component
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass p-6 rounded-2xl overflow-hidden",
        hoverEffect && "glass-hover",
        className
      )}
    >
      {children}
    </Component>
  );
};

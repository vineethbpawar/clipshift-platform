"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Video } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RoleCardProps {
  role: "client" | "creator";
  isSelected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}

const icons = {
  client: User,
  creator: Video,
};

export const RoleCard = ({ role, isSelected, onSelect, title, description }: RoleCardProps) => {
  const Icon = icons[role];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "cursor-pointer p-6 rounded-2xl glass transition-all duration-300 relative overflow-hidden",
        isSelected ? "border-neon-purple ring-1 ring-neon-purple/50 bg-white/10" : "border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="role-glow"
          className="absolute inset-0 bg-neon-purple/5 blur-xl pointer-events-none"
        />
      )}
      
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
        isSelected ? "bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]" : "bg-white/5 text-gray-400"
      )}>
        <Icon size={24} />
      </div>

      <h3 className={cn(
        "text-lg font-bold mb-2 transition-colors",
        isSelected ? "text-white" : "text-gray-400"
      )}>
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-4 h-4 rounded-full bg-neon-purple flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

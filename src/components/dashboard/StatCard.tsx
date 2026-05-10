"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: "purple" | "blue" | "green";
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(0, { mass: 1, stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

export const StatCard = ({ title, value, prefix = "", suffix = "", icon: Icon, trend, color = "purple" }: StatCardProps) => {
  const colorMap = {
    purple: "text-neon-purple bg-neon-purple/10 border-neon-purple/20",
    blue: "text-neon-blue bg-neon-blue/10 border-neon-blue/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20"
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass border-white/5 p-6 rounded-3xl relative overflow-hidden group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${colorMap[color]} shadow-lg transition-all group-hover:scale-110`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`text-[10px] font-black uppercase tracking-widest ${trend.isUp ? "text-green-500" : "text-red-500"}`}>
            {trend.isUp ? "+" : "-"}{trend.value}%
          </div>
        )}
      </div>

      <div>
        <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">{title}</h4>
        <div className="text-3xl font-black text-white tracking-tighter">
          {prefix}<AnimatedNumber value={value} />{suffix}
        </div>
      </div>

      {/* Decorative Glow */}
      <div className={`absolute -bottom-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-20 ${
        color === "purple" ? "bg-neon-purple" : color === "blue" ? "bg-neon-blue" : "bg-green-500"
      }`} />
    </motion.div>
  );
};

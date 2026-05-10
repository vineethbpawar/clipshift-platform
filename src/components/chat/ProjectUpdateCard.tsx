"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Layers, RefreshCcw, CheckCircle2 } from "lucide-react";

export type ProjectUpdateType = "milestone_reached" | "delivery_sent" | "revision_requested";

export const ProjectUpdateCard = ({ type, title }: { type: ProjectUpdateType, title: string }) => {
  const config = {
    milestone_reached: {
      icon: <Layers className="text-neon-purple" />,
      label: "Milestone Reached",
      color: "border-neon-purple/30",
      bg: "bg-neon-purple/5"
    },
    delivery_sent: {
      icon: <Zap className="text-neon-blue" />,
      label: "Delivery Sent",
      color: "border-neon-blue/30",
      bg: "bg-neon-blue/5"
    },
    revision_requested: {
      icon: <RefreshCcw className="text-yellow-500" />,
      label: "Revision Requested",
      color: "border-yellow-500/30",
      bg: "bg-yellow-500/5"
    }
  };

  const { icon, label, color, bg } = config[type];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`w-full max-w-sm mx-auto my-6 glass border ${color} ${bg} rounded-3xl p-6 relative overflow-hidden`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</h4>
          <h3 className="text-sm font-black text-white uppercase tracking-tighter">{title}</h3>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all">
          View Details
        </button>
        {type === "delivery_sent" && (
          <button className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Approve
          </button>
        )}
      </div>

      {/* Decorative pulse */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 blur-3xl rounded-full" />
    </motion.div>
  );
};

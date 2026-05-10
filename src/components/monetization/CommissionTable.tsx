"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Info } from "lucide-react";

export const CommissionTable = () => {
  const commissions = [
    { duration: "Under 12 hours", fee: "4.0%", label: "Priority" },
    { duration: "24 hours", fee: "3.0%", label: "Express" },
    { duration: "48 hours", fee: "2.0%", label: "Standard" },
    { duration: "3 - 5 days", fee: "1.0%", label: "Economy" },
    { duration: "7+ days", fee: "0.5%", label: "Saver" }
  ];

  return (
    <div className="glass border-white/5 rounded-3xl p-8 overflow-hidden relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple">
          <Clock size={18} />
        </div>
        <div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm">Commission Breakdown</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fees based on delivery speed</p>
        </div>
      </div>

      <div className="space-y-3">
        {commissions.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all cursor-default"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{item.duration}</span>
              <span className="px-2 py-0.5 bg-white/5 text-[8px] font-black uppercase tracking-widest text-gray-600 rounded-md group-hover:bg-neon-purple/20 group-hover:text-neon-purple transition-all">
                {item.label}
              </span>
            </div>
            <div className="text-sm font-black text-white font-mono">{item.fee}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
        <Info size={16} className="text-gray-600 shrink-0" />
        <p className="text-[9px] text-gray-600 leading-relaxed font-bold uppercase tracking-widest">
          Commission is deducted from the final payout. Speed matters — faster delivery increases platform utilization and attracts priority clients.
        </p>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 blur-3xl rounded-full -z-10" />
    </div>
  );
};

"use client";

import React from "react";
import { Unlock } from "lucide-react";
import { motion } from "framer-motion";

export const UnlockBadge = () => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full text-[8px] font-black text-green-500 uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.1)]"
    >
      <Unlock size={10} />
      Unlocked
    </motion.div>
  );
};

"use client";

import React from "react";
import { motion } from "framer-motion";

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ y: 0 }}
          animate={{ y: [-2, 2, -2] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className="w-1.5 h-1.5 bg-neon-purple rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
        />
      ))}
      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Typing</span>
    </div>
  );
};

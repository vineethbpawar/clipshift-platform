"use client";

import React from "react";
import { motion } from "framer-motion";

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  isError?: boolean;
}

export const UploadProgress = ({ progress, fileName, isError }: UploadProgressProps) => {
  return (
    <div className="w-full space-y-2 py-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[200px]">
          {isError ? "Transmission Failed" : fileName || "Uploading Node..."}
        </span>
        <span className="text-[10px] font-mono text-neon-purple">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${isError ? "bg-red-500" : "bg-gradient-to-r from-neon-purple to-neon-blue"} shadow-[0_0_10px_rgba(168,85,247,0.5)]`}
        />
        {progress > 0 && progress < 100 && !isError && (
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}
      </div>
    </div>
  );
};

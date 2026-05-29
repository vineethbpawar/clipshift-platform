"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  isError?: boolean;
}

export const UploadProgress = ({ progress, fileName, isError }: UploadProgressProps) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3 min-w-0">
          {isError ? (
            <AlertCircle size={16} className="text-red-500 shrink-0" />
          ) : progress === 100 ? (
            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          ) : (
            <Loader2 size={16} className="text-neon-purple animate-spin shrink-0" />
          )}
          <span className="text-[10px] font-black text-white uppercase tracking-widest truncate italic">
            {isError ? "Transmission Failed" : fileName || "Processing File..."}
          </span>
        </div>
        <span className="text-[10px] font-mono text-neon-purple font-black">{Math.round(progress)}%</span>
      </div>

      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)] ${isError ? "bg-red-500" : "bg-gradient-to-r from-neon-purple to-neon-blue"}`}
        />
      </div>
      
      <div className="flex justify-center">
         <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] italic opacity-60">
            {progress < 100 ? "Syncing data to professional cloud storage" : "Upload finalized successfully"}
         </p>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { X, Play, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FilePreviewProps {
  url: string;
  type: 'image' | 'video';
  onRemove?: () => void;
  className?: string;
}

export const FilePreview = ({ url, type, onRemove, className = "" }: FilePreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl overflow-hidden glass border border-white/10 ${className}`}
    >
      {type === 'image' ? (
        <img src={url} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <div className="relative w-full h-full">
          <video src={url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Play className="text-white fill-white" size={24} />
          </div>
        </div>
      )}
      
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors z-10"
        >
          <X size={14} />
        </button>
      )}

      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
        {type === 'image' ? <ImageIcon size={10} /> : <Play size={10} />}
        {type.toUpperCase()} VERIFIED
      </div>
    </motion.div>
  );
};

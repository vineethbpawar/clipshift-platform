"use client";

import React from "react";
import { X, Play, Image as ImageIcon, FileText, Package } from "lucide-react";
import { motion } from "framer-motion";

interface FilePreviewProps {
  url: string;
  type: 'image' | 'video' | 'pdf' | 'zip';
  onRemove?: () => void;
  className?: string;
}

export const FilePreview = ({ url, type, onRemove, className = "" }: FilePreviewProps) => {
  const renderContent = () => {
    switch (type) {
      case 'image':
        return <img src={url} alt="Preview" className="w-full h-full object-cover" />;
      case 'video':
        return (
          <div className="relative w-full h-full">
            <video src={url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Play className="text-white fill-white" size={24} />
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-white/5">
            <FileText className="text-neon-blue" size={32} />
            <span className="text-[8px] font-black text-gray-400 uppercase">PDF Document</span>
          </div>
        );
      case 'zip':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-white/5">
            <Package className="text-neon-purple" size={32} />
            <span className="text-[8px] font-black text-gray-400 uppercase">Zip Archive</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'image': return <ImageIcon size={10} />;
      case 'video': return <Play size={10} />;
      case 'pdf': return <FileText size={10} />;
      case 'zip': return <Package size={10} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl overflow-hidden glass border border-white/10 ${className}`}
    >
      {renderContent()}
      
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors z-10"
        >
          <X size={14} />
        </button>
      )}

      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1">
        {getIcon()}
        {type.toUpperCase()} VERIFIED
      </div>
    </motion.div>
  );
};

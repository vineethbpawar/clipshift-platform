"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Video, Trash2, CheckCircle2 } from "lucide-react";
import { uploadFile } from "@/lib/storage";
import { UploadProgress } from "../storage/UploadProgress";
import { FilePreview } from "../storage/FilePreview";
import { useAuth } from "@/context/AuthContext";
import { getActivePlan, getPortfolioUploadLimit } from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "react-hot-toast";

export const PortfolioUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePlan = getActivePlan(user as any);
  const limitValue = getPortfolioUploadLimit(activePlan);
  const limit = limitValue === 'unlimited' ? Infinity : limitValue;

  useEffect(() => {
    const fetchCount = async () => {
      if (!user) return;
      const { count } = await supabase
        .from('portfolio_items')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id);
      
      setItemCount(count || 0);
    };
    fetchCount();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (itemCount >= limit) {
      toast.error(`You have reached your limit of ${limit} portfolio items on the ${activePlan} plan.`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Cinematic node exceeds 50MB limit.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const url = await uploadFile(file, 'portfolios', (p) => setProgress(p));
      setVideoUrl(url);
    } catch (error: any) {
      toast.error("Transmission failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-[40px] border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Portfolio Transmitter</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            {limit === Infinity ? 'Unlimited storage enabled' : `Usage: ${itemCount} / ${limit} Node Slots`}
          </p>
        </div>
        <Video size={24} className="text-neon-blue opacity-50" />
      </div>

      <div className="space-y-6">
        {itemCount >= limit ? (
          <div className="p-8 border-2 border-dashed border-red-500/20 rounded-3xl text-center bg-red-500/5">
            <p className="text-xs font-black text-white uppercase tracking-widest mb-4">Transmission Limit Reached</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Upgrade your node protocol to expand storage capacity.</p>
            <Link href="/pricing">
              <button className="px-8 py-3 rounded-xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                Upgrade Protocol
              </button>
            </Link>
          </div>
        ) : !videoUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-48 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-neon-blue/50 transition-all group relative overflow-hidden"
          >
            <Upload className="text-gray-500 group-hover:text-neon-blue mb-4 transition-colors" size={32} />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Upload Cinematic Reel (MP4/MOV)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/*" 
              onChange={handleUpload} 
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-8">
                <UploadProgress progress={progress} fileName="Syncing Node..." />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <FilePreview url={videoUrl} type="video" className="h-64 w-full" onRemove={() => setVideoUrl(null)} />
            <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
              <CheckCircle2 className="text-green-500" size={18} />
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">Node Successfully Synchronized</p>
            </div>
            <button 
              className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-neon-blue hover:text-white transition-all"
              onClick={() => {/* Save to DB logic would go here */}}
            >
              Update Global Portfolio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

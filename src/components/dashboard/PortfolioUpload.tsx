"use client";

import React, { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { UploadProgress } from "../storage/UploadProgress";
import Link from "next/link";

export const PortfolioUpload = () => {
  const { user, activePlan } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const getLimit = (plan: string) => {
    switch (plan) {
      case 'creator_premium': return Infinity;
      case 'creator_pro': return 50;
      default: return 10;
    }
  };

  const limit = getLimit(activePlan);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (itemCount >= limit) {
      toast.error("Portfolio limit reached. Upgrade your plan to add more items.");
      return;
    }

    if (file.size > 50 * 1024 * 60) {
      toast.error("File exceeds 50MB limit.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('creator_portfolio')
        .insert({
          creator_id: user.id,
          title: file.name,
          url: publicUrl,
          file_type: file.type,
          file_size: file.size
        });

      if (dbError) throw dbError;

      toast.success("Item added to portfolio!");
      setItemCount(prev => prev + 1);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error("Upload failed: " + errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01] flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Your Portfolio</h3>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">
            {limit === Infinity ? 'Unlimited storage active' : `Usage: ${itemCount} / ${limit} Slots`}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple">
           <ImageIcon size={20} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px] p-10 group hover:border-neon-purple/30 transition-all bg-black/20">
        {uploading ? (
          <div className="w-full max-w-xs space-y-6">
            <UploadProgress progress={progress} fileName="Syncing File..." />
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-neon-purple/10 border border-white/5">
              <Upload size={32} className="text-gray-500 group-hover:text-neon-purple transition-colors" />
            </div>
            <input type="file" className="hidden" onChange={handleFile} accept="video/*,image/*" />
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 italic">Drop your work here</h4>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest max-w-[200px]">Images or Videos up to 50MB</p>
          </label>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5">
        {limit !== Infinity && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest text-center sm:text-left leading-relaxed opacity-60">
              Upgrade your plan to expand storage capacity and unlock AI insights.
            </p>
            <Link href="/pricing" className="shrink-0">
              <button className="px-6 py-3 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20 text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all active:scale-95">
                Upgrade Plan
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

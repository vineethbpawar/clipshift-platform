"use client";

import React, { useState, useRef } from "react";
import { FloatingInput } from "../../ui/FloatingInput";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Camera, Link2, Languages } from "lucide-react";
import { UploadProgress } from "../../storage/UploadProgress";

export const Step4Profile = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
  const { signupData, updateSignupData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [localData, setLocalData] = useState({
    instagram: signupData.instagram || "",
    portfolio: signupData.portfolio || "",
    languages: signupData.languages || "",
    bio: signupData.bio || "",
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(signupData.profileImage || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB node limit.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { uploadFile } = await import("@/lib/storage");
      const fileData = await uploadFile(file, 'avatars', signupData.email || 'guest', (p) => setProgress(p));
      setImagePreview(fileData.file_url);
    } catch (error) {
      const err = error as Error;
      alert("Transmission failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      alert("Transmission in progress. Please wait for node sync.");
      return;
    }
    updateSignupData({ ...localData, profileImage: imagePreview || undefined });
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Cinematic Profile</h2>
        <p className="text-gray-400">Personalize how the world sees your talent</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-center mb-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-32 rounded-full glass border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer group hover:border-neon-purple transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-500 group-hover:text-neon-purple">
                <Camera size={32} className="mb-1" />
                <span className="text-[10px] uppercase font-bold">Upload</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-xs font-bold">Change</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest">Profile Image (Circular Preview)</p>
          {uploading && (
            <div className="w-full max-w-[200px]">
              <UploadProgress progress={progress} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
              <FloatingInput
                label="Instagram Handle"
                name="instagram"
                value={localData.instagram}
                onChange={handleChange}
                className="pl-12"
              />
            </div>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
              <FloatingInput
                label="Portfolio Link"
                name="portfolio"
                value={localData.portfolio}
                onChange={handleChange}
                className="pl-12"
              />
            </div>
            <div className="relative">
              <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
              <FloatingInput
                label="Languages (e.g. English, Hindi)"
                name="languages"
                value={localData.languages}
                onChange={handleChange}
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative glass border-white/10 rounded-xl p-4 h-[180px]">
              <label className="text-[12px] text-neon-purple font-bold uppercase tracking-widest mb-2 block">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={localData.bio}
                onChange={handleChange}
                placeholder="Tell us about your cinematic vision..."
                className="w-full bg-transparent text-white outline-none resize-none h-[120px] placeholder:text-gray-600"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12 gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-4 rounded-full border border-white/10 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex-1 px-12 py-4 rounded-full bg-neon-purple text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            Finalize Profile
          </motion.button>
        </div>
      </form>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingInput } from "../ui/FloatingInput";
import { NeonButton } from "../ui/NeonButton";
import { MapPin, Upload, Calendar, DollarSign, Users, Info, Loader2, Sparkles } from "lucide-react";
import { UploadProgress } from "../storage/UploadProgress";
import { FilePreview } from "../storage/FilePreview";
import { uploadFile } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { estimatePrice } from "@/lib/gemini";

const ProjectLocationMap = dynamic(() => import("../map/projects/ProjectLocationMap"), { ssr: false });

export const ProjectPostForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Wedding");
  const [radius, setRadius] = useState(20);
  const [locations, setLocations] = useState<any[]>([]);
  const [rateType, setRateType] = useState("Per Project");
  const [offeredRate, setOfferedRate] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{url: string, type: 'image' | 'video'}[]>([]);

  const [aiEstimate, setAiEstimate] = useState<any>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const getEstimate = async () => {
    if (!title || !description) return;
    setIsEstimating(true);
    try {
      const result = await estimatePrice({ title, description, category });
      setAiEstimate(result);
    } catch (error) {
      console.error("Estimation failed:", error);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} exceeds 50MB node limit.`);
        continue;
      }

      setCurrentFileName(file.name);
      setProgress(0);

      try {
        const url = await uploadFile(file, 'project-files', (p) => setProgress(p));
        setUploadedFiles(prev => [...prev, { 
          url, 
          type: file.type.startsWith('video') ? 'video' : 'image' 
        }]);
      } catch (error: any) {
        alert(`Transmission failed for ${file.name}: ` + error.message);
      }
    }

    setUploading(false);
    setProgress(0);
    setCurrentFileName("");
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    setError(null);
    setSuccess(false);

    if (!title) {
      setError("Please provide a project title.");
      return;
    }

    if (!description) {
      setError("Please provide a project description.");
      return;
    }

    setSubmitting(true);
    console.log("Submitting project:", { 
      title, 
      description, 
      category, 
      radius, 
      locations, 
      rateType, 
      offeredRate,
      uploadedFiles 
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("You must be logged in to post a project.");
        setSubmitting(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          category,
          shoot_radius: isShoot ? radius : null,
          locations: locations,
          rate_type: isShoot ? rateType : null,
          budget: offeredRate || "Negotiable",
          files: uploadedFiles,
          client_id: session.user.id,
          status: 'open'
        })
        .select();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }

      console.log("Project submitted successfully:", data);
      setSuccess(true);
      // Reset form
      setTitle("");
      setDescription("");
      setUploadedFiles([]);
      setLocations([]);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Failed to deploy project request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["Wedding", "YouTube", "Reels", "Drone", "Corporate", "Events", "Fashion", "Gaming", "Podcast", "Shoot"];
  const isShoot = category === "Drone" || category === "Events" || category === "Shoot";

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Post a <span className="text-neon-purple">Project</span></h1>
            <p className="text-gray-400">Define your vision and connect with elite creators.</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
                Project deployed successfully! Creators will be notified soon.
              </div>
            )}

            <div className="glass p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Project Identity</h4>
              <div className="space-y-4">
                <FloatingInput 
                  label="Project Title" 
                  placeholder="e.g. Urban Night Life Music Video" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-4">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-colors appearance-none"
                    >
                      {categories.map(cat => <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-4">Urgency</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-colors appearance-none">
                      <option className="bg-zinc-900">Standard</option>
                      <option className="bg-zinc-900">Urgent (48h)</option>
                      <option className="bg-zinc-900">High Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isShoot && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass p-6 rounded-3xl border-white/5 overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] text-neon-blue uppercase font-black tracking-widest">Rate & Payment Terms</h4>
                    <button 
                      onClick={getEstimate}
                      disabled={isEstimating || !title || !description}
                      className="text-[8px] font-black text-neon-purple uppercase tracking-widest flex items-center gap-1 hover:underline disabled:opacity-30"
                    >
                      {isEstimating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      AI Estimate
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <FloatingInput 
                      label="Offered Rate (₹)" 
                      type="number" 
                      value={offeredRate}
                      onChange={(e) => setOfferedRate(e.target.value)}
                    />
                    <select 
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-colors appearance-none"
                    >
                      <option className="bg-zinc-900">Per Hour</option>
                      <option className="bg-zinc-900">Half Day</option>
                      <option className="bg-zinc-900">Full Day</option>
                      <option className="bg-zinc-900">Per Project</option>
                    </select>
                  </div>

                  {aiEstimate && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-neon-purple/5 border border-neon-purple/20 rounded-2xl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Recommended Range</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                          aiEstimate.badge === "Fair" ? "bg-green-500/20 text-green-500" :
                          aiEstimate.badge === "Above Market" ? "bg-neon-blue/20 text-neon-blue" :
                          "bg-neon-purple/20 text-neon-purple"
                        }`}>
                          {aiEstimate.badge}
                        </span>
                      </div>
                      <div className="text-sm font-black text-white mb-1">{aiEstimate.recommended_budget}</div>
                      <p className="text-[9px] text-gray-400 italic">"{aiEstimate.market_comparison}"</p>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs text-gray-300">Negotiable</span>
                    <input type="checkbox" className="accent-neon-purple w-4 h-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="glass p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Project Brief</h4>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your creative requirements..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-purple transition-colors resize-none mb-4"
              />
              
              <div className="space-y-4">
                <input 
                  type="file" 
                  id="project-footage"
                  multiple
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept="video/*,image/*"
                />
                <label 
                  htmlFor="project-footage"
                  className="flex items-center gap-4 p-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-neon-purple/50 transition-colors cursor-pointer group"
                >
                  <Upload className="text-gray-500 group-hover:text-neon-purple transition-colors" />
                  <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                    {uploading ? "Transmitting Node..." : "Upload Reference Videos / Footage"}
                  </span>
                </label>

                {uploading && (
                  <UploadProgress progress={progress} fileName={currentFileName} />
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {uploadedFiles.map((file, i) => (
                    <FilePreview 
                      key={i} 
                      url={file.url} 
                      type={file.type} 
                      className="aspect-square"
                      onRemove={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <NeonButton 
              variant="purple" 
              className="w-full py-5 text-sm tracking-[0.2em] disabled:opacity-50"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Deploying...
                </div>
              ) : "Deploy Project Request"}
            </NeonButton>
          </div>
        </div>

        {/* Right Column: Location & Mapping */}
        <div className="space-y-8">
          <div className="glass rounded-[40px] overflow-hidden border border-white/5 relative h-[600px] group">
            <ProjectLocationMap 
              locations={locations} 
              setLocations={setLocations} 
              radius={radius} 
            />
            
            {/* Map Controls Overlay */}
            <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex flex-col gap-4">
              <div className="glass p-4 rounded-2xl border-white/10 pointer-events-auto max-w-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Shoot Radius</span>
                  <span className="text-[10px] font-mono text-neon-purple">{radius}km</span>
                </div>
                <input 
                  type="range" 
                  min="5" max="100" 
                  value={radius} 
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                />
              </div>

              {locations.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-4 rounded-2xl border-white/10 pointer-events-auto"
                >
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MapPin size={12} className="text-neon-blue" />
                    Target Locations ({locations.length})
                  </h5>
                  <div className="space-y-2">
                    {locations.map((loc, i) => (
                      <div key={i} className="text-[10px] text-gray-400 flex items-center justify-between">
                        <span>{loc.name}</span>
                        <span className="text-neon-purple font-mono">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Nearby Creators Badge */}
            <div className="absolute bottom-6 right-6 z-10">
              <div className="glass px-4 py-2 rounded-full border-neon-purple/30 flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Users size={14} className="text-neon-purple" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  ~12 Creators Nearby
                </span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 flex gap-4">
            <Info className="text-neon-blue shrink-0" size={20} />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              For shoot-based projects, only verified videographers within your selected radius will be notified. This ensures rapid response and local expertise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

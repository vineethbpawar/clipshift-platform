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
import { Crosshair } from "lucide-react";
import { detectLocation } from "@/lib/geolocation";
import { toast } from "react-hot-toast";

const ProjectLocationMap = dynamic(() => import("../map/projects/ProjectLocationMap"), { ssr: false });

export const ProjectPostForm = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Wedding");
  const [serviceType, setServiceType] = useState<"editing_only" | "editing_and_shoot">("editing_only");
  const [radius, setRadius] = useState(20);
  const [locations, setLocations] = useState<any[]>([]);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const data = await detectLocation();
      const newLoc = { 
        lat: data.lat, 
        lng: data.lng, 
        name: data.area || data.city || "Current Location" 
      };
      setLocations([...locations, newLoc]);
      toast.success("Location detected!");
    } catch (error: any) {
      toast.error(error.message || "Failed to detect location");
    } finally {
      setIsDetecting(false);
    }
  };
  
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly' | 'negotiable'>("fixed");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  
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
    
    let budgetSummary = "Negotiable";
    let bMin = null;
    let bMax = null;

    if (budgetType === 'fixed') {
      budgetSummary = `₹${minBudget} - ₹${maxBudget}`;
      bMin = parseInt(minBudget) || null;
      bMax = parseInt(maxBudget) || null;
    } else if (budgetType === 'hourly') {
      budgetSummary = `₹${hourlyRate}/hr`;
      bMin = parseInt(hourlyRate) || null;
    }

    console.log("Submitting project:", { 
      title, 
      description, 
      category, 
      radius, 
      locations, 
      budgetType,
      budgetSummary,
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
          client_id: session.user.id,
          title: title,
          description: description,
          category: category,
          status: 'open',
          shoot_radius: radius || null,
          locations: locations || [],
          files: uploadedFiles || [],
          service_type: serviceType,
          budget_type: budgetType,
          budget_min: bMin,
          budget_max: bMax,
          budget: budgetSummary
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
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-4">Service Type</label>
                    <select 
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-neon-purple transition-colors appearance-none"
                    >
                      <option value="editing_only" className="bg-zinc-900">Editing Only</option>
                      <option value="editing_and_shoot" className="bg-zinc-900">Editing & Shoot</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Project Brief</h4>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your creative requirements..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-purple transition-colors resize-none mb-6"
              />

              {/* Budget Section */}
              <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="text-[10px] text-neon-purple uppercase font-black tracking-widest">Budget Configuration</h5>
                  <button 
                    onClick={getEstimate}
                    disabled={isEstimating || !title || !description}
                    className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-white disabled:opacity-30"
                  >
                    {isEstimating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    AI Market Estimate
                  </button>
                </div>

                <div className="flex p-1 bg-black/40 rounded-xl mb-6">
                  {(['fixed', 'hourly', 'negotiable'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setBudgetType(type)}
                      className={`relative flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${
                        budgetType === type ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {budgetType === type && (
                        <motion.div
                          layoutId="budget-tab"
                          className="absolute inset-0 bg-neon-purple/20 border border-neon-purple/50 rounded-lg -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {type === 'fixed' ? 'Fixed Price' : type === 'hourly' ? 'Hourly Rate' : 'Negotiable'}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {budgetType === 'fixed' && (
                    <motion.div
                      key="fixed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FloatingInput 
                        label="Min Budget (₹)" 
                        type="number" 
                        placeholder="e.g. ₹5000"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                      />
                      <FloatingInput 
                        label="Max Budget (₹)" 
                        type="number" 
                        placeholder="e.g. ₹10000"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                      />
                    </motion.div>
                  )}

                  {budgetType === 'hourly' && (
                    <motion.div
                      key="hourly"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FloatingInput 
                        label="Rate/hr (₹)" 
                        type="number" 
                        placeholder="e.g. ₹500"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                      />
                      <FloatingInput 
                        label="Est. Hours" 
                        type="number" 
                        placeholder="e.g. 10"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                      />
                    </motion.div>
                  )}

                  {budgetType === 'negotiable' && (
                    <motion.div
                      key="negotiable"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="py-4 text-center border border-dashed border-white/10 rounded-xl"
                    >
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Budget will be discussed with the creator
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {aiEstimate && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-neon-purple/5 border border-neon-purple/20 rounded-2xl"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">AI Market Pulse</span>
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
              </div>
              
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
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="pointer-events-auto flex items-center justify-center space-x-2 px-6 py-4 rounded-xl glass border-white/10 text-neon-purple font-bold uppercase tracking-widest text-[10px] hover:bg-neon-purple/10 hover:border-neon-purple/50 transition-all group shadow-[0_0_20px_rgba(168,85,247,0)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] max-w-xs"
              >
                {isDetecting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Crosshair size={14} className="group-hover:scale-110 transition-transform" />
                )}
                <span>{isDetecting ? "Detecting..." : "Detect My Location"}</span>
              </button>

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

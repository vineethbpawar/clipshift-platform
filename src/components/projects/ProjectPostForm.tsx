"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingInput } from "../ui/FloatingInput";
import { NeonButton } from "../ui/NeonButton";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { estimateBudgetAI } from "@/lib/gemini";

export const ProjectPostForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Social Media",
    budget: "",
    deadline: "",
    service_type: "editing_only" as "editing_only" | "editing_and_shoot",
    location_mode: "anywhere_india" as "anywhere_india" | "preferred_location",
    location: "",
    file_url: "",
    file_name: "",
    file_type: "",
    file_size: 0
  });

  const categories = ["Social Media", "Commercial", "Music Video", "Short Film", "Documentary"];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File exceeds 100MB limit.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `projects/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath);

      setFormData({
        ...formData,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      });
      toast.success("File attached successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleEstimateBudget = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please enter project title and description first.");
      return;
    }
    
    setEstimating(true);
    setAiEstimate(null);
    
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      serviceType: formData.service_type,
      deadline: formData.deadline,
      budget: formData.budget
    };

    console.log("AI BUDGET REQUEST", payload);
    
    try {
      const result = await estimateBudgetAI(payload as any);
      console.log("AI BUDGET RESPONSE", result);
      
      if (result.error) {
        toast.error("AI suggestion failed. You can still enter budget manually.");
      } else {
        setAiEstimate(result);
        toast.success("AI Estimate generated!");
      }
    } catch (err) {
      console.error("AI BUDGET ERROR", err);
      toast.error("AI suggestion failed. You can still enter budget manually.");
    } finally {
      setEstimating(false);
    }
  };

  const applyAiEstimate = () => {
    if (!aiEstimate) return;
    setFormData({
      ...formData,
      budget: aiEstimate.minBudget.toString()
    });
    setAiEstimate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.description || !formData.budget || !formData.deadline) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('projects').insert({
        client_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: Number(formData.budget),
        deadline: formData.deadline,
        service_type: formData.service_type,
        location_mode: formData.location_mode,
        location: formData.location,
        file_url: formData.file_url,
        file_name: formData.file_name,
        file_type: formData.file_type,
        file_size: formData.file_size,
        status: 'open'
      });

      if (error) throw error;
      toast.success("Project posted successfully!");
      router.push("/projects");
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error("Failed to post project: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Basic Info */}
      <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5 bg-white/[0.01] space-y-8">
        <div className="flex items-center gap-3 mb-2 px-2">
           <FileText size={18} className="text-neon-purple" />
           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">General Information</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Project Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Cinematic Travel Reel for Instagram"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all italic shadow-inner"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Detailed Description</label>
            <textarea 
              required
              placeholder="Describe your vision, specific requirements, and desired mood..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-[32px] py-6 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all resize-none italic shadow-inner"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Category</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all appearance-none cursor-pointer italic"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Service Type</label>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, service_type: 'editing_only'})}
                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.service_type === 'editing_only' ? 'bg-neon-purple text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                   >
                     Edit Only
                   </button>
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, service_type: 'editing_and_shoot'})}
                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.service_type === 'editing_and_shoot' ? 'bg-neon-purple text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                   >
                     Shoot & Edit
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Budget & Timeline */}
      <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5 bg-white/[0.01] space-y-8">
        <div className="flex items-center justify-between gap-3 mb-2 px-2">
           <div className="flex items-center gap-3">
             <DollarSign size={18} className="text-neon-blue" />
             <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Budget & Timeline</h3>
           </div>
           
           <button 
            type="button"
            onClick={handleEstimateBudget}
            disabled={estimating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[9px] font-black uppercase tracking-widest hover:bg-neon-purple/20 transition-all disabled:opacity-50"
           >
             {estimating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
             Estimate Budget with AI
           </button>
        </div>

        {aiEstimate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-neon-purple/5 border border-neon-purple/20 space-y-4"
          >
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[9px] text-neon-purple font-black uppercase tracking-widest mb-1">AI Suggestion</p>
                 <h4 className="text-lg font-black text-white italic">₹{aiEstimate.minBudget} - ₹{aiEstimate.maxBudget}</h4>
               </div>
               <div className="text-right">
                 <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Recommended Timeline</p>
                 <p className="text-xs font-bold text-white uppercase">{aiEstimate.timeline}</p>
               </div>
             </div>
             <div className="space-y-1">
               <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Why this estimate?</p>
               <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">&quot;{aiEstimate.explanation}&quot;</p>
             </div>
             <button 
              type="button"
              onClick={applyAiEstimate}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
             >
               Apply Suggestion
             </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Agreed Budget (₹)</label>
            <div className="relative">
               <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
               <input 
                 required
                 type="number" 
                 placeholder="0.00"
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-sm text-white outline-none focus:border-neon-blue transition-all italic shadow-inner"
                 value={formData.budget}
                 onChange={(e) => setFormData({...formData, budget: e.target.value})}
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Completion Deadline</label>
            <div className="relative">
               <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
               <input 
                 required
                 type="date" 
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-sm text-white outline-none focus:border-neon-blue transition-all italic shadow-inner appearance-none"
                 value={formData.deadline}
                 onChange={(e) => setFormData({...formData, deadline: e.target.value})}
               />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5 bg-white/[0.01] space-y-8">
        <div className="flex items-center gap-3 mb-2 px-2">
           <MapPin size={18} className="text-green-500" />
           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Location Preferences</h3>
        </div>

        <div className="space-y-8">
           <div className="flex flex-wrap gap-3">
              {[
                { id: 'anywhere_india', label: 'Remote / Anywhere' },
                { id: 'preferred_location', label: 'Specific City' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setFormData({...formData, location_mode: mode.id as "anywhere_india" | "preferred_location"})}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    formData.location_mode === mode.id 
                    ? 'bg-green-500/10 border-green-500 text-green-500 shadow-lg' 
                    : 'glass border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
           </div>

           {formData.location_mode === 'preferred_location' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4">Target City</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mumbai, Delhi, Bangalore"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-green-500 transition-all italic shadow-inner"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </motion.div>
           )}
        </div>
      </div>

      {/* Assets */}
      <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5 bg-white/[0.01] space-y-8">
        <div className="flex items-center gap-3 mb-2 px-2">
           <Upload size={18} className="text-neon-purple" />
           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Project Assets</h3>
        </div>

        <div className="border-2 border-dashed border-white/5 rounded-[32px] p-10 group hover:border-neon-purple/20 transition-all bg-black/20 text-center">
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-neon-purple" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Uploading File...</p>
            </div>
          ) : formData.file_url ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                 <CheckCircle2 size={32} />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest mb-1 italic">{formData.file_name}</p>
              <button 
                type="button"
                onClick={() => setFormData({...formData, file_url: "", file_name: ""})}
                className="text-[9px] text-red-500 uppercase font-black tracking-widest hover:underline mt-4"
              >
                Remove File
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center">
               <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-neon-purple/10 border border-white/5 transition-all">
                  <Plus size={24} className="text-gray-500 group-hover:text-neon-purple transition-colors" />
               </div>
               <input type="file" className="hidden" onChange={handleFileUpload} />
               <span className="text-sm font-black text-white uppercase tracking-widest mb-2 italic">Attach reference file</span>
               <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Images, PDFs or Videos (Max 100MB)</p>
            </label>
          )}
        </div>
      </div>

      <div className="pt-6">
        <button 
          disabled={loading || uploading}
          className="w-full py-6 bg-white text-black rounded-[28px] font-black uppercase tracking-[0.3em] text-[12px] hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <><Briefcase size={20} /> Create Project Listing</>}
        </button>
      </div>
    </form>
  );
};

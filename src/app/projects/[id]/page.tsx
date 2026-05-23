"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { sanitizeDescription } from "@/lib/sanitizer";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({ coverLetter: "", budget: "", days: "" });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setSubmitting(true);
    const { error } = await supabase.from('projects').delete().eq('id', params.id);
    if (error) {
      toast.error("Failed to delete project");
    } else {
      toast.success("Project deleted");
      router.push("/dashboard/client");
    }
    setSubmitting(false);
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) return;
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*, profiles(full_name)')
        .eq('id', params.id)
        .maybeSingle();

      if (projErr || !projData) {
        console.error("Failed to fetch project:", projErr);
      } else {
        setProject(projData);
        const { data: unlockData } = await supabase
          .from('project_unlocks')
          .select('*')
          .eq('project_id', params.id)
          .eq('freelancer_id', user?.id)
          .eq('payment_status', 'paid')
          .maybeSingle();
        setIsUnlocked(!!unlockData);
      }
      setLoading(false);
    };
    if (user?.id) fetchProject();
  }, [params.id, user?.id]);

  const handleUnlock = async () => {
    if (user?.role !== "creator") {
      toast.error("Unauthorized. Only creators can unlock projects.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('project_unlocks').insert({
      project_id: params.id,
      freelancer_id: user?.id,
      payment_status: 'paid',
      unlocked_at: new Date().toISOString()
    });
    if (error) {
      toast.error("Failed to unlock.");
    } else {
      setIsUnlocked(true);
      toast.success("Contact unlocked!");
    }
    setSubmitting(false);
  };

  const handleProposalSubmit = async () => {
    if (user?.role !== "creator") {
      toast.error("Unauthorized. Only creators can submit proposals.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('proposals').insert({
      project_id: params.id,
      freelancer_id: user?.id,
      freelancer_role: user?.role,
      cover_letter: proposalData.coverLetter,
      proposed_budget: proposalData.budget,
      estimated_delivery_days: proposalData.days
    });
    if (error) {
      toast.error(error.message === "duplicate key value violates unique constraint" ? "You have already submitted a proposal." : "Failed to submit proposal.");
    } else {
      toast.success("Proposal submitted successfully!");
      setShowProposalModal(false);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;
  if (!project) return <div className="text-center pt-32 text-white">Project not found</div>;

  const isOwner = user?.id === project.client_id && user?.role === "client";
  console.log("Debug Auth:", { userId: user?.id, client: project.client_id, role: user?.role, isOwner });

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto pt-32 pb-20 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 text-xs uppercase tracking-widest font-bold">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="glass rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-tight">{project.title}</h1>
            <span className="px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-black text-neon-purple uppercase tracking-widest whitespace-nowrap">
              {project.category}
            </span>
          </div>
          
          <p className="text-sm sm:text-gray-400 mb-8 leading-relaxed">
            {isUnlocked ? project.description : sanitizeDescription(project.description)}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
            <div className="glass p-4 rounded-2xl border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget</div>
              <div className="text-xs sm:text-sm font-bold text-white">{project.budget}</div>
            </div>
            <div className="glass p-4 rounded-2xl border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Service Type</div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase">{project.service_type?.replace('_', ' ')}</div>
            </div>
            <div className="glass p-4 rounded-2xl border-white/5 col-span-2 sm:col-span-1">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Status</div>
              <div className="text-xs sm:text-sm font-bold text-neon-blue uppercase">{project.status}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {user?.role === 'creator' && (
              <>
                <button 
                  onClick={() => setShowProposalModal(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-neon-purple text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Submit Proposal
                </button>
                {!isUnlocked ? (
                  <button 
                    onClick={handleUnlock}
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-4 bg-neon-blue text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    Unlock Contact ₹99
                  </button>
                ) : (
                  <button className="w-full sm:w-auto px-8 py-4 bg-green-500 text-black rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                    Message Client
                  </button>
                )}
                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
                  Save Project
                </button>
              </>
            )}
            {isOwner && (
              <>
                <button onClick={() => router.push(`/projects/${project.id}/edit`)} className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Edit Project</button>
                <button onClick={() => router.push(`/dashboard/client/proposals`)} className="w-full sm:w-auto px-8 py-4 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all">View Proposals</button>
                <button onClick={handleDelete} className="w-full sm:w-auto px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-500/20 active:scale-95 transition-all">Delete Project</button>
              </>
            )}
          </div>
        </div>

        {showProposalModal && (
          <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              className="glass p-6 sm:p-8 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg border-t sm:border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase">Submit Proposal</h3>
                <button onClick={() => setShowProposalModal(false)} className="p-2"><X className="text-gray-500 hover:text-white"/></button>
              </div>
              <textarea 
                placeholder="Cover Letter" 
                className="w-full h-32 bg-white/5 p-4 rounded-2xl text-base text-white mb-4 outline-none focus:border-neon-purple transition-colors resize-none" 
                onChange={e => setProposalData({...proposalData, coverLetter: e.target.value})}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="Proposed Budget (₹)" 
                  className="w-full bg-white/5 p-4 rounded-2xl text-base text-white outline-none focus:border-neon-purple transition-colors" 
                  onChange={e => setProposalData({...proposalData, budget: e.target.value})}
                />
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="Delivery Days" 
                  className="w-full bg-white/5 p-4 rounded-2xl text-base text-white outline-none focus:border-neon-purple transition-colors" 
                  onChange={e => setProposalData({...proposalData, days: e.target.value})}
                />
              </div>
              <button 
                onClick={handleProposalSubmit} 
                disabled={submitting} 
                className="w-full py-5 bg-neon-purple text-white rounded-full font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Send Proposal"}
              </button>
              <div className="h-safe-area-bottom sm:hidden" />
            </motion.div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

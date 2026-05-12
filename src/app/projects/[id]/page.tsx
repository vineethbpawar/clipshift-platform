"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({ coverLetter: "", budget: "", days: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) return;
      console.log("Loading project details for ID:", params.id);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*, profiles(full_name)')
        .eq('id', params.id)
        .maybeSingle();

      if (error) {
        console.error("Query error:", error);
      } else {
        console.log("Project query result:", data);
        setProject(data);
      }
      setLoading(false);
    };

    fetchProject();
  }, [params.id]);

  const handleProposalSubmit = async () => {
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

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto pt-32 pb-20 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 text-xs uppercase tracking-widest font-bold">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="glass rounded-[40px] p-10 border border-white/5">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{project.title}</h1>
            <span className="px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-black text-neon-purple uppercase tracking-widest">
              {project.category}
            </span>
          </div>
          
          <p className="text-gray-400 mb-8 leading-relaxed">{project.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget</div>
              <div className="text-sm font-bold text-white">{project.budget}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Service Type</div>
              <div className="text-sm font-bold text-white uppercase">{project.service_type?.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Status</div>
              <div className="text-sm font-bold text-neon-blue uppercase">{project.status}</div>
            </div>
          </div>

          <div className="flex gap-4">
            {(user?.role === 'editor' || user?.role === 'videographer') && (
              <button 
                onClick={() => setShowProposalModal(true)}
                className="px-8 py-3 bg-neon-purple text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Submit Proposal
              </button>
            )}
            {user?.id === project.client_id && (
              <button className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                Edit Project
              </button>
            )}
          </div>
        </div>

        {showProposalModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="glass p-8 rounded-3xl w-full max-w-lg border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase">Submit Proposal</h3>
                <button onClick={() => setShowProposalModal(false)}><X className="text-gray-500 hover:text-white"/></button>
              </div>
              <textarea placeholder="Cover Letter" className="w-full bg-white/5 p-4 rounded-2xl text-sm text-white mb-4" onChange={e => setProposalData({...proposalData, coverLetter: e.target.value})}/>
              <input type="number" placeholder="Proposed Budget (₹)" className="w-full bg-white/5 p-4 rounded-2xl text-sm text-white mb-4" onChange={e => setProposalData({...proposalData, budget: e.target.value})}/>
              <input type="number" placeholder="Delivery Days" className="w-full bg-white/5 p-4 rounded-2xl text-sm text-white mb-6" onChange={e => setProposalData({...proposalData, days: e.target.value})}/>
              <button onClick={handleProposalSubmit} disabled={submitting} className="w-full py-4 bg-neon-purple text-white rounded-full font-black uppercase hover:opacity-90">
                {submitting ? "Submitting..." : "Send Proposal"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

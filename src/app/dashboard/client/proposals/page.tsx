"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase, getStoredSession } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  CheckCircle2, 
  User,
  ExternalLink,
  MessageSquare,
  Target
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Proposal {
  id: string;
  project_id: string;
  freelancer_id: string;
  status: string;
  cover_letter: string;
  proposed_budget: number;
  estimated_days: number;
  project?: {
    id: string;
    title: string;
    client_id: string;
    status: string;
  };
  creator?: {
    full_name: string;
    avatar_url: string;
    specialization: string;
  };
}

export default function ClientProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const fetchProposals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects!inner(id, title, client_id, status),
          creator:profiles!proposals_freelancer_id_fkey(full_name, avatar_url, specialization)
        `)
        .eq('project.client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data as unknown as Proposal[]) || []);
    } catch (err: unknown) {
      console.error("Error fetching client proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      Promise.resolve().then(() => fetchProposals());
    } else if (!user) {
      Promise.resolve().then(() => setLoading(false));
    }
  }, [user?.id]);

  const handleAction = async (proposal: Proposal, actionStatus: 'accepted' | 'rejected') => {
    setLoading(true);
    try {
      // 1. Force Session Restoration
      const { data: sessionData } = await supabase.auth.getSession();
      let activeSession = sessionData.session;

      if (!activeSession) {
        const stored = getStoredSession();
        if (stored?.access_token) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: stored.access_token,
            refresh_token: stored.refresh_token,
          });
          if (sessionError) throw sessionError;
          activeSession = data.session;
        }
      }

      if (!activeSession) {
        toast.error("Your session expired. Please login again.");
        return;
      }

      if (actionStatus === 'accepted') {
        // 2. Update selected proposal
        const { error: propUpdateErr } = await supabase
          .from('proposals')
          .update({ status: 'accepted' })
          .eq('id', proposal.id);
        
        if (propUpdateErr) throw propUpdateErr;

        // 3. Update all other proposals for same project to rejected
        await supabase
          .from('proposals')
          .update({ status: 'rejected' })
          .eq('project_id', proposal.project_id)
          .neq('id', proposal.id);

        // 4. Update project
        const { error: projUpdateErr } = await supabase
          .from('projects')
          .update({ 
            status: 'in_progress', 
            assigned_creator_id: proposal.freelancer_id,
            accepted_proposal_id: proposal.id,
            progress: 10,
            current_stage: 'kickoff'
          })
          .eq('id', proposal.project_id);

        if (projUpdateErr) throw projUpdateErr;

        toast.success("Proposal accepted! Project moved to active projects.");
        router.push("/dashboard/client/active-projects");
      } else {
        const { error: rejectErr } = await supabase
          .from('proposals')
          .update({ status: 'rejected' })
          .eq('id', proposal.id);
        
        if (rejectErr) throw rejectErr;
        toast.success("Proposal rejected.");
        await fetchProposals();
      }
    } catch (err: unknown) {
      console.error("PROPOSAL ACTION ERROR", err);
      const errorMessage = err instanceof Error ? err.message : "Action failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" size={40} /></div>;

  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Incoming Proposals">
        <div className="space-y-10">
          <div className="mb-4">
             <p className="text-sm text-gray-400 font-medium max-w-2xl">
               Review professional bids from creators and select the best fit for your production.
             </p>
          </div>

          {proposals.length === 0 ? (
            <div className="glass p-16 rounded-[50px] text-center border-white/5 bg-white/[0.01]">
              <Target className="mx-auto text-gray-800 mb-6" size={56} />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 italic">No proposals yet</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto mb-10 leading-relaxed opacity-60">
                Post a new project or boost your current ones to attract elite cinematic talent.
              </p>
              <Link href="/post-project">
                <button className="px-10 py-4 rounded-2xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                  Post New Project
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {proposals.map((prop, idx) => (
                <motion.div 
                  key={prop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass p-8 sm:p-10 rounded-[40px] border-white/5 flex flex-col lg:flex-row gap-10 relative overflow-hidden group hover:border-neon-purple/20 transition-all bg-white/[0.01]"
                >
                  <div className="lg:w-64 shrink-0 flex flex-col items-center text-center lg:items-start lg:text-left border-b lg:border-b-0 lg:border-r border-white/5 pb-8 lg:pb-0 lg:pr-10">
                    <div className="w-20 h-20 rounded-3xl overflow-hidden glass border-2 border-neon-blue/30 mb-4 shadow-xl">
                       <img src={prop.creator?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
                    </div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tighter italic mb-1">{prop.creator?.full_name}</h4>
                    <p className="text-[9px] text-neon-blue font-bold uppercase tracking-widest mb-4">{prop.creator?.specialization || 'Visual Expert'}</p>
                    <Link href={`/creators/${prop.freelancer_id}`} target="_blank">
                       <button className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2">
                          View Portfolio <ExternalLink size={10} />
                       </button>
                    </Link>
                  </div>

                  <div className="flex-1 min-w-0 space-y-6">
                    <div>
                       <div className="flex flex-wrap items-center gap-3 mb-4">
                         <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                           prop.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                           prop.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                           'bg-neon-purple/10 text-neon-purple border-neon-purple/20'
                         }`}>
                           {prop.status}
                         </span>
                         <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic opacity-60">
                           For Project: {prop.project?.title}
                         </span>
                       </div>
                       <p className="text-sm text-gray-300 font-medium uppercase tracking-wider leading-relaxed opacity-80 italic">
                          &quot;{prop.cover_letter}&quot;
                       </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-white/5">
                       <div className="space-y-1">
                          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Requested Budget</span>
                          <p className="text-lg font-black text-white italic">₹{prop.proposed_budget}</p>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Delivery ETA</span>
                          <p className="text-lg font-black text-white italic">{prop.estimated_days} Days</p>
                       </div>
                    </div>
                  </div>

                  <div className="lg:w-64 shrink-0 flex flex-col justify-center gap-3 pt-6 lg:pt-0">
                    {prop.status === 'pending' && prop.project?.status === 'open' && (
                      <>
                        <button 
                          onClick={() => handleAction(prop, 'accepted')}
                          className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Accept Proposal
                        </button>
                        <button 
                          onClick={() => handleAction(prop, 'rejected')}
                          className="w-full py-4 rounded-2xl glass border-white/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    <button className="w-full py-3.5 rounded-2xl glass border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                       <MessageSquare size={14} /> Message
                    </button>
                    
                    {prop.status === 'accepted' && (
                       <Link href={`/dashboard/projects/${prop.project_id}/workspace`}>
                         <button className="w-full py-4 rounded-2xl bg-neon-blue text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                            Open Project Details
                         </button>
                       </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

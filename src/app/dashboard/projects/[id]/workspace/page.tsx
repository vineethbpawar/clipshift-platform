"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, getStoredSession } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  User,
  DollarSign,
  AlertCircle,
  Zap,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { PageWrapper } from "@/components/layout/PageWrapper";
import Link from "next/link";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchWorkspaceData = async () => {
    if (!params.id) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(full_name, email),
          assigned_creator:profiles!projects_assigned_creator_id_fkey(full_name, email, specialization),
          accepted_proposal:proposals!projects_accepted_proposal_id_fkey(*)
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      
      // Access Control
      const isClient = data.client_id === user?.id;
      const isCreator = data.assigned_creator_id === user?.id;
      const isAdmin = user?.role === 'admin';

      if (!isClient && !isCreator && !isAdmin) {
        setProject({ accessDenied: true });
      } else {
        setProject(data);
      }
    } catch (err) {
      console.error("Error fetching workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchWorkspaceData();
  }, [params.id, user?.id]);

  const updateWorkspace = async (payload: any) => {
    setUpdating(true);
    console.log("WORKSPACE UPDATE START", payload);
    try {
      // Restore Session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const stored = getStoredSession();
        if (stored) {
          await supabase.auth.setSession({ access_token: stored.access_token, refresh_token: stored.refresh_token });
        } else {
          toast.error("Your session expired. Please login again.");
          return;
        }
      }

      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', project.id);

      if (error) throw error;
      console.log("WORKSPACE UPDATE SUCCESS");
      toast.success("Workspace updated!");
      fetchWorkspaceData();
    } catch (err: any) {
      console.error("WORKSPACE UPDATE ERROR", err);
      toast.error(err.message || "Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;

  if (project?.accessDenied) {
    return (
      <PageWrapper>
        <div className="max-w-xl mx-auto pt-32 text-center">
          <div className="glass p-12 rounded-[40px] border-red-500/20">
            <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Access Denied</h2>
            <p className="text-sm text-gray-500 uppercase font-black tracking-widest mb-8">
              You do not have access to this project workspace.
            </p>
            <button onClick={() => router.back()} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Go Back
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isCreator = project.assigned_creator_id === user?.id;
  const isClient = project.client_id === user?.id;

  const stages = [
    { id: 'kickoff', label: 'Kickoff', progress: 10 },
    { id: 'production', label: 'Production', progress: 40 },
    { id: 'review', label: 'Review', progress: 70 },
    { id: 'delivery', label: 'Delivery', progress: 90 },
    { id: 'completed', label: 'Completed', progress: 100 }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === project.current_stage);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 text-[10px] uppercase tracking-widest font-black transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <Zap className={`text-neon-purple ${project.status === 'in_progress' ? 'animate-pulse' : 'opacity-20'}`} size={32} />
              </div>

              <div className="mb-8">
                <span className="px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-black text-neon-purple uppercase tracking-widest mb-4 inline-block">
                  Project Workspace
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                  {project.title}
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Status</span>
                  <div className="text-[11px] text-white font-black uppercase tracking-tighter flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
                    {project.status.replace('_', ' ')}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Current Stage</span>
                  <div className="text-[11px] text-neon-blue font-black uppercase tracking-tighter">{project.current_stage}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Agreed Budget</span>
                  <div className="text-[11px] text-white font-black">₹{project.accepted_proposal?.proposed_budget || project.budget}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">ETA</span>
                  <div className="text-[11px] text-white font-black">{project.accepted_proposal?.estimated_days || '-'} Days</div>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
                <TrendingUp size={16} className="text-neon-purple" /> Production Stream
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-white/5" />
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-neon-purple transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                  style={{ width: `${project.progress}%` }}
                />

                <div className="relative flex justify-between items-center">
                  {stages.map((stage, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const isFuture = idx > currentStageIndex;

                    return (
                      <div key={stage.id} className="flex flex-col items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                          isCompleted ? 'bg-neon-purple border-neon-purple text-white' :
                          isCurrent ? 'bg-black border-neon-purple text-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.4)]' :
                          'bg-black border-white/10 text-gray-700'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={18} /> : (idx + 1)}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
                          isCurrent ? 'text-neon-purple' : 'text-gray-600'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-12 p-6 glass border-white/5 rounded-2xl bg-white/[0.02]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Aggregate Progress</span>
                  <span className="text-[10px] text-neon-purple font-black">{project.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
                  />
                </div>
              </div>
            </div>

            {/* Proposal Details */}
            <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Briefcase size={16} className="text-neon-blue" /> Accepted Proposition
              </h3>
              <div className="space-y-6">
                <div className="p-6 glass border-white/5 rounded-3xl">
                  <p className="text-gray-400 text-sm italic leading-relaxed">
                    &quot;{project.accepted_proposal?.cover_letter}&quot;
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                   <div className="px-6 py-3 rounded-2xl glass border-white/5 flex flex-col">
                     <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Proposal Budget</span>
                     <span className="text-sm font-black text-white uppercase tracking-tighter">₹{project.accepted_proposal?.proposed_budget}</span>
                   </div>
                   <div className="px-6 py-3 rounded-2xl glass border-white/5 flex flex-col">
                     <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Timeline</span>
                     <span className="text-sm font-black text-white uppercase tracking-tighter">{project.accepted_proposal?.estimated_days} Days</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-8">
            {/* Action Center */}
            <div className="glass p-8 rounded-[40px] border-neon-purple/20 bg-gradient-to-br from-neon-purple/5 to-transparent">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                <ShieldCheck size={14} className="text-neon-purple" /> Command Center
              </h3>

              <div className="space-y-3">
                {isCreator && (
                  <>
                    {project.current_stage === 'kickoff' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'production', progress: 40, status: 'in_progress' })}
                        disabled={updating}
                        className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : <>Move to Production <ChevronRight size={14} /></>}
                      </button>
                    )}
                    {(project.current_stage === 'production' || project.current_stage === 'kickoff') && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'review', progress: 70, status: 'in_progress' })}
                        disabled={updating}
                        className="w-full py-4 rounded-2xl glass border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:border-neon-purple transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : <>Move to Review <ChevronRight size={14} /></>}
                      </button>
                    )}
                    {project.status !== 'delivered' && project.status !== 'completed' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'delivery', progress: 90, status: 'delivered' })}
                        disabled={updating}
                        className="w-full py-4 rounded-2xl bg-neon-blue text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : <>Mark Delivered <CheckCircle2 size={14} /></>}
                      </button>
                    )}
                    <Link href={`/chat`} className="block">
                      <button className="w-full py-4 rounded-2xl glass border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                        <MessageSquare size={14} /> Message Client
                      </button>
                    </Link>
                  </>
                )}

                {isClient && (
                  <>
                    {project.status === 'delivered' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'completed', progress: 100, status: 'completed' })}
                        disabled={updating}
                        className="w-full py-4 rounded-2xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : <>Mark Completed <CheckCircle2 size={14} /></>}
                      </button>
                    )}
                    {project.status === 'delivered' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'review', progress: 70, status: 'in_progress' })}
                        disabled={updating}
                        className="w-full py-4 rounded-2xl glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updating ? <Loader2 size={14} className="animate-spin" /> : <>Request Changes <AlertCircle size={14} /></>}
                      </button>
                    )}
                    <Link href={`/chat`} className="block">
                      <button className="w-full py-4 rounded-2xl glass border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:border-neon-purple transition-all flex items-center justify-center gap-2">
                        <MessageSquare size={14} /> Message Creator
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Stakeholder Info */}
            <div className="glass p-8 rounded-[40px] border-white/5">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 italic">Personnel Identified</h3>
               
               <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple border border-neon-purple/20">
                      <User size={20} />
                    </div>
                    <div>
                       <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest block mb-1">Lead Visionary</span>
                       <p className="text-xs font-black text-white uppercase tracking-tighter">{project.client?.full_name}</p>
                       <p className="text-[9px] text-gray-500 font-bold">{project.client?.email}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                      <Zap size={20} />
                    </div>
                    <div>
                       <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest block mb-1">Assigned Node</span>
                       <p className="text-xs font-black text-white uppercase tracking-tighter">{project.assigned_creator?.full_name}</p>
                       <p className="text-[9px] text-neon-blue font-bold uppercase tracking-widest">{project.assigned_creator?.specialization || 'Master'}</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

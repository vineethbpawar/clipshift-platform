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
  Briefcase, 
  User,
  AlertCircle,
  Zap,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  Paperclip,
  CheckCircle,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { PageWrapper } from "@/components/layout/PageWrapper";
import Link from "next/link";
import { type Project } from "@/data/projects";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | { accessDenied?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const handleMessageClient = async () => {
    if (!user || !project || 'accessDenied' in project) return;
    const typedProject = project as Project;
    setMessaging(true);
    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', typedProject.client_id)
        .eq('creator_id', typedProject.assigned_creator_id)
        .maybeSingle();

      if (existingConv) {
        router.push(`/chat/${existingConv.id}`);
      } else {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_id: typedProject.client_id,
            creator_id: typedProject.assigned_creator_id,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        router.push(`/chat/${newConv.id}`);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to initiate chat");
    } finally {
      setMessaging(false);
    }
  };

  const fetchWorkspaceData = async () => {
    if (!params.id) return;
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const stored = getStoredSession();
        if (stored?.access_token) {
          await supabase.auth.setSession({ access_token: stored.access_token, refresh_token: stored.refresh_token });
        }
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:profiles!projects_client_id_fkey(id, full_name, email),
          assigned_creator:profiles!projects_assigned_creator_id_fkey(id, full_name, email, specialization),
          accepted_proposal:proposals!projects_accepted_proposal_id_fkey(*)
        `)
        .eq('id', params.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Project not found.");
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const isClient = data.client_id === currentUser?.id;
      const isCreator = data.assigned_creator_id === currentUser?.id;
      const isAdmin = user?.role === 'admin';

      if (!isClient && !isCreator && !isAdmin) {
        setProject({ accessDenied: true });
      } else {
        setProject(data as unknown as Project);
      }
    } catch (err: unknown) {
      console.error("Error fetching workspace:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load project.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      Promise.resolve().then(() => fetchWorkspaceData());
    }
  }, [params.id, user?.id]);

  const updateWorkspace = async (payload: unknown) => {
    if (!project || 'accessDenied' in project) return;
    setUpdating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const stored = getStoredSession();
        if (stored) {
          await supabase.auth.setSession({ access_token: (stored as { access_token: string }).access_token, refresh_token: (stored as { refresh_token: string }).refresh_token });
        } else {
          toast.error("Your session expired. Please login again.");
          return;
        }
      }

      const { error } = await supabase
        .from('projects')
        .update(payload as Record<string, unknown>)
        .eq('id', (project as Project).id);

      if (error) throw error;
      toast.success("Project updated!");
      fetchWorkspaceData();
    } catch (err: unknown) {
      console.error("WORKSPACE UPDATE ERROR", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update workspace";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const stages = [
    { id: 'kickoff', label: 'Started', progress: 10 },
    { id: 'production', label: 'In Progress', progress: 40 },
    { id: 'review', label: 'Client Review', progress: 70 },
    { id: 'delivery', label: 'Delivered', progress: 90 },
    { id: 'completed', label: 'Completed', progress: 100 }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === (project as Project)?.current_stage);

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" size={48} /></div>;

  if (project && 'accessDenied' in project) {
    return (
      <PageWrapper>
        <div className="max-w-xl mx-auto pt-32 text-center px-6">
          <div className="glass p-12 rounded-[50px] border-red-500/20 bg-red-500/5">
            <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Access Denied</h2>
            <p className="text-sm text-gray-500 uppercase font-black tracking-widest mb-10 leading-relaxed">
              You do not have permission to view this project details.
            </p>
            <button onClick={() => router.back()} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all">
              Go Back
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const typedProject = project as Project;
  const isCreator = typedProject?.assigned_creator_id === user?.id;
  const isClient = typedProject?.client_id === user?.id;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto pt-32 pb-32 px-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-10 text-[10px] uppercase tracking-[0.2em] font-black transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass p-8 sm:p-12 rounded-[50px] border-white/5 relative overflow-hidden bg-white/[0.01]">
              <div className="absolute top-10 right-10 p-4 rounded-3xl bg-neon-purple/10 border border-neon-purple/20">
                 <Briefcase className={`text-neon-purple ${typedProject?.status === 'in_progress' ? 'animate-pulse' : 'opacity-40'}`} size={28} />
              </div>

              <div className="mb-12">
                <span className="px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[9px] font-black text-neon-purple uppercase tracking-widest mb-6 inline-block">
                   Project Details
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6 italic">
                  {typedProject?.title}
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed uppercase tracking-wider font-medium opacity-70 max-w-2xl mb-10">
                  {typedProject?.description}
                </p>

                {typedProject?.file_url && (
                  <div className="p-6 glass rounded-[32px] border-white/5 bg-white/5 flex flex-col md:flex-row items-center gap-6 max-w-lg">
                    {typedProject.file_type?.startsWith('image') ? (
                      <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden glass border border-white/10 shrink-0">
                        <img src={typedProject.file_url} className="w-full h-full object-cover" alt="" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple shrink-0">
                         <Paperclip size={28} />
                      </div>
                    )}
                    <div className="min-w-0 text-center md:text-left flex-1">
                      <p className="text-[10px] text-white font-black uppercase tracking-widest mb-1 italic">Attached Asset</p>
                      <p className="text-[9px] text-gray-500 uppercase font-bold truncate">{typedProject.file_name || 'Project Document'}</p>
                      <a href={typedProject.file_url} target="_blank" className="inline-flex items-center gap-2 mt-3 text-[9px] text-neon-blue font-black uppercase tracking-widest hover:underline">
                        Open File <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-10 border-t border-white/5 relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Status</span>
                  <div className="text-[11px] text-white font-black uppercase tracking-tighter flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                    {typedProject?.status?.replace('_', ' ')}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Current Stage</span>
                  <div className="text-[11px] text-neon-blue font-black uppercase tracking-tighter italic">{stages[currentStageIndex]?.label || typedProject?.current_stage}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Agreed Budget</span>
                  <div className="text-[11px] text-white font-black">₹{typedProject?.accepted_proposal?.proposed_budget || typedProject?.budget}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">ETA</span>
                  <div className="text-[11px] text-white font-black italic">{typedProject?.accepted_proposal?.estimated_days || '-'} Days</div>
                </div>
              </div>
            </div>

            {/* Project Progress Section */}
            <div className="glass p-8 sm:p-12 rounded-[50px] border-white/5 bg-white/[0.01]">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-12 flex items-center gap-3 italic">
                <TrendingUp size={18} className="text-neon-purple" /> Project Progress
              </h3>

              <div className="relative mb-16 px-4">
                <div className="absolute top-5 left-0 w-full h-1 bg-white/5 rounded-full" />
                <div 
                  className="absolute top-5 left-0 h-1 bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-1000 shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-full" 
                  style={{ width: `${typedProject?.progress}%` }}
                />

                <div className="relative flex justify-between items-center">
                  {stages.map((stage, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stage.id} className="flex flex-col items-center gap-5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 z-10 ${
                          isCompleted ? 'bg-neon-purple border-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' :
                          isCurrent ? 'bg-black border-neon-purple text-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-110' :
                          'bg-black border-white/10 text-gray-700'
                        }`}>
                          {isCompleted ? <CheckCircle size={20} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${
                          isCurrent ? 'text-neon-purple' : 'text-gray-600'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-8 glass rounded-[32px] border-white/5 bg-black/40">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest opacity-60">Total Completion</span>
                  <span className="text-sm font-black text-neon-purple italic">{typedProject?.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${typedProject?.progress}%` }}
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Accepted Proposal Details */}
            <div className="glass p-8 sm:p-12 rounded-[50px] border-white/5 bg-white/[0.01]">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3 italic">
                <FileText size={18} className="text-neon-blue" /> Accepted Proposal
              </h3>
              <div className="space-y-8">
                <div className="p-8 glass border-white/5 rounded-[40px] bg-black/20">
                  <p className="text-gray-300 text-sm italic leading-relaxed uppercase tracking-wider font-medium opacity-80">
                    &quot;{typedProject?.accepted_proposal?.cover_letter}&quot;
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="px-8 py-5 rounded-3xl glass border-white/5 bg-white/5 flex flex-col justify-center">
                     <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 opacity-60">Proposed Budget</span>
                     <span className="text-xl font-black text-white italic">₹{typedProject?.accepted_proposal?.proposed_budget}</span>
                   </div>
                   <div className="px-8 py-5 rounded-3xl glass border-white/5 bg-white/5 flex flex-col justify-center">
                     <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 opacity-60">Delivery Timeline</span>
                     <span className="text-xl font-black text-white italic">{typedProject?.accepted_proposal?.estimated_days} Days</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Panel: Team & Actions */}
          <div className="space-y-10 sticky top-32">
            {/* Project Team */}
            <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 border-b border-white/5 pb-4 italic">Project Team</h3>
               
               <div className="space-y-10">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple border border-neon-purple/20 shadow-lg">
                      <User size={24} />
                    </div>
                    <div className="min-w-0">
                       <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest block mb-1">Client</span>
                       <p className="text-sm font-black text-white uppercase tracking-tighter truncate">{typedProject?.client?.full_name}</p>
                       <p className="text-[10px] text-gray-500 font-bold truncate">{typedProject?.client?.email}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20 shadow-lg">
                      <Zap size={24} />
                    </div>
                    <div className="min-w-0">
                       <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest block mb-1">Creator</span>
                       <p className="text-sm font-black text-white uppercase tracking-tighter truncate">{typedProject?.assigned_creator?.full_name}</p>
                       <p className="text-[10px] text-neon-blue font-bold uppercase tracking-widest truncate">{typedProject?.assigned_creator?.specialization || 'Visual Expert'}</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Action Center */}
            <div className="glass p-8 rounded-[40px] border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 to-transparent">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2 italic">
                <ShieldCheck size={16} className="text-neon-purple" /> Project Actions
              </h3>

              <div className="space-y-4">
                {isCreator && (
                  <>
                    {typedProject?.current_stage === 'kickoff' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'production', progress: 40, status: 'in_progress' })}
                        disabled={updating}
                        className="w-full py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all flex items-center justify-center gap-2 shadow-2xl active:scale-95 disabled:opacity-50"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin" /> : <>Start Work <ChevronRight size={16} /></>}
                      </button>
                    )}
                    {(typedProject?.current_stage === 'production' || typedProject?.current_stage === 'kickoff') && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'review', progress: 70, status: 'in_progress' })}
                        disabled={updating}
                        className="w-full py-5 rounded-2xl glass border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin" /> : <>Send for Review <ChevronRight size={16} /></>}
                      </button>
                    )}
                    {typedProject?.status !== 'delivered' && typedProject?.status !== 'completed' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'delivery', progress: 90, status: 'delivered' })}
                        disabled={updating}
                        className="w-full py-5 rounded-2xl bg-neon-blue text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin" /> : <>Mark as Delivered <CheckCircle2 size={16} /></>}
                      </button>
                    )}
                    <button 
                      onClick={handleMessageClient}
                      disabled={messaging}
                      className="w-full py-4 rounded-2xl glass border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {messaging ? <Loader2 size={16} className="animate-spin" /> : <><MessageSquare size={16} /> Message Client</>}
                    </button>
                  </>
                )}

                {isClient && (
                  <>
                    {typedProject?.status === 'delivered' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'completed', progress: 100, status: 'completed' })}
                        disabled={updating}
                        className="w-full py-5 rounded-2xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,197,94,0.3)] active:scale-95"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin" /> : <>Mark as Completed <CheckCircle2 size={16} /></>}
                      </button>
                    )}
                    {typedProject?.status === 'delivered' && (
                      <button 
                        onClick={() => updateWorkspace({ current_stage: 'review', progress: 70, status: 'in_progress' })}
                        disabled={updating}
                        className="w-full py-5 rounded-2xl glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin" /> : <>Request Changes <AlertCircle size={16} /></>}
                      </button>
                    )}
                    <Link href={`/chat`} className="block">
                      <button className="w-full py-4 rounded-2xl glass border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:border-neon-purple transition-all flex items-center justify-center gap-2 active:scale-95">
                        <MessageSquare size={16} /> Message Creator
                      </button>
                    </Link>
                  </>
                )}
                
                {typedProject?.status === 'completed' && (
                  <div className="py-8 text-center bg-green-500/10 border border-green-500/20 rounded-[32px] px-6">
                     <CheckCircle2 size={32} className="text-green-500 mx-auto mb-4" />
                     <p className="text-[10px] font-black text-white uppercase tracking-widest italic leading-relaxed">Project Completed Successfully</p>
                  </div>
                )}
                
                {typedProject?.status === 'delivered' && isCreator && (
                   <div className="py-6 text-center opacity-60">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic">Waiting for client approval</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

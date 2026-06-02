"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase, getStoredSession } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  ExternalLink,
  DollarSign,
  User,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { motion } from "framer-motion";
import { type Project } from "@/data/projects";
import Image from "next/image";

export default function ClientActiveProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchActiveProjects = async () => {
    try {
      setLoading(true);
      setFetchError(null);

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
        setFetchError("Your session expired. Please login again.");
        return;
      }

      const userId = activeSession.user.id;
      console.log("CLIENT ACTIVE PROJECTS USER ID", userId);

      // 2. Fetch projects directly
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", userId)
        .in("status", ["in_progress", "delivered", "completed"])
        .order("created_at", { ascending: false });

      console.log("CLIENT ACTIVE PROJECTS RESULT", { projectsData, error });

      if (error) {
        console.error("CLIENT ACTIVE PROJECTS FETCH ERROR", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      const initialProjects = (projectsData || []) as Project[];
      setProjects(initialProjects);
      
      // 3. Fetch details separately to avoid join issues
      if (initialProjects.length > 0) {
        try {
          const creatorIds = initialProjects.map(p => p.assigned_creator_id).filter(Boolean);
          if (creatorIds.length > 0) {
            const { data: creatorsData } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', creatorIds);

            if (creatorsData) {
              setProjects(prev => prev.map(p => ({
                ...p,
                assigned_creator: creatorsData.find(c => c.id === p.assigned_creator_id)
              })));
            }
          }
        } catch (detailErr) {
          console.warn("Could not load creator details, but projects are loaded.", detailErr);
        }
      }

    } catch (err: unknown) {
      console.error("ACTIVE PROJECTS FETCH ERROR", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setFetchError("Could not load active projects. Please refresh.");
      
      // Show debug text only in development
      if (process.env.NODE_ENV === 'development') {
        setFetchError(`Could not load active projects. Please refresh. (${message})`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      Promise.resolve().then(() => fetchActiveProjects());
    }
  }, [user?.id]);

  const handleMarkCompleted = async (projectId: string) => {
    try {
      const { error: updateErr } = await supabase
        .from('projects')
        .update({ status: 'completed', progress: 100, current_stage: 'completed' })
        .eq('id', projectId);

      if (updateErr) throw updateErr;
      toast.success("Project marked as completed!");
      fetchActiveProjects();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to update project.");
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'kickoff': return 'Started';
      case 'production': return 'In Progress';
      case 'review': return 'Client Review';
      case 'delivery': return 'Delivered';
      case 'completed': return 'Completed';
      default: return stage;
    }
  };

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" size={40} /></div>;

  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Active Projects">
        <div className="space-y-10">
          <div className="mb-4">
             <p className="text-sm text-gray-400 font-medium max-w-2xl">
               Manage your ongoing projects and progress.
             </p>
          </div>

          {fetchError && (
            <div className="p-6 glass border-red-500/20 bg-red-500/5 rounded-3xl flex items-center gap-4 text-red-400">
              <AlertCircle size={20} />
              <p className="text-xs font-black uppercase tracking-widest">{fetchError}</p>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="glass p-16 rounded-[50px] text-center border-white/5 bg-white/[0.01]">
              <Briefcase className="mx-auto text-gray-800 mb-6" size={56} />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 italic">No active projects yet</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto mb-10 leading-relaxed opacity-60">
                Accept a creator proposal and your active production will appear here.
              </p>
              <Link href="/dashboard/client/proposals">
                <button className="px-10 py-4 rounded-2xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                  View Proposals
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="glass p-8 sm:p-10 rounded-[40px] border-white/5 flex flex-col lg:flex-row gap-10 relative overflow-hidden group hover:border-neon-purple/20 transition-all bg-white/[0.01]">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    project.status === 'completed' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 
                    project.status === 'delivered' ? 'bg-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                  }`} />

                  {/* Thumbnail */}
                  <div className="lg:w-64 shrink-0">
                    {project.file_url && project.file_type?.startsWith('image') ? (
                      <div className="relative aspect-video lg:aspect-square rounded-[32px] overflow-hidden glass border border-white/10 group-hover:scale-[1.02] transition-transform duration-700">
                        <Image src={project.file_url} fill className="object-cover" alt={project.title} />
                      </div>
                    ) : (
                      <div className="aspect-video lg:aspect-square rounded-[32px] glass border border-white/5 flex flex-col items-center justify-center gap-3 text-gray-700 bg-white/5">
                        <Briefcase size={40} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Project Visual</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-8 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          project.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          project.status === 'delivered' ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/20' : 
                          'bg-neon-purple/10 text-neon-purple border-neon-purple/20'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest opacity-60 italic">
                          Stage: {getStageLabel(project.current_stage || 'briefing')}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-3 group-hover:text-neon-purple transition-colors truncate">
                        {project.title}
                      </h3>
                      {project.assigned_creator && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          <User size={12} className="text-neon-blue" />
                          Creator: <span className="text-white">{project.assigned_creator.full_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Project Progress</span>
                        <span className="text-sm font-black text-white italic">{project.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner p-[1px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          className={`h-full rounded-full transition-all duration-1000 ${
                            project.status === 'completed' ? 'bg-green-500' : 'bg-gradient-to-r from-neon-purple to-neon-blue'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                       <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-neon-purple" />
                          <span className="text-xs font-black text-white italic">₹{project.budget}</span>
                       </div>
                       <div className="flex items-center gap-2 text-gray-500">
                          <Clock size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Active Projects</span>
                       </div>
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col justify-center gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-8 lg:pt-0 lg:pl-10">
                    <Link href={`/dashboard/projects/${project.id}/workspace`}>
                      <button className="w-full py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 group/btn">
                        Open Project <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    
                    <button className="w-full py-4 rounded-2xl glass border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2 active:scale-95">
                      <MessageSquare size={16} /> Message Creator
                    </button>

                    {project.status === 'delivered' && (
                      <button 
                        onClick={() => handleMarkCompleted(project.id)}
                        className="w-full py-5 rounded-2xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

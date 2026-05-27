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
  User
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { motion } from "framer-motion";

export default function ClientActiveProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
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
        setLoading(false);
        return;
      }

      const userId = activeSession.user.id;
      console.log("CLIENT ACTIVE PROJECTS USER ID", userId);

      // 2. Fetch projects directly
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', userId)
        .in('status', ['in_progress', 'delivered', 'completed'])
        .order('created_at', { ascending: false });

      console.log("CLIENT ACTIVE PROJECTS RESULT", { projects: projData, error: projErr });

      if (projErr) throw projErr;
      
      const initialProjects = projData || [];
      setProjects(initialProjects);

      // 3. Fetch details separately
      if (initialProjects.length > 0) {
        const creatorIds = initialProjects.map(p => p.assigned_creator_id).filter(Boolean);
        const proposalIds = initialProjects.map(p => p.accepted_proposal_id).filter(Boolean);

        const [creatorsRes, proposalsRes] = await Promise.all([
          creatorIds.length > 0 ? supabase.from('profiles').select('id, full_name, email').in('id', creatorIds) : Promise.resolve({ data: [] }),
          proposalIds.length > 0 ? supabase.from('proposals').select('*').in('id', proposalIds) : Promise.resolve({ data: [] })
        ]);

        const enriched = initialProjects.map(p => ({
          ...p,
          assigned_creator: creatorsRes.data?.find(c => c.id === p.assigned_creator_id),
          accepted_proposal: proposalsRes.data?.find(pr => pr.id === p.accepted_proposal_id)
        }));

        setProjects(enriched);
      }

    } catch (err: any) {
      console.error("ACTIVE PROJECTS FETCH ERROR", err);
      setFetchError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveProjects();
  }, [user?.id]);

  const handleMarkCompleted = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: 'completed',
          progress: 100,
          current_stage: 'completed'
        })
        .eq('id', projectId);

      if (error) throw error;
      toast.success("Project marked as completed!");
      fetchActiveProjects();
    } catch (err) {
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

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;

  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="ACTIVE PROJECTS">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {fetchError && (
            <div className="mb-8 p-4 glass border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest text-center">
              Error: {fetchError}
            </div>
          )}

          {projects.length === 0 ? (
            <div className="glass p-12 rounded-[40px] text-center border-white/5">
              <Briefcase className="mx-auto text-gray-700 mb-4" size={48} />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No active projects yet</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto mb-8">
                Accept a creator proposal and your project will appear here.
              </p>
              <Link href="/dashboard/client/proposals">
                <button className="px-8 py-4 rounded-2xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  View Proposals
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="glass p-6 sm:p-8 rounded-[32px] border-white/5 flex flex-col md:flex-row gap-8 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    project.status === 'completed' ? 'bg-green-500' : 
                    project.status === 'delivered' ? 'bg-neon-blue' : 'bg-neon-purple'
                  }`} />

                  {/* Project Thumbnail */}
                  {project.file_url && project.file_type?.startsWith('image') && (
                    <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden glass border border-white/5 shrink-0">
                      <img src={project.file_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    </div>
                  )}

                  <div className="flex-1 space-y-6 min-w-0">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          project.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          project.status === 'delivered' ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/20' : 
                          'bg-neon-purple/10 text-neon-purple border-neon-purple/20'
                        } border`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                          Stage: {getStageLabel(project.current_stage)}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-neon-purple transition-colors truncate">
                        {project.title}
                      </h3>
                      {project.assigned_creator && (
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                          Assigned to: {project.assigned_creator.full_name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Project Progress</span>
                        <span className="text-[10px] text-neon-purple font-black">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          className={`h-full ${
                            project.status === 'completed' ? 'bg-green-500' : 'bg-neon-purple'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:w-64 flex flex-col justify-center gap-3">
                    <Link href={`/dashboard/projects/${project.id}/workspace`}>
                      <button className="w-full py-4 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all flex items-center justify-center gap-2">
                        Open Project <ArrowRight size={14} />
                      </button>
                    </Link>
                    {project.status === 'delivered' && (
                      <button 
                        onClick={() => handleMarkCompleted(project.id)}
                        className="w-full py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
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

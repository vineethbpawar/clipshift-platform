"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase, getStoredSession } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  Briefcase, 
  Clock, 
  ArrowRight,
  MessageSquare,
  DollarSign,
  User,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function CreatorActiveProjectsPage() {
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
      console.log("CREATOR ACTIVE PROJECTS USER ID", userId);

      // 2. Fetch projects directly
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('assigned_creator_id', userId)
        .in('status', ['in_progress', 'delivered', 'completed'])
        .order('created_at', { ascending: false });

      console.log("CREATOR ACTIVE PROJECTS RESULT", { projects: projData, error: projErr });

      if (projErr) throw projErr;
      
      const initialProjects = projData || [];
      setProjects(initialProjects);

      // 3. Fetch details separately
      if (initialProjects.length > 0) {
        const clientIds = initialProjects.map(p => p.client_id).filter(Boolean);
        const proposalIds = initialProjects.map(p => p.accepted_proposal_id).filter(Boolean);

        const [clientsRes, proposalsRes] = await Promise.all([
          clientIds.length > 0 ? supabase.from('profiles').select('id, full_name, email').in('id', clientIds) : Promise.resolve({ data: [] }),
          proposalIds.length > 0 ? supabase.from('proposals').select('*').in('id', proposalIds) : Promise.resolve({ data: [] })
        ]);

        const enriched = initialProjects.map(p => ({
          ...p,
          client: clientsRes.data?.find(c => c.id === p.client_id),
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

  const handleMarkDelivered = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: 'delivered',
          progress: 90,
          current_stage: 'delivery'
        })
        .eq('id', projectId);

      if (error) throw error;
      toast.success("Project marked as delivered! Waiting for client approval.");
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
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="MY ACTIVE PROJECTS">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {fetchError && (
            <div className="mb-8 p-4 glass border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest text-center">
              Error: {fetchError}
            </div>
          )}

          {projects.length === 0 ? (
            <div className="glass p-12 rounded-[40px] text-center border-white/5">
              <TrendingUp className="mx-auto text-gray-700 mb-4" size={48} />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No active projects yet</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto mb-8">
                When a client accepts your proposal, the project will appear here.
              </p>
              <Link href="/projects">
                <button className="px-8 py-4 rounded-2xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  Find Projects
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
                      {project.client && (
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                          Client: {project.client.full_name}
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
                    {project.status === 'in_progress' && (
                      <button 
                        onClick={() => handleMarkDelivered(project.id)}
                        className="w-full py-3 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-[10px] font-black uppercase tracking-widest hover:bg-neon-blue hover:text-white transition-all"
                      >
                        Mark as Delivered
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

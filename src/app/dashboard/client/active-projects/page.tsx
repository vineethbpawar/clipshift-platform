"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
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

  const fetchActiveProjects = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          assigned_creator:profiles!projects_assigned_creator_id_fkey(full_name, email),
          accepted_proposal:proposals!projects_accepted_proposal_id_fkey(*)
        `)
        .eq('client_id', user.id)
        .in('status', ['in_progress', 'delivered', 'completed'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching active projects:", err);
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

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;

  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Active Workspaces">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {projects.length === 0 ? (
            <div className="glass p-12 rounded-[40px] text-center border-white/5">
              <Briefcase className="mx-auto text-gray-700 mb-4" size={48} />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No active projects yet</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto mb-8">
                Accept a creator proposal to start a workspace and manage your production.
              </p>
              <Link href="/dashboard/client/proposals">
                <button className="px-8 py-4 rounded-2xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  Review Proposals
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="glass p-6 sm:p-8 rounded-[32px] border-white/5 flex flex-col md:flex-row gap-8 relative overflow-hidden group">
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    project.status === 'completed' ? 'bg-green-500' : 
                    project.status === 'delivered' ? 'bg-neon-blue' : 'bg-neon-purple'
                  }`} />

                  {/* Left: Info */}
                  <div className="flex-1 space-y-6">
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
                          Stage: {project.current_stage}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-neon-purple transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 max-w-2xl uppercase tracking-wider font-medium opacity-60">
                        {project.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-1">
                          <User size={10} /> Assigned Creator
                        </span>
                        <p className="text-[11px] text-white font-bold">{project.assigned_creator?.full_name || 'Assigned'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-1">
                          <DollarSign size={10} /> Budget
                        </span>
                        <p className="text-[11px] text-neon-purple font-black">₹{project.accepted_proposal?.proposed_budget || project.budget}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-1">
                          <Briefcase size={10} /> Service
                        </span>
                        <p className="text-[11px] text-gray-300 font-bold uppercase">{project.service_type?.replace('_', ' ')}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-1">
                          <Clock size={10} /> ETA
                        </span>
                        <p className="text-[11px] text-gray-300 font-bold">{project.accepted_proposal?.estimated_days || '-'} Days</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress & Actions */}
                  <div className="md:w-72 space-y-6 flex flex-col justify-center">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Progress</span>
                        <span className="text-[10px] text-neon-purple font-black">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          className={`h-full ${
                            project.status === 'completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Link href={`/dashboard/projects/${project.id}/workspace`}>
                        <button className="w-full py-4 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all flex items-center justify-center gap-2">
                          Open Workspace <ArrowRight size={14} />
                        </button>
                      </Link>
                      <div className="flex gap-2">
                        <Link href={`/chat`} className="flex-1">
                          <button className="w-full py-3 rounded-xl glass border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2">
                            <MessageSquare size={14} /> Message
                          </button>
                        </Link>
                        {project.status === 'delivered' && (
                          <button 
                            onClick={() => handleMarkCompleted(project.id)}
                            className="flex-1 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
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

"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProposalCard } from "@/components/projects/ProposalCard";
import { Layers, Zap, Search, Plus, Inbox, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'creator') {
      router.push('/dashboard/creator');
    }
  }, [user, router]);

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let query = supabase.from('projects').select('*, proposals(*)');

        if (user.role === 'client') {
          query = query.eq('client_id', user.id);
        } else if (user.role === 'creator') {
          query = query.eq('status', 'open');
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          setProjects(data);
          if (data.length > 0) setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        console.error("Projects fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple">
                <Layers size={18} />
              </div>
              <h1 className="text-sm font-black text-white uppercase tracking-[0.2em]">Project Command Center</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
              Manage <span className="text-neon-purple">Active Stream</span>
            </h2>
          </div>

          {user?.role === 'client' && (
            <Link href="/post-project">
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <Plus size={18} />
                New Project
              </button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-neon-purple" size={40} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Syncing Production Nodes...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center glass rounded-[40px] border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8">
              <Inbox size={40} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No active projects</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Your production pipeline is currently clear. Start a new project to connect with top cinematic talent.</p>
            <Link href="/post-project">
              <button className="px-12 py-4 rounded-full bg-neon-purple text-white font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                Initiate Project
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Projects List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ongoing Productions ({projects.length})</h3>
                <div className="flex items-center gap-2 text-[10px] text-neon-blue font-bold uppercase tracking-widest cursor-pointer hover:underline">
                  View Archive
                </div>
              </div>

              <div className="space-y-6">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`cursor-pointer transition-all ${selectedProjectId === project.id ? "ring-2 ring-neon-purple ring-offset-8 ring-offset-black rounded-[32px]" : "opacity-70 hover:opacity-100"}`}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>

            {/* Proposals / Details Sidebar */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-neon-purple" />
                <h3 className="text-white font-black uppercase tracking-widest text-sm">Review Proposals</h3>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {activeProject?.proposals?.length > 0 ? (
                    activeProject.proposals.map((proposal: any) => (
                      <ProposalCard key={proposal.id} proposal={proposal} />
                    ))
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 px-6 glass rounded-3xl border-white/5 text-center"
                    >
                      <div className="text-gray-600 mb-2 font-black uppercase tracking-[0.1em] text-xs italic">Awaiting Response</div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        This project is currently being deployed to relevant creators. Check back soon for bids.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

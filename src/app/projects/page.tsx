"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProposalCard } from "@/components/projects/ProposalCard";
import { Layers, Zap, Search, Plus, Inbox, Loader2, RefreshCw, Filter } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { type Project } from "@/data/projects";

import { useAuth } from "@/context/AuthContext";

export default function ProjectsPage() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("OPEN PROJECTS FETCH START");

      // 1. Restore Session
      const { data: sessionData } = await supabase.auth.getSession();
      let activeSession = sessionData.session;

      if (!activeSession) {
        const { getStoredSession } = await import("@/lib/supabase");
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

      // 2. Fetch projects directly
      let query = supabase.from('projects').select('*').eq('status', 'open').order('created_at', { ascending: false });

      // If client, show their own projects (even if not open)
      if (user?.role === 'client') {
        query = supabase.from('projects').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
      }

      const { data, error: fetchErr } = await query;
      console.log("OPEN PROJECTS FETCH RESULT", { projects: data, error: fetchErr });

      if (fetchErr) throw fetchErr;

      setProjects((data as Project[]) || []);
      if (data && data.length > 0) setSelectedProjectId(data[0].id);
      
    } catch (err: unknown) {
      console.error("PROJECTS FETCH ERROR", err);
      setError("Could not load projects. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      Promise.resolve().then(() => fetchProjects());
    } else if (!user) {
      Promise.resolve().then(() => setLoading(false));
    }
  }, [user?.id]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-neon-purple/10 rounded-xl text-neon-purple border border-neon-purple/20">
                <Layers size={20} />
              </div>
              <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Open Projects</h1>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
              Explore <span className="text-neon-purple">Open Projects</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {user?.role === 'client' && (
              <Link href="/post-project" className="flex-1 md:flex-initial">
                <button className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95">
                  <Plus size={18} />
                  Post Project
                </button>
              </Link>
            )}
            <button 
              onClick={fetchProjects}
              className="p-4 rounded-2xl glass border-white/10 text-white hover:bg-white/5 transition-all active:scale-95"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-white/5 border-t-neon-purple animate-spin" />
              <Layers className="absolute inset-0 m-auto text-neon-purple/40" size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Loading Projects</span>
          </div>
        ) : error ? (
          <div className="py-24 text-center glass rounded-[40px] border-red-500/10 bg-red-500/5 max-w-2xl mx-auto px-10">
            <p className="text-red-400 font-bold mb-6 uppercase tracking-widest text-sm">{error}</p>
            <button onClick={fetchProjects} className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-xl">Try Again</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-40 flex flex-col items-center text-center glass rounded-[50px] border-white/5 bg-white/[0.01]">
            <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-10 border border-white/5 shadow-inner">
              <Inbox size={48} className="text-gray-700" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3 italic">No open projects available</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto uppercase tracking-widest text-[10px] font-bold leading-relaxed">
              New client projects will appear here in real-time.
            </p>
            <button 
              onClick={fetchProjects}
              className="px-12 py-5 rounded-2xl bg-neon-purple text-white font-black uppercase tracking-widest text-[10px] shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Refresh Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Projects List */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between mb-2 px-4">
                <div className="flex items-center gap-3">
                   <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Available Opportunities</h3>
                   <span className="px-2 py-0.5 rounded-full bg-neon-purple text-white text-[8px] font-black">{projects.length}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                    <Filter size={14} /> Filter
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`transition-all duration-500 ${selectedProjectId === project.id ? "ring-2 ring-neon-purple ring-offset-[12px] ring-offset-black rounded-[40px]" : "opacity-60 hover:opacity-100"}`}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Details / Context */}
            <div className="space-y-8 sticky top-32">
              <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
                <div className="flex items-center gap-3 mb-8">
                  <Zap size={20} className="text-neon-purple" />
                  <h3 className="text-white font-black uppercase tracking-widest text-xs">Submission Status</h3>
                </div>

                <div className="space-y-6">
                  {activeProject ? (
                    <div className="space-y-6">
                       <div className="p-5 glass rounded-3xl border-white/5 bg-black/20">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Selected Project</p>
                          <h4 className="text-sm font-black text-white uppercase truncate">{activeProject.title}</h4>
                       </div>
                       
                       <div className="space-y-3">
                         <Link href={`/projects/${activeProject.id}`} className="block">
                           <button className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-xl active:scale-95">
                             View Project Details
                           </button>
                         </Link>
                         <button className="w-full py-4 rounded-2xl glass border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95">
                           Save for Later
                         </button>
                       </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center opacity-30">
                       <p className="text-[10px] font-black uppercase tracking-widest italic">Select a project to view details</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass p-8 rounded-[40px] border-white/5 text-center">
                 <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Pro Tips</h4>
                 <p className="text-[11px] text-gray-400 leading-relaxed uppercase tracking-wider font-medium opacity-60">
                   Detailed proposals with clear delivery timelines have a 70% higher chance of being accepted.
                 </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

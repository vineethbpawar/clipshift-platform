"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { mockProjects, type Project } from "@/data/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProposalCard } from "@/components/projects/ProposalCard";
import { Layers, Zap, Search, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[1].id);
  const activeProject = mockProjects.find(p => p.id === selectedProjectId) || mockProjects[0];

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
              Manage <span className="text-gradient">Active Stream</span>
            </h2>
          </div>

          <Link href="/post-project">
            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Plus size={18} />
              New Project
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Projects List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ongoing Productions ({mockProjects.length})</h3>
              <div className="flex items-center gap-2 text-[10px] text-neon-blue font-bold uppercase tracking-widest cursor-pointer hover:underline">
                View Archive
              </div>
            </div>

            <div className="space-y-6">
              {mockProjects.map((project) => (
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
                {activeProject.proposals.length > 0 ? (
                  activeProject.proposals.map((proposal) => (
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

            {/* Quick Stats */}
            <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Production Insights</h4>
              <div className="space-y-6">
                <div>
                  <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-2">Average Bid</div>
                  <div className="text-2xl font-black text-white">$640.00</div>
                </div>
                <div>
                  <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-2">Match Quality</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-[88%] h-full bg-neon-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                    <span className="text-[10px] font-mono text-neon-blue">88%</span>
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

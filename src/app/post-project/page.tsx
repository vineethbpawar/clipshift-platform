"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ProjectPostForm } from "@/components/projects/ProjectPostForm";
import { Briefcase, Info, ShieldCheck, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function PostProjectPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-32 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-neon-purple/10 rounded-xl text-neon-purple border border-neon-purple/20">
                  <Briefcase size={20} />
                </div>
                <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Project Creation</h1>
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8 italic">
                Post Your <span className="text-neon-purple">Project</span>
              </h2>
              <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold leading-relaxed max-w-md opacity-60">
                Define your creative vision and connect with world-class editors and videographers in minutes.
              </p>
            </div>

            <ProjectPostForm />
          </div>

          {/* Right: Sidebar Info */}
          <div className="space-y-10 lg:sticky lg:top-32">
            <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-10 italic flex items-center gap-2">
                 <ShieldCheck size={16} className="text-neon-purple" /> Protection Protocol
              </h3>
              <div className="space-y-8">
                 {[
                   { title: "Escrow Secured", desc: "Payments are held safely until you approve the final delivery.", icon: Zap },
                   { title: "Vetted Talent", desc: "Only top 1% creators with proven performance scores can bid.", icon: Target },
                   { title: "Fast Delivery", desc: "Our streamlined workspace ensures projects move 3x faster.", icon: Briefcase }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 shrink-0">
                         <item.icon size={18} />
                      </div>
                      <div>
                         <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{item.title}</h4>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed opacity-60">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5 text-center">
               <Info size={24} className="text-neon-blue mx-auto mb-4 opacity-50" />
               <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                 Need help defining your project requirements? Our AI assistant can help refine your brief for better results.
               </p>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}

"use client";

import React from "react";
import { ProjectPostForm } from "@/components/projects/ProjectPostForm";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PriceEstimator } from "@/components/ai/PriceEstimator";
import { motion } from "framer-motion";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function PostProjectPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <PageWrapper>
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">
              Initialize <span className="text-neon-purple">Production</span> Stream
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ProjectPostForm />
            </div>
            
            <div className="space-y-8">
              <PriceEstimator />
              
              <div className="glass p-8 rounded-[40px] border-white/5 bg-black/40 backdrop-blur-xl">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Production Checklist</h3>
                <div className="space-y-4">
                  {[
                    "Moodboard & References",
                    "Asset Quality Standards",
                    "Delivery Node Protocol",
                    "Revision Cycle Limits"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-neon-blue/30 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" />
                      </div>
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </RoleGuard>
  );
}

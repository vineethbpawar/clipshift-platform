"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Shield, Lock, Eye, FileText, ChevronRight, Gavel, Scale } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const sections = [
    {
      title: "Service Overview",
      content: "ClipShift is a marketplace connecting content creators with editors and videographers. We provide the infrastructure for discovery, communication, and project management.",
      icon: FileText
    },
    {
      title: "User Conduct",
      content: "All creators and clients must maintain professional conduct within the platform. Harassment, spam, or fraudulent activity will result in immediate account termination.",
      icon: Gavel
    },
    {
      title: "Payments & Fees",
      content: "Payments for project unlocks and subscriptions are final. ClipShift acts as a facilitator; project-specific payments are handled directly between users unless specified otherwise.",
      icon: Scale
    },
    {
      title: "Intellectual Property",
      content: "Creators retain ownership of their portfolios. Clients retain ownership of their project briefs and raw footage. The final edited content ownership is determined by the specific agreement between the parties.",
      icon: Shield
    }
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
              Terms of <span className="text-neon-purple">Service</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Last Updated: May 2026</p>
          </div>

          <div className="space-y-8">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-[40px] border border-white/5 group hover:border-neon-purple/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple">
                     <section.icon size={24} />
                   </div>
                   <h2 className="text-xl font-black text-white uppercase tracking-tighter">{section.title}</h2>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed uppercase tracking-wider font-medium opacity-60">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-10 glass rounded-[40px] border-white/5 text-center bg-neon-purple/[0.02]">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold leading-relaxed">
              By using ClipShift, you agree to these terms. We reserve the right to update these policies to maintain the integrity of the collective.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

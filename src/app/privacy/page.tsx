"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Shield, Lock, Eye, FileText, ChevronRight, Gavel, Scale, Database, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Data Protection",
      content: "All data transmissions are encrypted using industry-standard protocols. Your creative assets and communication remain secure within the ClipShift platform.",
      icon: Lock
    },
    {
      title: "Information Collection",
      content: "We collect only essential information required to maintain account integrity and facilitate collaborations. This includes profile details, portfolio links, and communication history.",
      icon: Database
    },
    {
      title: "Security Infrastructure",
      content: "Our infrastructure is continuously monitored for unauthorized access. We employ multi-layer security to protect the platform's data.",
      icon: ShieldCheck
    },
    {
      title: "Your Rights",
      content: "Users have full control over their profile visibility and data. You can request account deletion or data export at any time through your dashboard settings.",
      icon: Shield
    }
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
              Privacy <span className="text-neon-blue">Policy</span>
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
                className="glass p-8 rounded-[40px] border border-white/5 group hover:border-neon-blue/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center text-neon-blue">
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

          <div className="mt-16 p-10 glass rounded-[40px] border-white/5 text-center bg-neon-blue/[0.02]">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold leading-relaxed">
              ClipShift is committed to maintaining the highest standards of data privacy and security for our community.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

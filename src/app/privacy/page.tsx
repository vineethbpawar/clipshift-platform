"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Data Encryption",
      icon: Lock,
      content: "All node transmissions and personal data are encrypted using industry-standard protocols. Your creative assets and communication remain secure within the ClipShift network."
    },
    {
      title: "Information Gathering",
      icon: Eye,
      content: "We collect only essential metadata required to maintain node integrity and facilitate collaborations. This includes profile details, portfolio links, and communication history."
    },
    {
      title: "Network Security",
      icon: Shield,
      content: "Our infrastructure is continuously monitored for unauthorized access. We employ multi-layer security protocols to protect the collective's data."
    }
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Privacy <span className="text-neon-purple">Protocol</span>
          </h1>
          <p className="text-gray-500 text-lg uppercase tracking-widest text-[10px] font-black">
            ClipShift Data Protection & Privacy Policy v2.0
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {sections.map((section, i) => (
            <div key={i} className="glass p-8 rounded-[32px] border-white/5 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-neon-purple">
                <section.icon size={24} />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{section.title}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="glass p-8 md:p-12 rounded-[40px] border-white/5 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <FileText size={20} className="text-neon-blue" />
              Detailed Clauses
            </h2>
            <div className="space-y-6">
              {[
                "We do not sell node data to third-party entities.",
                "Portfolio assets remain the intellectual property of the creator.",
                "Session data is stored securely and cleared upon request.",
                "Analytics are used only to improve node discovery algorithms."
              ].map((clause, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 size={16} className="text-neon-blue mt-1 shrink-0" />
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{clause}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}

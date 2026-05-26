"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Scale, FileCheck, AlertTriangle, Info } from "lucide-react";

export default function TermsPage() {
  const terms = [
    {
      title: "Node Conduct",
      content: "All creators and clients must maintain professional conduct within the network. Harassment, spam, or fraudulent activity will result in immediate node termination."
    },
    {
      title: "Financial Protocols",
      content: "Payments for project unlocks and subscriptions are final. ClipShift acts as a facilitator; project-specific payments are handled directly between nodes unless specified otherwise."
    },
    {
      title: "Content Rights",
      content: "Creators retain all rights to their portfolio assets. By uploading content, you grant ClipShift a limited license to display it for discovery purposes."
    }
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Network <span className="text-neon-blue">Terms</span>
          </h1>
          <p className="text-gray-500 text-lg uppercase tracking-widest text-[10px] font-black">
            ClipShift Service Agreement & Protocol Guidelines
          </p>
        </div>

        <div className="space-y-8 mb-16">
          {terms.map((term, i) => (
            <div key={i} className="glass p-8 md:p-12 rounded-[40px] border-white/5 space-y-4 group hover:border-neon-blue/30 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-white/5 text-neon-blue">
                  <FileCheck size={20} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{term.title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                {term.content}
              </p>
            </div>
          ))}
        </div>

        <div className="glass p-8 rounded-[32px] border-neon-purple/20 bg-neon-purple/5 flex items-start gap-6">
          <AlertTriangle size={24} className="text-neon-purple shrink-0 mt-1" />
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Important Disclaimer</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
              ClipShift is not responsible for the quality of work delivered by independent creators or the accuracy of project briefs provided by clients. All collaborations are entered into at the discretion of the participating nodes.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

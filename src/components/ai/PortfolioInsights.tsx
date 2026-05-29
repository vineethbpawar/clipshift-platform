"use client";

import React from "react";
import { TrendingUp, Target, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const PortfolioInsights = () => {
  return (
    <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-neon-purple" size={24} />
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Portfolio Analytics</h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[8px] font-black text-neon-purple uppercase tracking-widest">
           AI Diagnostic
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Trend signals</h4>
          <div className="space-y-3">
            {[
              "High-contrast color grading is trending in music videos.",
              "Retention scores are 15% higher for 4K vertical content.",
              "Minimalist sound design converts better for commercials."
            ].map((insight, i) => (
              <div key={i} className="flex gap-3 p-4 glass rounded-2xl border-white/5 bg-black/20 group hover:border-neon-purple/30 transition-all">
                <Zap size={14} className="text-neon-purple shrink-0 mt-0.5 opacity-50 group-hover:opacity-100" />
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Growth Recommendations</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {[
               "Increase focus on high-fidelity visual transitions.",
               "Optimize portfolio descriptions for search visibility.",
               "Normalize audio levels across all showcased work.",
               "Add more varied cinematography samples."
             ].map((rec, i) => (
               <div key={i} className="flex items-center gap-4 p-5 glass rounded-2xl border-white/5 bg-black/40">
                  <div className="w-8 h-8 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                     <Target size={14} />
                  </div>
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-tight">{rec}</p>
               </div>
             ))}
          </div>
          
          <div className="mt-6 p-6 glass rounded-3xl border-white/5 bg-white/[0.01] flex items-center justify-between group cursor-pointer hover:bg-white/[0.03] transition-all">
             <div>
                <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Detailed Opportunity Report</h5>
                <p className="text-[8px] text-gray-500 uppercase font-bold">Comprehensive gap analysis and market positioning.</p>
             </div>
             <ArrowRight size={16} className="text-gray-700 group-hover:text-neon-purple group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

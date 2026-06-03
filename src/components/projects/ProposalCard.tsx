"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Zap, ArrowRight, X, Check, Sparkles, Loader2 } from "lucide-react";
import { type ProjectProposal } from "@/data/projects";
import { getCreatorMatchScoreAI } from "@/lib/gemini";

export const ProposalCard = ({ proposal, project }: { proposal: ProjectProposal, project?: any }) => {
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project && !matchData && !loading) {
      const fetchMatch = async () => {
        setLoading(true);
        try {
          const result = await getCreatorMatchScoreAI(project, {
            id: (proposal as any).freelancer_id || proposal.id,
            name: proposal.creatorName,
            category: project.category,
            rating: 4.9,
            completed_projects: 10,
            price: (proposal.amount || proposal.price).replace('₹', '')
          } as any);
          
          if (result.fallback) {
            setMatchData({
              ...result.fallback,
              isFallback: true
            });
          } else if (!result.error) {
            setMatchData(result);
          }
        } catch (e) {
          console.error("Match fetch failed");
        } finally {
          setLoading(false);
        }
      };
      fetchMatch();
    }
  }, [project, proposal]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass border-white/5 rounded-3xl p-6 relative group overflow-hidden"
    >
      {/* AI Match Overlay */}
      {matchData && (
        <div className="absolute top-0 right-0 p-2 z-10">
          <div className={`glass px-3 py-1 rounded-full border-neon-purple/30 flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)] ${matchData.isFallback ? 'bg-white/5' : 'bg-neon-purple/10'}`}>
            <Sparkles size={10} className={`${matchData.isFallback ? 'text-gray-500' : 'text-neon-purple animate-pulse'}`} />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">
              {matchData.isFallback ? "Est. Match" : `${matchData.score}% AI Match`}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl overflow-hidden glass border border-white/10 shrink-0">
          <img src={proposal.creatorImage} className="w-full h-full object-cover" alt="" />
        </div>
        <div>
          <h4 className="text-white font-black uppercase tracking-tighter flex items-center gap-2">
            {proposal.creatorName}
            <ShieldCheck size={14} className="text-neon-blue" />
          </h4>
          <div className="flex items-center gap-1">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-gray-500">4.9 Creator Score</span>
          </div>
        </div>
        <div className="ml-auto text-right pr-4">
          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Bid</div>
          <div className="text-xl font-black text-white">{proposal.amount}</div>
        </div>
      </div>

      {matchData && (
        <div className="mb-4 px-2">
           <p className="text-[8px] text-neon-purple font-black uppercase tracking-[0.2em] mb-1">Match Insight</p>
           <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">{matchData.explanation}</p>
        </div>
      )}

      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
        <p className="text-[10px] text-gray-400 leading-relaxed italic">
          &quot;{proposal.message}&quot;
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-neon-purple" />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            {proposal.daysToComplete} Days Delivery
          </span>
        </div>
        <button className="text-[10px] font-black text-neon-blue uppercase tracking-widest hover:underline">
          View Reel
        </button>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px]">
          <X size={14} />
          Decline
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] font-black uppercase tracking-widest text-[10px]">
          <Check size={14} />
          Hire Now
        </button>
      </div>
    </motion.div>
  );
};

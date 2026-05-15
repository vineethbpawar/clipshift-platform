"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Target, Search, BarChart3, ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import { getPortfolioInsights } from "@/lib/gemini";
import { useAuth } from "@/context/AuthContext";

export const PortfolioInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Use real profile data
      const portfolioData = {
        categories: user.specialization ? [user.specialization] : [],
        videoCount: 0, // Need portfolio table for this
        topPerformance: "N/A",
        recentStyles: []
      };
      
      const result = await getPortfolioInsights(portfolioData);
      setInsights(result);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="glass p-12 rounded-[40px] border-white/5 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={32} className="text-neon-purple animate-spin" />
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Synthesizing Portfolio Tensors...</p>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-[40px] border-white/5 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Insights</h3>
        <button onClick={fetchInsights} className="text-gray-500 hover:text-white transition-colors">
          <Sparkles size={16} />
        </button>
      </div>

      {/* Trending Market Tones */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-green-500" />
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Trend signals</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {(insights?.trending_styles || ["Cinematic Transitions", "HDR Color Grading", "POV Storytelling"]).map((tag: string, i: number) => (
            <motion.div 
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="px-3 py-1.5 bg-neon-purple/10 border border-neon-purple/20 rounded-full text-[9px] font-bold text-neon-purple uppercase tracking-tight flex items-center gap-1.5"
            >
              <Zap size={10} />
              {tag}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Improvement Tips */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-neon-blue" />
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Improvement Directives</h4>
        </div>
        <div className="space-y-3">
          {(insights?.improvement_tips || [
            "Diversify color palettes to include more warm-toned cinematic looks.",
            "Tighten narrative flow in the first 5 seconds of Reels.",
            "Improve audio normalization across portfolio nodes."
          ]).map((tip: string, i: number) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 leading-relaxed italic">"{tip}"</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-600 group-hover:text-neon-blue transition-colors ml-4 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Gap Analysis */}
      <div className="p-6 bg-gradient-to-br from-neon-blue/10 to-transparent rounded-3xl border border-neon-blue/20">
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
          <Search size={14} className="text-neon-blue" />
          Node Gap analysis
        </h4>
        <p className="text-[10px] text-gray-400 leading-relaxed mb-4">
          {insights?.gaps || "Our AI suggests adding more 'Drone FPV Forest Sequences' to your portfolio to capture rising market demand."}
        </p>
        <button className="text-[9px] font-black text-neon-blue uppercase tracking-widest hover:underline">Generate Content Strategy</button>
      </div>
    </div>
  );
};

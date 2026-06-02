"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Target, Zap, ShieldCheck, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getPortfolioTipsAI } from "@/lib/gemini";
import { useAuth } from "@/context/AuthContext";

export const PortfolioInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const result = await getPortfolioTipsAI({
        name: user?.name,
        specialization: user?.specialization,
        bio: user?.bio
      });
      if (!result.error) {
        setInsights(result);
      }
    } catch (e) {
      console.error("Failed to fetch portfolio insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !insights && !loading) {
      fetchInsights();
    }
  }, [user]);

  return (
    <div className="glass p-8 sm:p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent relative overflow-hidden">
      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-neon-purple" size={24} />
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Portfolio Analytics</h3>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[8px] font-black text-neon-purple uppercase tracking-widest hover:bg-neon-purple/20 transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          AI Refresh
        </button>
      </div>

      {loading && !insights ? (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin text-neon-purple" size={32} />
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Analyzing Visual Data...</p>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} className="text-neon-purple" />
              Strategic Tips
            </h4>
            <div className="space-y-3">
              {insights.tips?.map((tip: string, i: number) => (
                <div key={i} className="flex gap-3 p-4 glass rounded-2xl border-white/5 bg-black/20 group hover:border-neon-purple/30 transition-all">
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Target size={12} className="text-neon-blue" />
                Growth Roadmap
              </h4>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white uppercase tracking-widest">
                Strength: {insights.strength}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {insights.completionSuggestions?.map((rec: string, i: number) => (
                 <div key={i} className="flex items-center gap-4 p-5 glass rounded-2xl border-white/5 bg-black/40">
                    <div className="w-8 h-8 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                       <ShieldCheck size={14} />
                    </div>
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-tight">{rec}</p>
                 </div>
               ))}
            </div>
            
            <div className="mt-6 p-6 glass rounded-3xl border-white/5 bg-white/[0.01] flex items-center justify-between group">
               <div>
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1 italic">Suggested Niche: {insights.suggestedNiche}</h5>
                  <p className="text-[8px] text-gray-500 uppercase font-bold">Recommended market positioning for maximum growth.</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple group-hover:scale-110 transition-transform">
                 <ArrowRight size={18} />
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-widest italic">Could not generate AI suggestion. Please try again.</p>
        </div>
      )}
    </div>
  );
};

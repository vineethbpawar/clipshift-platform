"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Target, Search, BarChart3, ArrowUpRight } from "lucide-react";

export const PortfolioInsights = () => {
  const trendingTags = ["Cyberpunk 2077 Aesthetic", "Hyper-lapse Transition", "Vintage Grain v3", "Slow-mo Bokeh"];
  
  return (
    <div className="glass p-8 rounded-[40px] border-white/5 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Insights</h3>
        <BarChart3 size={20} className="text-neon-blue opacity-50" />
      </div>

      {/* Trending Market Tones */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-green-500" />
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Trend signals</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag, i) => (
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

      {/* Engagement Prediction */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-neon-blue" />
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Synergy Prediction</h4>
        </div>
        <div className="space-y-3">
          {[
            { title: "Urban Dusk Reel", score: 94, trend: "up" },
            { title: "Hyper-lapse City", score: 82, trend: "stable" }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
              <div>
                <h5 className="text-[11px] font-bold text-white uppercase tracking-tight mb-1">{item.title}</h5>
                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Next-Gen Engagement: {item.score}%</p>
              </div>
              <ArrowUpRight size={16} className="text-gray-600 group-hover:text-neon-blue transition-colors" />
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
          Market demand for <span className="text-white font-bold">Drone FPV Forest Sequences</span> is up 45%, but your node lacks matching samples.
        </p>
        <button className="text-[9px] font-black text-neon-blue uppercase tracking-widest hover:underline">Generate Content Strategy</button>
      </div>
    </div>
  );
};

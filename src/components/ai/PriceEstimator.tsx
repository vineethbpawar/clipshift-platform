"use client";

import React, { useState } from "react";
import { DollarSign, Zap, TrendingUp, Info, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { estimateBudgetAI } from "@/lib/gemini";

export const PriceEstimator = () => {
  const [days, setDays] = useState(3);
  const [quality, setLevel] = useState(2); // 1: Standard, 2: Pro, 3: Elite
  const [estimating, setEstimating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleAIEstimate = async () => {
    setEstimating(true);
    setAiResult(null);
    try {
      const result = await estimateBudgetAI({
        deadline: `${days} days`,
        service_type: quality === 1 ? 'editing_only' : 'editing_and_shoot',
        category: 'Professional Video'
      } as any);
      if (!result.error) {
        setAiResult(result);
      }
    } catch (e) {
      console.error("AI Estimate failed");
    } finally {
      setEstimating(false);
    }
  };

  const manualEstimate = () => {
    const base = 499;
    const dayFactor = days < 3 ? 1.5 : days < 7 ? 1.2 : 1;
    const qualityFactor = quality === 3 ? 2.5 : quality === 2 ? 1.5 : 1;
    return Math.floor(base * dayFactor * qualityFactor);
  };

  return (
    <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
      <div className="flex items-center justify-between gap-3 mb-8 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <DollarSign className="text-neon-blue" size={20} />
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] italic">Price Estimator</h3>
        </div>
        <button 
          onClick={handleAIEstimate}
          disabled={estimating}
          className="px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[8px] font-black uppercase tracking-widest hover:bg-neon-purple/20 transition-all flex items-center gap-2"
        >
          {estimating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          AI Deep Audit
        </button>
      </div>

      <div className="space-y-8">
        {aiResult ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-neon-purple/5 border border-neon-purple/20 space-y-4"
          >
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[8px] text-neon-purple font-black uppercase tracking-widest mb-1">AI Suggestion</p>
                 <h4 className="text-xl font-black text-white italic">₹{aiResult.minBudget} - ₹{aiResult.maxBudget}</h4>
               </div>
               <button onClick={() => setAiResult(null)} className="text-[8px] text-gray-500 uppercase font-black hover:text-white transition-colors">Reset</button>
             </div>
             <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">&quot;{aiResult.explanation}&quot;</p>
             <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5">
                <Zap size={12} className="text-neon-purple" />
                Timeline: {aiResult.deliveryTimeline}
             </div>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
               <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Target Delivery (Days)</span>
                  <span className="text-sm font-black text-white italic">{days} Days</span>
               </div>
               <input 
                 type="range" 
                 min="1" 
                 max="14" 
                 value={days} 
                 onChange={(e) => setDays(parseInt(e.target.value))}
                 className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-blue"
               />
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Visual Complexity</span>
                  <span className="text-sm font-black text-white italic">{quality === 1 ? 'Standard' : quality === 2 ? 'Professional' : 'Cinematic Elite'}</span>
               </div>
               <div className="flex gap-2">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`flex-1 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${quality === lvl ? 'bg-neon-blue text-white border-neon-blue' : 'glass border-white/5 text-gray-600 hover:text-white'}`}
                    >
                      Level {lvl}
                    </button>
                  ))}
               </div>
            </div>

            <div className="pt-8 border-t border-white/5">
               <div className="p-6 glass rounded-3xl bg-black/40 border border-white/5 text-center relative overflow-hidden group">
                  <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-1">Estimated Project Price</span>
                  <p className="text-3xl font-black text-white italic transition-all group-hover:scale-110 group-hover:text-neon-blue duration-500">₹{manualEstimate()}</p>
                  
                  <div className="mt-4 flex items-center justify-center gap-4">
                     <div className="flex items-center gap-1.5 text-[8px] text-green-500 font-black uppercase tracking-widest">
                        <TrendingUp size={10} /> Professional Average
                     </div>
                     <div className="w-1 h-1 rounded-full bg-gray-700" />
                     <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">
                        Based on market data
                     </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

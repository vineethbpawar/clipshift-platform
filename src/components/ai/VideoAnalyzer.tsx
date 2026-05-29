"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, CheckCircle2, Film, Search } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisResult {
  score: number;
  lighting: number;
  color: number;
  pacing: number;
  resolution: number;
  suggestions: string[];
}

export const VideoAnalyzer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const startAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setResult({
            score: 92,
            lighting: 88,
            color: 95,
            pacing: 91,
            resolution: 98,
            suggestions: [
              "Improve black level normalization in shadows.",
              "Excellent rhythmic pacing between cuts.",
              "Maintain consistent frame rate for motion tracking."
            ]
          });
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="glass p-8 sm:p-10 rounded-[50px] border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Film className="text-neon-blue" size={24} />
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">AI Production Audit</h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[8px] font-black text-neon-blue uppercase tracking-widest">
           Visual Neural engine
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {!analyzing && !result ? (
          <div className="text-center py-10">
             <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
                <Search size={32} className="text-gray-600" />
             </div>
             <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-2 italic">Ready for Audit?</h4>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-10 max-w-xs mx-auto">Upload cinematic content for professional AI diagnostics.</p>
             <button 
              onClick={startAnalysis}
              className="px-10 py-4 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-neon-blue hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 mx-auto"
             >
               <Sparkles size={16} /> Start Analysis
             </button>
          </div>
        ) : analyzing ? (
          <div className="py-12 space-y-8">
            <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
               />
            </div>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-neon-blue" size={32} />
              <p className="text-[9px] text-gray-500 font-mono tracking-widest">NEURAL_SCAN: PROCESSING_FRAMES ... {progress}%</p>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 p-6 glass rounded-3xl bg-black/40 border border-white/5 text-center">
                   <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block mb-1">Production Score</span>
                   <p className="text-3xl font-black text-neon-blue italic">{result?.score}%</p>
                </div>
                <div className="flex-1 p-6 glass rounded-3xl bg-black/40 border border-white/5 flex flex-col justify-center gap-3">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-500 italic">Pacing</span>
                      <span className="text-white">{result?.pacing}%</span>
                   </div>
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-500 italic">Color Grade</span>
                      <span className="text-white">{result?.color}%</span>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <h5 className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-2 italic">Neural Observations</h5>
                <div className="space-y-2">
                   {result?.suggestions.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-4 glass rounded-2xl border-white/5 bg-white/[0.01]">
                         <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                         <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tight leading-relaxed">{s}</p>
                      </div>
                   ))}
                </div>
             </div>

             <button 
              onClick={() => setResult(null)}
              className="w-full py-4 rounded-2xl glass border border-white/10 text-gray-400 text-[9px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
             >
               New Audit
             </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

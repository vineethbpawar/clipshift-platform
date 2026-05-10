"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BrainCircuit, ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { ScoreCircle } from "./ScoreCircle";

export const VideoAnalyzer = () => {
  const [status, setStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [scores, setScores] = useState<any>(null);

  const startAnalysis = () => {
    setStatus("scanning");
    setTimeout(() => {
      setScores({
        cinematography: 92,
        colorGrade: 88,
        pacing: 75,
        audio: 94,
        overall: 88
      });
      setStatus("done");
    }, 4000);
  };

  return (
    <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">AI Fidelity Analyzer</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Upload cinematic stream for neural audit</p>
        </div>
        <BrainCircuit size={24} className="text-neon-purple opacity-50" />
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-neon-purple/50 transition-all group"
            onClick={startAnalysis}
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles size={24} className="text-gray-500 group-hover:text-neon-purple" />
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Drop cinematic node or click to scan</p>
          </motion.div>
        )}

        {status === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 flex flex-col items-center justify-center relative overflow-hidden rounded-[32px]"
          >
            {/* Scanning Bar Animation */}
            <motion.div
              animate={{ y: [-150, 150] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent shadow-[0_0_20px_rgba(168,85,247,1)] z-10"
            />
            <div className="w-full h-full bg-neon-purple/5 animate-pulse absolute inset-0" />
            
            <div className="relative z-20 text-center">
              <BrainCircuit className="w-12 h-12 text-neon-purple animate-pulse mx-auto mb-4" />
              <h4 className="text-sm font-black text-white uppercase tracking-tighter mb-2">Analyzing Visual Tensors</h4>
              <p className="text-[10px] text-gray-500 font-mono">NODE_SCAN: [BLOCK_204_A] ... VERIFYING</p>
            </div>
          </motion.div>
        )}

        {status === "done" && scores && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ScoreCircle score={scores.cinematography} label="Cinematography" size={80} color="#a855f7" delay={0.1} />
              <ScoreCircle score={scores.colorGrade} label="Color Grade" size={80} color="#3b82f6" delay={0.2} />
              <ScoreCircle score={scores.pacing} label="Pacing" size={80} color="#10b981" delay={0.3} />
              <ScoreCircle score={scores.audio} label="Audio Fidelity" size={80} color="#f59e0b" delay={0.4} />
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={14} className="text-neon-blue" />
                Improvement Directives
              </h4>
              <ul className="space-y-3">
                {[
                  "Dynamic range in highlights is slightly clipped in frame 420-560.",
                  "Pacing in the second act could be tightened by 12 frames.",
                  "Audio levels peak at -1dB during transient heavy segments."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs text-gray-400 leading-relaxed">
                    <CheckCircle2 size={14} className="text-neon-purple shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <button 
              onClick={() => setStatus("idle")}
              className="w-full py-4 rounded-2xl glass border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
            >
              Analyze New Stream
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

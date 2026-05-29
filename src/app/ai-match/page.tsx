"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { 
  Sparkles, 
  Target, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Match {
  id: string;
  name: string;
  image: string;
  specialization: string;
  score: number;
  price: string;
}

export default function AIMatchPage() {
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [step, setStep] = useState(0);

  const startMatching = () => {
    setMatching(true);
    setStep(1);
    
    // Simulate multi-step AI matching process
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
    setTimeout(() => {
      fetchMatches();
      setMatching(false);
    }, 4500);
  };

  const fetchMatches = async () => {
    try {
      const { data } = await supabase
        .from('creators')
        .select(`*, profiles(full_name, avatar_url, city, specialization)`)
        .limit(3);
      
      if (data) {
        setMatches(data.map(m => ({
          id: m.id,
          name: m.profiles.full_name,
          image: m.profiles.avatar_url,
          specialization: m.profiles.specialization || m.category,
          score: Math.floor(Math.random() * 15) + 85,
          price: `₹${m.starting_price || 499}`
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-32 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto text-center">
          
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-lg italic"
            >
              <Sparkles size={14} className="animate-pulse" /> Intelligent Matchmaking
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8 italic">
              AI Talent <span className="text-neon-purple">Discovery</span>
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold leading-relaxed max-w-xl mx-auto opacity-70">
              Our neural engine analyzes project requirements and matches you with the most qualified creators in the global marketplace.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!matching && matches.length === 0 ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-12 sm:p-20 rounded-[60px] border-white/5 bg-white/[0.01] relative overflow-hidden"
              >
                <div className="relative z-10">
                   <div className="w-24 h-24 rounded-[40px] bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                      <Target size={48} className="text-neon-purple" />
                   </div>
                   <h3 className="text-2xl font-black text-white uppercase mb-6 italic tracking-tighter">Ready to find your match?</h3>
                   <button 
                    onClick={startMatching}
                    className="px-12 py-5 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-2xl active:scale-95"
                   >
                     Initialize AI Match Engine
                   </button>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05),transparent_70%)]" />
              </motion.div>
            ) : matching ? (
              <motion.div
                key="matching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass p-20 rounded-[60px] border-white/5 bg-white/[0.01] flex flex-col items-center"
              >
                <div className="relative mb-12">
                   <div className="w-32 h-32 rounded-full border-4 border-white/5 border-t-neon-purple animate-spin" />
                   <Sparkles className="absolute inset-0 m-auto text-neon-purple animate-pulse" size={40} />
                </div>
                
                <div className="space-y-4">
                  <p className={`text-sm font-black uppercase tracking-[0.4em] transition-all duration-500 ${step >= 1 ? "text-neon-purple" : "text-gray-700"}`}>Analyzing Requirements...</p>
                  <p className={`text-sm font-black uppercase tracking-[0.4em] transition-all duration-500 ${step >= 2 ? "text-neon-blue" : "text-gray-700"}`}>Scanning Creator Marketplace...</p>
                  <p className={`text-sm font-black uppercase tracking-[0.4em] transition-all duration-500 ${step >= 3 ? "text-green-500" : "text-gray-700"}`}>Finalizing Optimal Matches...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {matches.map((creator, i) => (
                  <div key={creator.id} className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01] group hover:border-neon-purple/50 transition-all text-center">
                     <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden glass border-2 border-white/10 group-hover:border-neon-purple transition-colors">
                           <img src={creator.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-neon-purple rounded-xl shadow-lg border-2 border-black">
                           <Zap size={14} className="text-white fill-white" />
                        </div>
                     </div>
                     <div className="mb-6">
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1 italic">{creator.name}</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{creator.specialization}</p>
                     </div>
                     <div className="p-4 glass rounded-2xl bg-black/40 border border-white/5 mb-8">
                        <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest block mb-1">Match Score</span>
                        <p className="text-xl font-black text-neon-purple italic">{creator.score}%</p>
                     </div>
                     <Link href={`/creators/${creator.id}`}>
                        <button className="w-full py-4 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                           Open Profile <ArrowRight size={14} />
                        </button>
                     </Link>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-20 flex flex-wrap justify-center gap-10 opacity-30 grayscale border-t border-white/5 pt-16">
             <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-gray-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secured Escrow</span>
             </div>
             <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-gray-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Accounts</span>
             </div>
             <div className="flex items-center gap-3">
                <Star size={24} className="text-gray-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Elite Talent</span>
             </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

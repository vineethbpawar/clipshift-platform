"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { creators, Creator } from "@/data/creators";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, ArrowRight, BrainCircuit } from "lucide-react";
import Link from "next/link";

import { matchCreators } from "@/lib/gemini";

interface MatchResult extends Creator {
  matchScore: number;
  aiReason: string;
}

export default function AIMatchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "Cinematic Reel",
    budget: "",
    style: "",
    location: ""
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setResults([]);

    try {
      const matchedData = await matchCreators(formData, creators);
      const matches = (matchedData as { id: string; score: number; reason: string }[]).map((match) => {
        const creator = creators.find(c => c.id === match.id) || creators[0]; // Fallback to first creator if ID mismatch
        return {
          ...creator,
          matchScore: match.score,
          aiReason: match.reason
        };
      }).sort((a, b) => b.matchScore - a.matchScore);
      setResults(matches);
    } catch (error) {
      console.error("Matching failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 glass border-neon-purple/20 rounded-full mb-6"
          >
            <Sparkles size={16} className="text-neon-purple" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Matching Engine v2.4</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight mb-6">
            Find Your <span className="text-neon-purple">Perfect</span> Synergy
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Our AI analyzes portfolio fidelity, communication patterns, and delivery metrics to find the elite creator for your specific vision.
          </p>
        </div>

        {/* Search Form */}
        <div className="glass p-8 md:p-12 rounded-[40px] border-white/5 mb-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Project Architecture</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-purple transition-all appearance-none"
              >
                <option>Cinematic Reel</option>
                <option>Music Video Production</option>
                <option>Corporate Narrative</option>
                <option>Commercial Campaign</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Capital Allocation (Budget)</label>
              <input 
                type="text" 
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. ₹50,000 - ₹1,00,000" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-purple transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Deployment Zone (Location)</label>
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mumbai, Virtual" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-purple transition-all" 
              />
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Stylistic Directives</label>
              <input 
                type="text"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="e.g. Dark, Moody, High-Key" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-neon-purple transition-all" 
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                disabled={isSearching}
                className="w-full py-5 rounded-2xl bg-neon-purple text-white font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <BrainCircuit className="animate-spin" size={20} />
                    Processing Node Streams...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Initialize AI Matching
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <AnimatePresence>
            {results.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="glass rounded-3xl border-white/5 p-6 hover:border-white/10 transition-all group overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden glass border border-white/10 group-hover:border-neon-purple/50 transition-colors">
                      <img src={creator.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black shadow-lg ${
                      creator.matchScore >= 90 ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]" :
                      creator.matchScore >= 70 ? "bg-neon-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                      "bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    }`}>
                      {creator.matchScore}% Match
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center justify-center md:justify-start gap-2 mb-2">
                      {creator.name}
                      {creator.verified && <ShieldCheck size={18} className="text-neon-blue" />}
                    </h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-gray-400 uppercase tracking-widest">{creator.category}</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-gray-400 uppercase tracking-widest">{creator.city}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
                      Specializes in {creator.category.toLowerCase()} with a focus on high-fidelity visual storytelling.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link href={`/chat/${creator.id}`}>
                      <button className="w-full md:w-auto px-8 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all flex items-center justify-center gap-2">
                        Open Signal <ArrowRight size={14} />
                      </button>
                    </Link>
                    <button 
                      onClick={() => setExpandedId(expandedId === creator.id ? null : creator.id)}
                      className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                    >
                      {expandedId === creator.id ? "Close Insights" : "Why this match?"}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === creator.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-white/5 bg-neon-purple/5 p-6 rounded-2xl">
                        <h4 className="text-[10px] font-black text-neon-purple uppercase tracking-widest mb-3 flex items-center gap-2">
                          <BrainCircuit size={12} />
                          AI Inference Result
                        </h4>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                          &quot;{creator.aiReason}&quot;
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NeonButton } from "../ui/NeonButton";
import { Play, ArrowRight, Loader2, Target, Briefcase, Zap, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const Hero = () => {
  const [stats, setStats] = useState({
    creators: 0,
    assets: 0,
    projects: 0,
    countries: 1
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: creatorCount } = await supabase.from('creators').select('*', { count: 'exact', head: true });
      
      setStats({
        creators: creatorCount || 0,
        assets: 0, 
        projects: 0,
        countries: 1
      });
    };
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-black">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-96 md:h-96 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 md:w-96 md:h-96 bg-neon-blue/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/10 bg-white/5 text-neon-purple text-[10px] md:text-xs font-black tracking-widest uppercase mb-10 shadow-lg italic">
            <Zap size={14} className="fill-neon-purple" /> Professional Visual Marketplace
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[1] md:leading-[0.85] italic">
            HIRE ELITE <br />
            <span className="text-gradient">VISUAL CREATORS</span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed uppercase tracking-widest font-medium opacity-70">
            ClipShift connects high-impact creators with world-class editors and videographers to produce professional cinematic content.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] hover:bg-neon-purple hover:text-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] active:scale-95 flex items-center justify-center gap-3">
                Find Talent <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-5 rounded-2xl glass border-white/10 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-3">
                Join Marketplace
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-24 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-5xl mx-auto pt-16 border-t border-white/5"
        >
          {[
            { label: "Elite Creators", value: stats.creators, icon: Target },
            { label: "Project Briefs", value: stats.assets, icon: Briefcase },
            { label: "Active Jobs", value: stats.projects, icon: Zap },
            { label: "Global Users", value: stats.countries, icon: Globe },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-2xl md:text-4xl font-black text-white mb-2 italic group-hover:text-neon-purple transition-colors">
                {stat.value > 0 ? stat.value : <span className="text-gray-800">0</span>}
              </div>
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em] opacity-60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-10 hidden lg:block">
         <div className="flex flex-col gap-4">
            <div className="w-1 h-12 bg-gradient-to-b from-neon-purple to-transparent opacity-30 rounded-full" />
            <span className="text-[8px] font-black text-gray-700 uppercase vertical-text tracking-[0.5em]">Scroll Down</span>
         </div>
      </div>
    </section>
  );
};

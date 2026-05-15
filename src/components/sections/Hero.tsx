"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NeonButton } from "../ui/NeonButton";
import { Play, ArrowRight, Loader2 } from "lucide-react";
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
      const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      setStats({
        creators: creatorCount || 0,
        assets: 0, // Placeholder
        projects: 0, // Placeholder
        countries: 1
      });
    };
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-96 md:h-96 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 md:w-96 md:h-96 bg-neon-blue/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass border-neon-purple/20 text-neon-purple text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 md:mb-8">
            The Future of Creator Commerce
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 md:mb-8 leading-[1] md:leading-[0.9]">
            ELEVATE YOUR <br />
            <span className="text-gradient">CINEMATIC REIGN</span>
          </h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
            ClipShift is the premium marketplace where master creators trade cinematic assets, 
            exclusive VFX, and high-fidelity 3D environments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <NeonButton variant="purple" size="lg" className="group w-full sm:w-auto">
                Explore Marketplace
                <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </NeonButton>
            </Link>
            <button className="flex items-center space-x-3 text-white font-bold hover:text-neon-blue transition-colors px-6 py-3">
              <span className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 glass-hover">
                <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
              </span>
              <span className="text-sm md:text-base">Watch Reel</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-4xl mx-auto"
        >
          {[
            { label: "Active Creators", value: stats.creators },
            { label: "Premium Assets", value: stats.assets },
            { label: "Active Projects", value: stats.projects },
            { label: "Global Nodes", value: stats.countries },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                {stat.value > 0 ? stat.value : <span className="text-gray-800">0</span>}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

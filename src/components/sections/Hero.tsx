"use client";

import React from "react";
import { motion } from "framer-motion";
import { NeonButton } from "../ui/NeonButton";
import { Play, ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Background Grid - subtle */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass border-neon-purple/20 text-neon-purple text-xs font-bold tracking-widest uppercase mb-8">
            The Future of Creator Commerce
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
            ELEVATE YOUR <br />
            <span className="text-gradient">CINEMATIC REIGN</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            ClipShift is the premium marketplace where master creators trade cinematic assets, 
            exclusive VFX, and high-fidelity 3D environments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <NeonButton variant="purple" size="lg" className="group">
              Explore Marketplace
              <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </NeonButton>
            <button className="flex items-center space-x-3 text-white font-bold hover:text-neon-blue transition-colors px-6 py-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 glass-hover">
                <Play size={20} fill="currentColor" />
              </span>
              <span>Watch Reel</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Section in Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
        >
          {[
            { label: "Active Creators", value: "12K+" },
            { label: "Premium Assets", value: "85K+" },
            { label: "Total Volume", value: "$42M+" },
            { label: "Countries", value: "150+" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

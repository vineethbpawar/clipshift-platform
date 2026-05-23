"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { 
  Zap, CheckCircle2, ShieldCheck, Sparkles, 
  TrendingUp, Award, Users, BarChart3, 
  Gem, Rocket, Briefcase, Crown
} from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [tab, setTab] = useState<"creator" | "client">("creator");

  const creatorPlans = [
    {
      name: "Free Creator",
      price: "₹0",
      icon: Gem,
      color: "gray",
      features: [
        "Basic Profile Node",
        "Limited Portfolio Items",
        "Standard Ranking Score",
        "Community Access"
      ]
    },
    {
      name: "Creator Pro",
      price: "₹199",
      period: "/mo",
      icon: Rocket,
      color: "blue",
      popular: true,
      features: [
        "Boosted Ranking Score (+5)",
        "Featured Node Badge",
        "10+ Portfolio Uploads",
        "Basic Node Analytics",
        "Priority Lead Discovery"
      ]
    },
    {
      name: "Creator Premium",
      price: "₹499",
      period: "/mo",
      icon: Crown,
      color: "purple",
      features: [
        "Max Ranking Boost (+10)",
        "Premium verified Badge",
        "Unlimited Portfolio Node",
        "Advanced Neural Analytics",
        "0% Commission on Assets",
        "Dedicated Node Support"
      ]
    }
  ];

  const clientPlans = [
    {
      name: "Free Client",
      price: "₹0",
      icon: Briefcase,
      color: "gray",
      features: [
        "Post Standard Projects",
        "Standard Talent Discovery",
        "Standard Unlock Fees",
        "Basic Dashboard"
      ]
    },
    {
      name: "Client Pro",
      price: "₹299",
      period: "/mo",
      icon: Sparkles,
      color: "blue",
      popular: true,
      features: [
        "20% Discount on Unlocks",
        "Priority Project Visibility",
        "Access to Top 1% Creators",
        "Save & Shortlist Talent",
        "Priority Proposal Review"
      ]
    },
    {
      name: "Client Business",
      price: "₹999",
      period: "/mo",
      icon: Award,
      color: "purple",
      features: [
        "Bulk Project Posting",
        "Team Hiring Protocol",
        "Advanced Node Management",
        "Dedicated Account Lead",
        "Cinematic Quality Audit"
      ]
    }
  ];

  const plans = tab === "creator" ? creatorPlans : clientPlans;

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Select Your <span className="text-neon-purple">Protocol</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto uppercase tracking-widest text-[10px] font-black">
            Elevate your cinematic workflow with premium network features
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="p-1.5 glass rounded-2xl border border-white/5 flex gap-2">
            <button
              onClick={() => setTab("creator")}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                tab === "creator" ? "bg-neon-purple text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              For Creators
            </button>
            <button
              onClick={() => setTab("client")}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                tab === "client" ? "bg-neon-blue text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              For Clients
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass p-8 rounded-[40px] border-white/5 flex flex-col group ${
                plan.popular ? "border-neon-purple/30 bg-neon-purple/[0.02]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-neon-purple rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                  Most Optimized
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center border ${
                  plan.color === 'purple' ? "bg-neon-purple/10 border-neon-purple/20 text-neon-purple" :
                  plan.color === 'blue' ? "bg-neon-blue/10 border-neon-blue/20 text-neon-blue" :
                  "bg-white/5 border-white/10 text-gray-400"
                }`}>
                  <plan.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className={plan.color === 'purple' ? "text-neon-purple" : "text-neon-blue"} />
                    <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest leading-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                plan.color === 'purple' ? "bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105" :
                plan.color === 'blue' ? "bg-neon-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105" :
                "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              }`}>
                Upgrade Node
              </button>
            </motion.div>
          ))}
        </div>

        {/* Global Features Info */}
        <div className="mt-20 glass p-8 md:p-12 rounded-[40px] border-white/5 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
             <ShieldCheck className="text-neon-blue" size={24} />
             <h4 className="text-[10px] font-black text-white uppercase">Vetted Security</h4>
             <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">End-to-end encryption for all cinematic node signals.</p>
          </div>
          <div className="space-y-3">
             <Users className="text-neon-purple" size={24} />
             <h4 className="text-[10px] font-black text-white uppercase">Elite Network</h4>
             <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">Access to the top 5% of independent creative talent.</p>
          </div>
          <div className="space-y-3">
             <BarChart3 className="text-green-500" size={24} />
             <h4 className="text-[10px] font-black text-white uppercase">AI Auditing</h4>
             <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">Neural quality checks for every project delivery.</p>
          </div>
          <div className="space-y-3">
             <TrendingUp className="text-neon-blue" size={24} />
             <h4 className="text-[10px] font-black text-white uppercase">Scale Ready</h4>
             <p className="text-[9px] text-gray-500 uppercase tracking-widest leading-relaxed">Enterprise infrastructure for massive production streams.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

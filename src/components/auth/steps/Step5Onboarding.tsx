"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { CheckCircle2, Star, Rocket, Shield } from "lucide-react";

export const Step5Onboarding = () => {
  const { role, signUp, signupData } = useAuth();

  const roleContent = {
    client: {
      title: "Welcome, Visionary",
      subtitle: "Your journey to premium cinema begins here.",
      features: [
        "Access to exclusive cinematic asset drops",
        "Direct hire workflow for verified creators",
        "Priority support for high-scale productions",
        "Custom license management dashboard"
      ],
      icon: Star
    },
    editor: {
      title: "Master of Post-Production",
      subtitle: "Prepare to elevate your narrative cutting.",
      features: [
        "Showcase your VFX & Color grading portfolio",
        "Accept high-value editing commissions",
        "Integrated feedback loops for seamless reviews",
        "Exclusive access to raw cinematic stocks"
      ],
      icon: Rocket
    },
    videographer: {
      title: "Cinematic Storyteller",
      subtitle: "The world is your canvas, high-fidelity your ink.",
      features: [
        "Market your raw footage and environments",
        "Get hired for location-specific productions",
        "Equipment verification badge system",
        "Creator-first royalty structures"
      ],
      icon: Shield
    }
  };

  const content = (role && role in roleContent) 
    ? roleContent[role as keyof typeof roleContent] 
    : roleContent.client;
  const Icon = content.icon;

  const handleFinish = async () => {
    try {
      await signUp(signupData.password || "");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-neon-purple/20 text-neon-purple shadow-[0_0_30px_rgba(168,85,247,0.2)]"
      >
        <Icon size={40} />
      </motion.div>

      <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">{content.title}</h2>
      <p className="text-gray-400 mb-12">{content.subtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {content.features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start p-4 glass border-white/5 rounded-2xl text-left"
          >
            <CheckCircle2 className="text-neon-purple mr-3 mt-1 shrink-0" size={18} />
            <span className="text-sm text-gray-300">{feature}</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleFinish}
        className="w-full px-12 py-5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(168,85,247,0.4)]"
      >
        Enter ClipShift
      </motion.button>
    </div>
  );
};

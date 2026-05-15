"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { CheckCircle2, Star, Rocket, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const Step5Onboarding = () => {
  const { role, signUp, signupData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>(null);

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
    creator: {
      title: "Cinematic Creator",
      subtitle: "The world is your canvas, high-fidelity your ink.",
      features: [
        "Showcase your VFX, Color grading & Cinematography",
        "Market your raw footage and environments",
        "Accept high-value cinematic commissions",
        "Creator-first royalty structures & gear verification"
      ],
      icon: Rocket
    }
  };

  const content = (role && role in roleContent) 
    ? roleContent[role as keyof typeof roleContent] 
    : roleContent.client;
  const Icon = content.icon;

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check for existing profile role
      const { data: existingRole, error: rpcError } = await supabase.rpc("get_existing_profile_role", { 
        input_email: signupData.email 
      });

      if (rpcError) {
        console.error("RPC Error checking role:", rpcError);
      }

      if (existingRole) {
        if (role === "creator" && existingRole === "client") {
          setError("This email is already registered as a Client profile. Please change category to Client or use another email.");
          setLoading(false);
          return;
        }
        if (role === "client" && existingRole === "creator") {
          setError("This email is already registered as a Creator profile. Please change category to Creator or use another email.");
          setLoading(false);
          return;
        }
        if (role === existingRole) {
          setError(
            <div className="flex flex-col gap-2">
              <span>This email is already registered. Please login instead.</span>
              <Link href="/auth/login" className="underline font-black">Login Now</Link>
            </div> as any
          );
          setLoading(false);
          return;
        }
      }

      // 2. Proceed with signup
      await signUp(signupData.password || "");
      toast.success("Welcome to the Collective!");
    } catch (err: any) {
      console.error("Signup error in component:", err);
      let errorMessage = err.message || "Failed to create account";
      
      if (errorMessage.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to Supabase. Check internet/network and try again.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleFinish}
        disabled={loading}
        className="w-full px-12 py-5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(168,85,247,0.4)] disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Enter ClipShift"}
      </motion.button>
    </div>
  );
};

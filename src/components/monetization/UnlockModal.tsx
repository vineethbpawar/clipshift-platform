"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, ShieldCheck, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { PricingCard } from "./PricingCard";
import { type Creator, type CreatorLevel } from "@/data/creators";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const UnlockModal = ({ creator, isOpen, onClose }: { creator: Creator, isOpen: boolean, onClose: () => void }) => {
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const { unlockCreator } = useAuth();
  const router = useRouter();

  const pricingTiers = {
    Beginner: { price: "₹29", features: ["Unlimited Chat", "Direct Messaging", "Standard Support"] },
    Standard: { price: "₹49", features: ["Unlimited Chat", "Project Invites", "Priority Support"] },
    Professional: { price: "₹59", features: ["Unlimited Chat", "Raw Footage Access", "Commercial Rights"] },
    Premium: { price: "₹99", features: ["Unlimited Chat", "Exclusive Asset Drops", "24/7 Dedicated Support"] }
  };

  const handleUnlock = () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      unlockCreator(creator.id);
      setTimeout(() => {
        router.push(`/chat/${creator.id}`);
      }, 2000);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl glass border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden"
      >
        {status === "idle" && (
          <>
            <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-16 h-16 rounded-3xl bg-neon-purple/20 text-neon-purple flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                Unlock Direct <span className="text-neon-purple">Access</span>
              </h2>
              <p className="text-gray-400 max-w-md">
                Secure a permanent connection with <span className="text-white font-bold">{creator.name}</span>. No subscriptions, just a one-time unlock fee.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(pricingTiers) as CreatorLevel[]).map((level) => (
                <PricingCard
                  key={level}
                  level={level}
                  price={pricingTiers[level].price}
                  features={pricingTiers[level].features}
                  isTarget={creator.level === level}
                  onSelect={handleUnlock}
                />
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
              <ShieldCheck size={14} className="text-neon-blue" />
              Secure Encrypted Transaction
            </div>
          </>
        )}

        {status === "processing" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 size={64} className="text-neon-purple animate-spin mb-8" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2 italic animate-pulse">Syncing Blockchain Payment...</h3>
            <p className="text-gray-500">Verifying transaction hash on the network</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-24 h-24 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.4)]"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Connection <span className="text-neon-blue">Unlocked</span></h3>
            <p className="text-gray-400">Redirecting to cinematic chat with {creator.name}...</p>
            
            {/* Visual Confetti / Sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: (Math.random() - 0.5) * 400, 
                    x: (Math.random() - 0.5) * 400 
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                  className="absolute top-1/2 left-1/2 w-1 h-1 bg-neon-purple rounded-full"
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

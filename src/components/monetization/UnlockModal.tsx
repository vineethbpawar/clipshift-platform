"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, ShieldCheck, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PricingCard } from "./PricingCard";
import { type Creator, type CreatorLevel } from "@/data/creators";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { loadRazorpayScript } from "@/lib/razorpay";

export const UnlockModal = ({ creator, isOpen, onClose }: { creator: Creator, isOpen: boolean, onClose: () => void }) => {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { unlockCreator, user } = useAuth();
  const router = useRouter();

  const pricingTiers = {
    Beginner: { price: "₹29", amount: 2900, features: ["Unlimited Chat", "Direct Messaging", "Standard Support"] },
    Standard: { price: "₹49", amount: 4900, features: ["Unlimited Chat", "Project Invites", "Priority Support"] },
    Professional: { price: "₹59", amount: 5900, features: ["Unlimited Chat", "Raw Footage Access", "Commercial Rights"] },
    Premium: { price: "₹99", amount: 9900, features: ["Unlimited Chat", "Exclusive Asset Drops", "24/7 Dedicated Support"] }
  };

  const handleUnlock = async (level: CreatorLevel) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setStatus("processing");
    
    try {
      // 1. Load Razorpay Script
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      // 2. Create Order via API
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: pricingTiers[level].amount,
          currency: "INR",
          receipt: `unlock_${creator.id}_${Date.now()}`
        })
      });
      const orderData = await orderRes.json();

      if (orderData.error) throw new Error(orderData.error);

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClipShift",
        description: `Unlock chat with ${creator.name}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          // 4. Verify Payment via API
          setStatus("processing");
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              client_id: user.id,
              creator_id: creator.id,
              amount: pricingTiers[level].amount
            })
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setStatus("success");
            unlockCreator(creator.id);
            setTimeout(() => {
              router.push(`/chat/${creator.id}`);
            }, 2500);
          } else {
            throw new Error(verifyData.error || "Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#a855f7",
        },
        modal: {
          ondismiss: () => setStatus("idle")
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred during payment.");
    }
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
        {(status === "idle" || status === "error") && (
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
              
              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm"
                >
                  <AlertCircle size={18} />
                  {errorMessage}
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(pricingTiers) as CreatorLevel[]).map((level) => (
                <PricingCard
                  key={level}
                  level={level}
                  price={pricingTiers[level].price}
                  features={pricingTiers[level].features}
                  isTarget={creator.level === level}
                  onSelect={() => handleUnlock(level)}
                />
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
              <ShieldCheck size={14} className="text-neon-blue" />
              Secure Encrypted Transaction via Razorpay
            </div>
          </>
        )}

        {status === "processing" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 size={64} className="text-neon-purple animate-spin mb-8" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2 italic animate-pulse">Initializing Secure Gateway...</h3>
            <p className="text-gray-500">Connecting to Razorpay network</p>
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
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Payment <span className="text-neon-blue">Verified</span></h3>
            <p className="text-gray-400">Successfully unlocked {creator.name}. Redirecting to chat...</p>
            
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

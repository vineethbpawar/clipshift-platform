"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, ShieldCheck, Loader2, CheckCircle2, AlertCircle, Zap, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { loadRazorpayScript } from "@/lib/razorpay";
import { getUnlockFee } from "@/lib/creators";
import { getActivePlan, getClientUnlockDiscount } from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export const UnlockModal = ({ creator, isOpen, onClose }: { creator: any, isOpen: boolean, onClose: () => void }) => {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const baseFee = getUnlockFee(creator.tier || 'beginner');
  const activePlan = getActivePlan(user as any);
  const discountPercent = getClientUnlockDiscount(activePlan);
  const discountAmount = Math.round((baseFee * discountPercent) / 100);
  const finalFee = baseFee - discountAmount;

  const handleUnlock = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'client') {
      toast.error("Only clients can unlock creators.");
      return;
    }

    setStatus("processing");
    
    try {
      // 1. Load Razorpay Script
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load.");

      // 2. Create Order via API
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalFee * 100, // to paise
          currency: "INR",
          receipt: `c_unlock_${creator.id}_${Date.now()}`
        })
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClipShift Collective",
        description: `Establish permanent node connection with ${creator.full_name || creator.name}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          setStatus("processing");
          
          try {
            // 4. Verify & Record Unlock via Server
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type: 'creator_unlock',
                payload: {
                  client_id: user.id,
                  creator_id: creator.id,
                  amount: finalFee * 100
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            // 5. Create/Get Direct Conversation
            const { data: existingConv } = await supabase
              .from('conversations')
              .select('id')
              .eq('client_id', user.id)
              .eq('creator_id', creator.id)
              .eq('conversation_type', 'direct')
              .maybeSingle();

            let conversationId = existingConv?.id;

            if (!conversationId) {
              const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert({
                  client_id: user.id,
                  creator_id: creator.id,
                  conversation_type: 'direct',
                  last_message: "Direct connection established.",
                  last_message_at: new Date().toISOString()
                })
                .select()
                .single();
              
              if (convError) throw convError;
              conversationId = newConv.id;

              // Initial message
              await supabase.from('messages').insert({
                conversation_id: conversationId,
                sender_id: user.id,
                receiver_id: creator.id,
                content: `Hi ${creator.full_name || creator.name}, I've unlocked your node for collaboration.`
              });
            }

            setStatus("success");
            toast.success("Node Unlocked!");
            setTimeout(() => router.push(`/chat/${conversationId}`), 2000);
          } catch (err: any) {
            console.error("VERIFICATION ERROR:", err);
            setStatus("error");
            setErrorMessage(err.message || "Verification failed.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#a855f7" },
        modal: { ondismiss: () => setStatus("idle") }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Gateway error.");
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
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg glass border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-purple animate-pulse" />

        {(status === "idle" || status === "error") && (
          <>
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-neon-purple/20 text-neon-purple flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <Zap size={40} className="fill-neon-purple" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-none">
                Unlock <span className="text-neon-purple">Direct Access</span>
              </h2>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Permanent Node ID-{creator.id?.slice(0,8)}</p>
              
              {status === "error" && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest w-full justify-center">
                  <AlertCircle size={14} />
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="glass p-6 rounded-3xl border-white/5 bg-white/5">
                <div className="space-y-2 mb-4 border-b border-white/5 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Base Protocol Fee</span>
                    <span className="text-sm font-bold text-gray-400 line-through">₹{baseFee}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neon-blue uppercase font-black tracking-widest">{activePlan.replace('_', ' ')} Discount</span>
                      <span className="text-xs font-bold text-neon-blue">-{discountPercent}% (₹{discountAmount})</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-white uppercase font-black tracking-widest">Final Authorization Fee</span>
                    <span className="text-2xl font-black text-white">₹{finalFee}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    "Direct Cinematic Messaging",
                    "Permanent Node Access",
                    "Project Invitation Priority",
                    "Secure Signal Encryption"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                      <CheckCircle2 size={12} className="text-neon-blue" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUnlock}
                className="w-full py-5 rounded-2xl bg-neon-purple text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Confirm & Authorize (₹{finalFee})
              </button>

              <div className="flex items-center justify-center gap-2 text-[8px] text-gray-600 uppercase font-black tracking-widest">
                <ShieldCheck size={10} className="text-neon-blue" />
                Vetted Node Payment Protocol v2.4
              </div>
            </div>
          </>
        )}

        {status === "processing" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <Loader2 size={64} className="text-neon-purple animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={20} className="text-neon-blue animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-2 italic animate-pulse">Syncing Gateway...</h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Verifying transaction integrity</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Signal <span className="text-green-500">Established</span></h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Node ID Access Granted. Redirecting...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

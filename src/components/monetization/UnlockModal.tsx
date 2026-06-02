"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, AlertCircle, Zap, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toast } from "react-hot-toast";
import { type Creator } from "@/data/creators";
import Image from "next/image";

interface UnlockModalProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
}

export const UnlockModal = ({ creator, isOpen, onClose }: UnlockModalProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const baseFee = 49;
  const finalFee = baseFee;

  const handleUnlock = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setStatus("loading");
    
    try {
      // 1. Load Razorpay Script
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load.");

      // 2. Create Order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalFee,
          actionType: 'unlock_creator_chat',
          userId: user.id,
          payload: { creator_id: creator.id }
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
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
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
              .maybeSingle();

            let conversationId = existingConv?.id;

            if (!conversationId) {
              const { data: newConv, error: convError } = await supabase
                .from('conversations')
                .insert({
                  client_id: user.id,
                  creator_id: creator.id,
                  last_message: "Project collaboration initiated.",
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
                content: `Hi ${creator.name}, I've unlocked your profile for project collaboration.`
              });
            }

            setStatus("success");
            toast.success("Creator Unlocked!");
            setTimeout(() => router.push(`/chat/${conversationId}`), 2000);
          } catch (err: unknown) {
            console.error("VERIFICATION ERROR:", err);
            setStatus("error");
            const errorMsg = err instanceof Error ? err.message : "Verification failed.";
            setErrorMessage(errorMsg);
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

      const paymentObject = new (window as unknown as { Razorpay: { new (options: unknown): { open: () => void } } }).Razorpay(options);
      paymentObject.open();

    } catch (err: unknown) {
      console.error("UNLOCK ERROR:", err);
      setStatus("error");
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate payment.";
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg glass rounded-[50px] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        {status === "idle" || status === "loading" ? (
          <div className="p-8 sm:p-12">
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 glass rounded-2xl text-gray-500 hover:text-white transition-colors border border-white/5"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-10">
               <div className="w-16 h-16 rounded-[28px] bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                 <Zap size={32} />
               </div>
               <div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Unlock Creator</h2>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Permanent access to this creator</p>
               </div>
            </div>

            <div className="space-y-6 mb-12">
              <div className="flex items-center justify-between p-6 glass rounded-3xl border-white/5 bg-black/40">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden glass border border-white/10">
                    <Image src={creator.image || ""} fill className="object-cover" alt={creator.name} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">{creator.name}</h4>
                    <p className="text-[9px] text-neon-blue font-bold uppercase tracking-widest">{creator.specialty?.[0] || "Visual Creator"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">One-time Fee</span>
                  <span className="text-xl font-black text-white italic">₹{finalFee}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  "Direct Messaging Forever",
                  "Permanent Connection",
                  "Secure File Sharing",
                  "Professional Collaboration"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleUnlock}
              disabled={status === "loading"}
              className="w-full py-6 bg-white text-black rounded-[30px] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-neon-purple hover:text-white active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Unlock Access Now <ChevronRight size={18} /></>
              )}
            </button>
            
            <p className="text-center mt-6 text-[8px] text-gray-600 uppercase font-black tracking-widest opacity-50">
              Payments are secured via Razorpay. Encrypted Transaction.
            </p>
          </div>
        ) : status === "processing" ? (
          <div className="p-16 text-center">
            <Loader2 className="animate-spin text-neon-purple mx-auto mb-8" size={64} />
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">Verifying Payment</h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">Please wait while we finalize your connection...</p>
          </div>
        ) : status === "success" ? (
          <div className="p-16 text-center">
            <div className="w-24 h-24 rounded-[40px] bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
               <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic text-gradient">Access Granted</h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed mb-8">Connection established. Redirecting to messages...</p>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-24 h-24 rounded-[40px] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-10">
               <AlertCircle size={48} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">Payment Failed</h3>
            <p className="text-[10px] text-red-500/60 uppercase font-black tracking-widest leading-relaxed mb-10">{errorMessage}</p>
            <button 
              onClick={() => setStatus("idle")}
              className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neon-purple hover:text-white transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { 
  CheckCircle2, Sparkles, 
  TrendingUp, Loader2, Info,
  Shield, Rocket, Target
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  color: string;
  icon: React.ElementType;
  recommended?: boolean;
  isAction?: boolean;
}

export default function PricingPage() {
  const { user, activePlan } = useAuth();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const creatorPlans: Plan[] = [
    {
      id: "free",
      name: "Starter",
      price: "0",
      description: "Perfect for beginners entering the professional market.",
      features: [
        "Professional Profile",
        "Public Portfolio (10 items)",
        "Marketplace Visibility",
        "Standard Support"
      ],
      color: "gray",
      icon: Target
    },
    {
      id: "creator_pro",
      name: "Professional",
      price: "499",
      description: "Enhanced tools for serious cinematic editors.",
      features: [
        "Featured Creator Badge",
        "Unlimited Portfolio Items",
        "Priority Search Ranking",
        "Advanced Analytics",
        "Priority Support"
      ],
      color: "purple",
      icon: Rocket,
      recommended: true
    },
    {
      id: "creator_premium",
      name: "Elite",
      price: "999",
      description: "Maximum platform exposure and AI-powered growth.",
      features: [
        "Verified Creator Status",
        "AI Production Diagnostics",
        "Unlimited 4K Media Hosting",
        "Direct Client Matching",
        "Dedicated Account Manager"
      ],
      color: "blue",
      icon: Sparkles
    }
  ];

  const clientActions: Plan[] = [
    {
      id: "unlock_creator_chat",
      name: "Unlock Chat",
      price: "49",
      description: "Direct connection to one professional creator.",
      features: [
        "Unlimited Messaging",
        "Permanent Connection",
        "Direct Project Bidding",
        "Secured Escrow Payments"
      ],
      color: "purple",
      icon: MessageSquareIcon,
      isAction: true
    },
    {
      id: "boost_project_7_days",
      name: "Boost Project",
      price: "99",
      description: "Get 5x more proposals by boosting your listing.",
      features: [
        "Top of Feed for 7 Days",
        "Priority Notifications",
        "Verified Project Badge",
        "Smart Creator Matching"
      ],
      color: "blue",
      icon: TrendingUp,
      isAction: true
    }
  ];

  const handleUpgrade = async (planId: string, amount: number, isAction: boolean = false) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (planId === activePlan && !isAction) {
      toast.error("You are already on this plan.");
      return;
    }

    setUpgrading(planId);

    try {
      const resScript = await loadRazorpayScript();
      if (!resScript) throw new Error("Razorpay SDK failed to load.");

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          actionType: isAction ? planId : undefined,
          planType: !isAction ? planId : undefined,
          userId: user.id
        })
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClipShift",
        description: `Plan: ${planId}`,
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
           try {
             const verifyRes = await fetch("/api/razorpay/verify-payment", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature,
                 type: isAction ? (planId === 'unlock_creator_chat' ? 'creator_unlock' : 'project_unlock') : 'plan_upgrade',
                 payload: {
                   user_id: user.id,
                   planType: planId,
                   amount: amount * 100
                 }
               })
             });

             const verifyData = await verifyRes.json();
             if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

             toast.success("Transaction successful!");
             setTimeout(() => window.location.reload(), 1500);
           } catch (err: unknown) {
             console.error("VERIFICATION ERROR:", err);
             const errorMessage = err instanceof Error ? err.message : "Payment verification failed.";
             toast.error(errorMessage);
             setUpgrading(null);
           }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#a855f7" },
        modal: { ondismiss: () => setUpgrading(null) }
      };

      const rzp = new (window as unknown as { Razorpay: { new (options: unknown): { open: () => void } } }).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Payment initiation failed.";
      toast.error(errorMessage);
      setUpgrading(null);
    }
  };

  const plansToShow = user?.role === 'creator' ? creatorPlans : clientActions;

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-32 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <Shield size={14} /> Professional Pricing
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 italic leading-[0.9]">
            Select Your <span className="text-neon-purple">Plan</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[10px] font-bold leading-relaxed opacity-70">
            {user?.role === 'creator' ? 'Professional tools for high-performance editors.' : 'Direct access and project acceleration for cinematic production.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {plansToShow.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass p-8 sm:p-10 rounded-[50px] border border-white/5 relative flex flex-col hover:border-white/10 transition-all ${plan.recommended ? "border-neon-purple/30 bg-neon-purple/[0.02] shadow-[0_0_50px_rgba(168,85,247,0.1)]" : "bg-white/[0.01]"}`}
            >
              {plan.recommended && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-neon-purple text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  Most Popular
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-2xl mb-10 flex items-center justify-center ${plan.color === 'purple' ? 'bg-neon-purple/10 text-neon-purple' : plan.color === 'blue' ? 'bg-neon-blue/10 text-neon-blue' : 'bg-white/5 text-gray-500'}`}>
                <plan.icon size={28} />
              </div>

              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-white italic">₹{plan.price}</span>
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{plan.isAction ? '/per use' : '/month'}</span>
              </div>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-10 h-12 overflow-hidden">{plan.description}</p>

              <div className="space-y-5 mb-12 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                       <CheckCircle2 size={12} className="text-green-500" />
                    </div>
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest opacity-80">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id, Number(plan.price), plan.isAction)}
                disabled={upgrading === plan.id || (!plan.isAction && activePlan === plan.id)}
                className={`w-full py-5 rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 ${
                  plan.id === activePlan && !plan.isAction ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5" :
                  plan.recommended ? "bg-neon-purple text-white shadow-2xl hover:scale-105 active:scale-95" : "bg-white text-black hover:bg-neon-purple hover:text-white active:scale-95"
                }`}
              >
                {upgrading === plan.id ? <Loader2 className="animate-spin" size={16} /> : 
                 plan.id === activePlan && !plan.isAction ? "Current Plan" : "Select Plan"}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-10 glass rounded-[50px] border-white/5 bg-white/[0.01] max-w-4xl mx-auto text-center">
           <Info size={32} className="text-neon-blue mx-auto mb-6 opacity-40" />
           <p className="text-xs text-gray-500 uppercase font-black tracking-widest leading-relaxed italic">
              All plans include secure file transmission, professional project management tools, and verified account status. Custom enterprise solutions are available for creative studios.
           </p>
        </div>
      </div>
    </PageWrapper>
  );
}

const MessageSquareIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

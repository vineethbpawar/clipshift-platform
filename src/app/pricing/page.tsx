"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { 
  Zap, CheckCircle2, ShieldCheck, Sparkles, 
  TrendingUp, Award, Users, BarChart3, 
  ChevronRight, Loader2, Info, ArrowRight,
  Shield, Rocket, Target, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user, activePlan } = useAuth();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const creatorPlans = [
    {
      id: "free",
      name: "Basic",
      price: "0",
      description: "Start your journey in the collective.",
      features: [
        "Basic Profile",
        "Community Access",
        "Public Portfolio",
        "Standard Support"
      ],
      color: "gray",
      icon: Target
    },
    {
      id: "creator_pro",
      name: "Pro",
      price: "499",
      description: "Level up your professional presence.",
      features: [
        "Featured Creator Badge",
        "Basic Analytics",
        "Priority in Searches",
        "Advanced Portfolio Tools",
        "Priority Support"
      ],
      color: "purple",
      icon: Rocket,
      recommended: true
    },
    {
      id: "creator_premium",
      name: "Premium",
      price: "999",
      description: "Maximum visibility and AI performance.",
      features: [
        "Verified Creator Badge",
        "Advanced AI Insights",
        "Unlimited Media Hosting",
        "Direct Client Matching",
        "Dedicated Account Manager"
      ],
      color: "blue",
      icon: Sparkles
    }
  ];

  const clientActions = [
    {
      id: "unlock_creator_chat",
      name: "Unlock Chat",
      price: "49",
      description: "Direct access to one elite creator.",
      features: [
        "Direct Messaging",
        "Permanent Connection",
        "Proposal Access",
        "Project Collaboration"
      ],
      color: "purple",
      icon: Zap,
      isAction: true
    },
    {
      id: "boost_project_7_days",
      name: "Boost Project",
      price: "99",
      description: "Maximize project visibility.",
      features: [
        "Top of Feed for 7 Days",
        "Priority Notifications",
        "Verified Project Badge",
        "Smart Matching"
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
      // 1. Load Razorpay
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load.");

      // 2. Create Order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, actionType: planId })
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      // 3. Open Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClipShift",
        description: `Purchase for ${planId}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
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

             toast.success("Transaction Complete!");
             setTimeout(() => window.location.reload(), 1500);
           } catch (err: any) {
             console.error("VERIFICATION ERROR:", err);
             toast.error(err.message || "Verification failed.");
             setUpgrading(null);
           }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#a855f7" },
        modal: { ondismiss: () => setUpgrading(null) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Upgrade failed.");
      setUpgrading(null);
    }
  };

  const plansToShow = user?.role === 'creator' ? creatorPlans : clientActions;

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Shield size={12} /> Flexible Pricing
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6">
            Choose Your <span className="text-neon-purple">Plan</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[10px] font-bold leading-relaxed">
            {user?.role === 'creator' ? 'Professional tools for editors and videographers.' : 'Direct access and project boosts for high-impact production.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plansToShow.map((plan: any, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass p-8 rounded-[40px] border border-white/5 relative flex flex-col ${plan.recommended ? "border-neon-purple/30 bg-neon-purple/[0.02]" : ""}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-purple text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  Recommended
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-2xl mb-8 flex items-center justify-center ${plan.color === 'purple' ? 'bg-neon-purple/10 text-neon-purple' : plan.color === 'blue' ? 'bg-neon-blue/10 text-neon-blue' : 'bg-white/5 text-gray-400'}`}>
                <plan.icon size={24} />
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">₹{plan.price}</span>
                <span className="text-gray-500 text-[10px] font-bold uppercase">{plan.isAction ? '/one-time' : '/month'}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8">{plan.description}</p>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature: string) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-neon-purple shrink-0" />
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id, Number(plan.price), plan.isAction)}
                disabled={upgrading === plan.id || (!plan.isAction && activePlan === plan.id)}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  plan.id === activePlan && !plan.isAction ? "bg-white/5 text-gray-500 cursor-not-allowed" :
                  plan.recommended ? "bg-neon-purple text-white shadow-lg hover:scale-105" : "bg-white text-black hover:bg-neon-purple hover:text-white"
                }`}
              >
                {upgrading === plan.id ? <Loader2 className="animate-spin" size={14} /> : 
                 plan.id === activePlan && !plan.isAction ? "Current Plan" : "Get Started"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

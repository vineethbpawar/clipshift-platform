"use client";

import React, { useState, useEffect } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { 
  Zap, CheckCircle2, ShieldCheck, Sparkles, 
  TrendingUp, Award, Users, BarChart3, 
  Gem, Rocket, Briefcase, Crown, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { loadRazorpayScript } from "@/lib/razorpay";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"creator" | "client">("creator");
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role) {
      console.log("PRICING ROLE:", user.role);
      if (user.role === "client") setTab("client");
      if (user.role === "creator") setTab("creator");
    }
  }, [user?.role]);

  console.log("VISIBLE PRICING TAB:", tab);

  const creatorPlans = [
    {
      id: "free",
      name: "Free Creator",
      price: "₹0",
      amount: 0,
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
      id: "creator_pro",
      name: "Creator Pro",
      price: "₹99",
      amount: 9900,
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
      id: "creator_premium",
      name: "Creator Premium",
      price: "₹249",
      amount: 24900,
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
      id: "unlock_creator_chat",
      name: "Unlock Creator Chat",
      price: "₹29 - ₹99",
      amount: 4900, // Average/starting
      icon: Users,
      color: "blue",
      features: [
        "Unlock chat with any creator",
        "Beginner: ₹29 | Pro: ₹49 | Premium: ₹99",
        "Direct connection",
        "Instant collaboration"
      ]
    },
    {
      id: "boost_project",
      name: "Boost Project Visibility",
      price: "₹49 - ₹99",
      amount: 4900,
      icon: Sparkles,
      color: "blue",
      popular: true,
      features: [
        "Boost for 3 days: ₹49",
        "Boost for 7 days: ₹99",
        "Appear at top of discovery",
        "High-priority exposure"
      ]
    },
    {
      id: "project_extras",
      name: "Project Extras",
      price: "₹99 - ₹199",
      amount: 9900,
      icon: Award,
      color: "purple",
      features: [
        "Urgent Project Badge: ₹99",
        "Premium Hiring Support: ₹199",
        "Professional quality audit",
        "Dedicated account assistance"
      ]
    }
  ];

  const handleUpgrade = async (planId: string, amount: number) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (planId === 'free') {
       toast.success("Active Plan set to Free");
       return;
    }

    // Role Validation
    if (user.role === 'client' && planId.startsWith('creator_')) {
      toast.error("Client accounts can only purchase client plans.");
      return;
    }
    if (user.role === 'creator' && planId.startsWith('client_')) {
      toast.error("Creator accounts can only purchase creator plans.");
      return;
    }

    setUpgrading(planId);
    
    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load.");

      // Amount is already in paise from plan object, send as rupees for API normalization
      const amountInRupees = amount / 100;

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: planId,
          amount: amountInRupees
        })
      });
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create Razorpay order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClipShift Network",
        description: `Upgrade to ${planId.replace('_', ' ')} protocol`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          const updateRes = await fetch("/api/premium/update-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planType: planId })
          });
          const updateData = await updateRes.json();

          if (updateData.success) {
            toast.success("Protocol Upgraded Successfully!");
            setTimeout(() => window.location.reload(), 1500);
          } else {
            throw new Error(updateData.error || "Update failed");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#a855f7" },
        modal: { ondismiss: () => setUpgrading(null) }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error("CREATE ORDER FAILED:", err);
      toast.error(err.message || "Failed to create Razorpay order");
    } finally {
      setUpgrading(null);
    }
  };

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

        {/* Role-based Tab Switcher */}
        {!user?.role && (
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
        )}

        {user?.role && (
          <div className="flex justify-center mb-16">
            <h2 className="text-xl font-black text-white uppercase tracking-widest">
              {user.role === 'creator' ? 'Creator Premium Plans' : 'Client Premium Plans'}
            </h2>
          </div>
        )}

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
                  {(plan as any).period && <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{(plan as any).period}</span>}
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

              <button 
                onClick={() => handleUpgrade(plan.id, plan.amount)}
                disabled={upgrading !== null}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                plan.id === 'free' ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" :
                plan.color === 'purple' ? "bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105" :
                "bg-neon-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105"
              }`}>
                {upgrading === plan.id ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Upgrade Node"}
              </button>
            </motion.div>
          ))}
        </div>
        {/* ... rest of the component (footer info) ... */}
      </div>
    </PageWrapper>
  );
}

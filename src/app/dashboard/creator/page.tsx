"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  MapPin, 
  Zap,
  ChevronRight,
  Loader2,
  Layers,
  Crown,
  Briefcase,
  Target
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { VideoAnalyzer } from "@/components/ai/VideoAnalyzer";
import { PortfolioUpload } from "@/components/dashboard/PortfolioUpload";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { canAccessAdvancedAnalytics } from "@/lib/plans";
import Link from "next/link";

export default function CreatorDashboard() {
  const { user, activePlan } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeProjects: 0,
    openProjects: 0,
    proposalsSent: 0,
    unlockedChats: 0,
    dailyData: [] as unknown[]
  });

  useEffect(() => {
    if (!user) return;

    const fetchCreatorData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Total Earnings
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, created_at')
          .eq('creator_id', user.id)
          .eq('status', 'completed');

        // 2. Fetch Project Unlock Count
        const { count: unlockCount } = await supabase
          .from('project_unlocks')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', user.id);

        // 3. Fetch Proposals Sent
        const { count: proposalsCount } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', user.id);

        // 4. Fetch Active Projects Count
        const { count: activeCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_creator_id', user.id)
          .in('status', ['in_progress', 'delivered', 'completed']);

        // 5. Fetch Open Projects Count
        const { count: openCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');

        let totalEarnings = 0;
        let dailyData: { name: string; amount: number }[] = [];

        if (payments && payments.length > 0) {
          totalEarnings = (payments as { amount: number }[]).reduce((acc, curr) => acc + curr.amount, 0) / 100;
          const dailyMap: Record<string, number> = {};
          (payments as { amount: number, created_at: string }[]).forEach(p => {
            const date = new Date(p.created_at).toLocaleDateString('en-US', { weekday: 'short' });
            dailyMap[date] = (dailyMap[date] || 0) + (p.amount / 100);
          });
          dailyData = Object.entries(dailyMap).map(([name, amount]) => ({ name, amount }));
        }

        setStats({
          totalEarnings,
          activeProjects: activeCount || 0,
          openProjects: openCount || 0,
          proposalsSent: proposalsCount || 0,
          unlockedChats: unlockCount || 0,
          dailyData
        });

      } catch (error: unknown) {
        console.error("Creator dashboard fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [user]);

  return (
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="Creator Dashboard">
        {/* Top Header & Subtitle */}
        <div className="mb-10">
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1 opacity-60">Overview</p>
          <p className="text-sm text-gray-400 font-medium max-w-2xl">
            Manage your projects, proposals, and professional profile in one place.
          </p>
        </div>

        {/* Action Bar: Plan & Availability */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 items-stretch">
          <div className="flex-1 glass p-6 rounded-[32px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                 <Crown size={28} />
               </div>
               <div>
                 <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Current Plan</span>
                 <p className="text-lg font-black text-white uppercase tracking-tighter">{activePlan.replace('creator_', '')} Node</p>
               </div>
            </div>
            <Link href="/pricing">
              <button className="px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-lg active:scale-95">
                Upgrade Plan
              </button>
            </Link>
          </div>

          <div className="w-full lg:w-80 glass p-6 rounded-[32px] border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Work Status</span>
              <p className={`text-xs font-black uppercase tracking-widest ${isAvailable ? "text-green-500" : "text-neon-purple"}`}>
                {isAvailable ? "Available for Projects" : "Busy in Production"}
              </p>
            </div>
            <button 
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-14 h-8 rounded-full p-1 transition-all relative ${isAvailable ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-zinc-800 shadow-inner"}`}
            >
              <motion.div 
                animate={{ x: isAvailable ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-12">
          <StatCard title="Total Earnings" value={stats.totalEarnings} prefix="₹" icon={DollarSign} color="purple" />
          <StatCard title="Active Projects" value={stats.activeProjects} icon={Zap} color="purple" />
          <StatCard title="Open Projects" value={stats.openProjects} icon={Layers} color="blue" />
          <StatCard title="Proposals Sent" value={stats.proposalsSent} icon={TrendingUp} color="blue" />
          <StatCard title="Unlocked Chats" value={stats.unlockedChats} icon={Users} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5 overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Target size={16} className="text-neon-purple" /> Revenue Over Time
              </h3>
              <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest animate-pulse">
                Live Stream
              </div>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              {loading ? (
                <Loader2 className="animate-spin text-neon-purple" size={32} />
              ) : stats.dailyData.length === 0 ? (
                <div className="text-center opacity-30">
                  <DollarSign size={40} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-[10px] font-black uppercase tracking-widest italic">No earnings recorded this week</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.dailyData as { name: string; amount: number }[]}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(10px)" }}
                      itemStyle={{ color: "#fff", fontSize: "10px", fontWeight: "black", textTransform: "uppercase" }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#a855f7" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Access Sidebar */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Briefcase size={14} className="text-neon-blue" /> Project Progress
                </h3>
                {stats.activeProjects > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 glass rounded-2xl border-white/5 hover:border-white/10 transition-colors">
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">{stats.activeProjects} Ongoing Projects</span>
                      <ChevronRight size={16} className="text-neon-blue" />
                    </div>
                    <Link href="/dashboard/creator/active-projects" className="block">
                      <button className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-blue hover:text-white transition-all shadow-xl">
                        Open Project List
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 opacity-40">
                    <Briefcase size={32} className="mx-auto mb-4 text-gray-700" />
                    <span className="text-[8px] font-black uppercase tracking-widest">No Active Projects</span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5 group hover:border-neon-purple/20 transition-all cursor-pointer">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-neon-purple transition-colors">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Map Location</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">{user?.city || "Unknown Base"}</p>
                </div>
              </div>
              <Link href="/explore">
                <button className="text-[9px] text-neon-blue font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                  Update Base Location <ChevronRight size={12} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* AI & Content Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12 pt-12 border-t border-white/5">
          <PortfolioUpload />
          {canAccessAdvancedAnalytics(activePlan) ? (
            <VideoAnalyzer />
          ) : (
            <div className="glass p-10 rounded-[40px] border-white/5 flex flex-col items-center justify-center text-center group bg-white/[0.01]">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-gray-700 group-hover:text-neon-purple transition-colors duration-500">
                 <Zap size={40} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">AI Quality Analyzer</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mb-10 leading-relaxed opacity-60">
                Unlock professional AI diagnostics for your production quality. Requires Pro plan.
              </p>
              <Link href="/pricing">
                <button className="px-10 py-4 rounded-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                  Upgrade to Unlock
                </button>
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

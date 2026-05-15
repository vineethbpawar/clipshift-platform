"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Users, 
  MapPin, 
  Zap,
  ChevronRight,
  Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CommissionTable } from "@/components/monetization/CommissionTable";
import { motion, AnimatePresence } from "framer-motion";
import { VideoAnalyzer } from "@/components/ai/VideoAnalyzer";
import { PortfolioInsights } from "@/components/ai/PortfolioInsights";
import { PortfolioUpload } from "@/components/dashboard/PortfolioUpload";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    profileReach: 0,
    chatUnlocks: 0,
    activeProjects: 0,
    proposalsSent: 0,
    dailyData: [] as any[]
  });

  useEffect(() => {
    if (!user) return;

    const fetchCreatorData = async () => {
      setLoading(true);
      
      try {
        // 1. Fetch Total Earnings & Daily Data
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, created_at')
          .eq('creator_id', user.id)
          .eq('status', 'completed');

        if (paymentsError) console.error("Error fetching payments:", paymentsError);

        // 2. Fetch Project Unlock Count
        const { count: unlockCount, error: unlockError } = await supabase
          .from('project_unlocks')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', user.id);

        if (unlockError) console.error("Error fetching unlocks:", unlockError);

        // 3. Fetch Proposals Sent
        const { count: proposalsCount, error: proposalsError } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', user.id);

        if (proposalsError) console.error("Error fetching proposals:", proposalsError);

        // 4. Fetch Active Projects (Accepted Proposals)
        const { count: activeCount, error: activeError } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', user.id)
          .eq('status', 'accepted');

        if (activeError) console.error("Error fetching active projects:", activeError);

        let totalEarnings = 0;
        let dailyData: any[] = [];

        if (payments) {
          const totalPaise = payments.reduce((acc, curr) => acc + curr.amount, 0);
          totalEarnings = totalPaise / 100;

          const dailyMap: Record<string, number> = {};
          payments.forEach(p => {
            const date = new Date(p.created_at).toLocaleDateString('en-US', { weekday: 'short' });
            dailyMap[date] = (dailyMap[date] || 0) + (p.amount / 100);
          });

          dailyData = Object.entries(dailyMap).map(([name, amount]) => ({ name, amount }));
        }

        setStats({
          totalEarnings,
          profileReach: 0, // Placeholder for future analytics
          chatUnlocks: unlockCount || 0,
          activeProjects: activeCount || 0,
          proposalsSent: proposalsCount || 0,
          dailyData
        });

      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [user]);

  return (
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="Creator Command">
      {/* Top Section: Stats & Availability */}
      <div className="space-y-6 md:space-y-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 w-full">
          <StatCard title="Total Earnings" value={stats.totalEarnings} prefix="₹" icon={DollarSign} color="purple" />
          <StatCard title="Profile Reach" value={stats.profileReach} icon={Eye} color="blue" />
          <StatCard title="Chat Unlocks" value={stats.chatUnlocks} icon={Users} color="green" />
          <StatCard title="Active Projects" value={stats.activeProjects} icon={Zap} color="purple" />
          <StatCard title="Proposals Sent" value={stats.proposalsSent} icon={TrendingUp} color="blue" />
        </div>
        
        <div className="flex justify-end">
          <div className="glass p-4 md:p-6 rounded-3xl border-white/5 flex items-center gap-4 md:gap-6 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial">
              <div className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 md:mb-2 text-right">Status</div>
              <div className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isAvailable ? "text-green-500" : "text-neon-purple"}`}>
                {isAvailable ? "Ready for Shoots" : "In Production"}
              </div>
            </div>
            <button 
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 md:w-14 h-7 md:h-8 rounded-full p-1 transition-colors relative ${isAvailable ? "bg-green-500" : "bg-zinc-800"}`}
            >
              <motion.div 
                animate={{ x: isAvailable ? 20 : 0 }}
                className="w-5 md:w-6 h-5 md:h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass p-4 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-[0.2em]">Revenue Flow (Real-time)</h3>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-widest">Live Node Data</span>
            </div>
          </div>
          <div className="h-[250px] md:h-[300px] w-full flex items-center justify-center">
            {loading ? (
              <Loader2 className="animate-spin text-neon-purple" size={32} />
            ) : stats.dailyData.length === 0 ? (
              <div className="text-[9px] md:text-[10px] text-gray-600 font-black uppercase tracking-widest italic">No Transactional History Detected</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff", fontSize: "9px", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions & Location */}
        <div className="space-y-6 md:space-y-8">
          <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Production Pipeline</h3>
            <div className="space-y-4 text-center py-4 md:py-8 opacity-40">
              <span className="text-[8px] font-black uppercase tracking-widest">No Active Streams</span>
            </div>
          </div>

          <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-neon-blue/20">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={18} className="text-neon-blue" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Base Node</h3>
            </div>
            <p className="text-[11px] md:text-xs text-gray-400 mb-4 leading-relaxed break-words">
              Your location: <span className="text-white font-bold">{user?.city || "Unknown City"}</span>. 
              Keep your node updated for local discoverability.
            </p>
            <button className="text-[10px] text-neon-blue font-black uppercase tracking-widest hover:underline">Update Location Map</button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Commission & Portfolio Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8">
        <div className="overflow-x-auto">
          <CommissionTable />
        </div>
        
        <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-[0.2em]">Top Performances</h3>
            <Zap size={18} className="text-neon-purple animate-pulse" />
          </div>
          <div className="space-y-6 opacity-30">
            <div className="text-center py-8 md:py-12 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic">
              Accumulating Engagement Data...
            </div>
          </div>
        </div>
      </div>

      {/* AI & Content Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mt-12">
        <VideoAnalyzer />
        <PortfolioUpload />
      </div>
      
      <div className="mt-12">
        <PortfolioInsights />
      </div>
    </DashboardLayout>
    </RoleGuard>
  );
}

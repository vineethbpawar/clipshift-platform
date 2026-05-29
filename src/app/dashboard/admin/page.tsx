"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Users, 
  DollarSign, 
  Activity, 
  Check, 
  X,
  Zap,
  Globe,
  Loader2,
  Inbox,
  Shield
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface QueueItem {
  id: string;
  name: string;
  category: string;
  level: string;
  score: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    platformRevenue: 0,
    fraudAlerts: 0
  });
  const [verificationQueue, setVerificationQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: creatorCount } = await supabase.from('creators').select('*', { count: 'exact', head: true });

        const { data: revenueData } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed');
        
        const totalRevenue = (revenueData?.reduce((acc, curr) => acc + curr.amount, 0) || 0) / 100;

        const { data: queue } = await supabase
          .from('creators')
          .select(`*, profiles(full_name, category)`)
          .eq('verified', false)
          .limit(5);

        setStats({
          totalUsers: userCount || 0,
          totalCreators: creatorCount || 0,
          platformRevenue: totalRevenue,
          fraudAlerts: 0
        });

        if (queue) {
          setVerificationQueue(queue.map((q: any) => ({
            id: q.id,
            name: q.profiles?.full_name || "Unknown",
            category: q.category,
            level: q.level || 'Standard',
            score: q.ai_score || 0
          })));
        }
      } catch (err) {
        console.error("Admin data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout title="Admin Dashboard">
        {/* Header Subtitle */}
        <div className="mb-10">
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1 opacity-60">Admin Overview</p>
          <p className="text-sm text-gray-400 font-medium max-w-2xl">
            Monitor platform growth, verify creators, and manage financial volume.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
          <StatCard title="Total Revenue" value={stats.platformRevenue} prefix="₹" icon={DollarSign} color="purple" />
          <StatCard title="Active Creators" value={stats.totalCreators} icon={Zap} color="green" />
          <StatCard title="Security Alerts" value={stats.fraudAlerts} icon={Shield} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5 overflow-hidden bg-white/[0.01]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Revenue Growth</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 italic">Platform commission volume</p>
              </div>
              <button className="px-6 py-2.5 glass border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all self-start sm:self-center">
                Full Report
              </button>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              {stats.platformRevenue === 0 ? (
                <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest italic opacity-40">No Transaction Data Found</div>
              ) : (
                <div className="text-neon-purple text-xs font-bold uppercase tracking-[0.3em] italic">Chart Synchronizing...</div>
              )}
            </div>
          </div>

          {/* Verification Queue */}
          <div className="glass p-8 rounded-[40px] border-white/5 overflow-hidden bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.1em] italic">Review Queue</h3>
              <span className="px-2 py-0.5 rounded-full bg-neon-purple text-white text-[9px] font-black shadow-lg">{verificationQueue.length}</span>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-neon-purple" size={24} />
                  <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Loading...</span>
                </div>
              ) : verificationQueue.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <Inbox size={32} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">All creators verified</p>
                </div>
              ) : (
                verificationQueue.map((item: QueueItem) => (
                  <div key={item.id} className="p-5 glass rounded-[32px] border border-white/5 space-y-5 bg-black/20 group hover:border-neon-blue/30 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-white uppercase tracking-tighter truncate italic">{item.name}</h4>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mt-1 truncate opacity-60">{item.category} • {item.level}</span>
                      </div>
                      <div className="text-[10px] font-mono text-neon-blue font-black shrink-0 bg-neon-blue/10 px-2 py-1 rounded-lg border border-neon-blue/20">{item.score}%</div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 py-2.5 rounded-2xl glass border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 active:scale-95">
                        <X size={12} /> Reject
                      </button>
                      <button className="flex-1 py-2.5 rounded-2xl bg-white text-black text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-neon-purple hover:text-white transition-all active:scale-95">
                        <Check size={12} /> Verify
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20 shadow-lg shrink-0">
                <Globe size={32} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">Global Infrastructure</h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium opacity-60 leading-relaxed max-w-sm">
                  System is fully operational. Monitoring {stats.totalCreators} creators across multiple regions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2 px-6 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> Online
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col justify-center bg-white/[0.01]">
            <div className="flex items-center gap-3 mb-6">
              <Activity size={18} className="text-neon-purple" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Performance Metric</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span className="text-gray-500 italic opacity-60">System Latency</span>
                <span className="text-neon-blue font-mono">14ms</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                <div className="w-[98%] h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

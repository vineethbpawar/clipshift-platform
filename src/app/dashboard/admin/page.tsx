"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Users, 
  ShieldCheck, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  Check, 
  X,
  Zap,
  Globe,
  Loader2,
  Inbox
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    platformRevenue: 0,
    fraudAlerts: 0
  });
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      
      // Fetch Total Users
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      // Fetch Total Creators
      const { count: creatorCount } = await supabase.from('creators').select('*', { count: 'exact', head: true });

      // Fetch Platform Revenue
      const { data: revenueData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      
      const totalRevenue = (revenueData?.reduce((acc, curr) => acc + curr.amount, 0) || 0) / 100;

      // Fetch Verification Queue
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
        setVerificationQueue(queue.map(q => ({
          id: q.id,
          name: q.profiles.full_name,
          category: q.category,
          level: q.level || 'Standard',
          score: q.ai_score || 0
        })));
      }

      setLoading(false);
    };

    fetchAdminData();
  }, []);

  const platformRevenue = [
    { month: "Jan", amount: 0 },
    { month: "Feb", amount: 0 },
    { month: "Mar", amount: 0 },
    { month: "Apr", amount: 0 },
    { month: "May", amount: 0 },
    { month: "Jun", amount: 0 },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout title="Platform Control Center">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard title="Platform Revenue" value={stats.platformRevenue} prefix="₹" icon={DollarSign} color="purple" />
        <StatCard title="Total Creators" value={stats.totalCreators} icon={Zap} color="green" />
        <StatCard title="Fraud Alerts" value={stats.fraudAlerts} icon={AlertTriangle} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Revenue Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Global Revenue Growth</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Platform Commission + Transaction Volume</p>
            </div>
            <button className="px-4 py-2 glass border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all">
              Export Audit
            </button>
          </div>
          <div className="h-[350px] w-full flex items-center justify-center">
            {stats.platformRevenue === 0 ? (
              <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No Revenue Data Detected</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}
                    cursor={{ fill: "rgba(168,85,247,0.1)" }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {platformRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? "#a855f7" : "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Verification Queue */}
        <div className="glass p-8 rounded-[40px] border-white/5">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Verification Queue</h3>
            <span className="text-[10px] font-mono text-neon-purple">({verificationQueue.length} Pending)</span>
          </div>
          
          <div className="space-y-6">
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-neon-purple" size={24} />
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Scanning Nodes...</span>
              </div>
            ) : verificationQueue.length === 0 ? (
              <div className="py-12 text-center opacity-30">
                <Inbox size={32} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Queue Empty</p>
              </div>
            ) : (
              verificationQueue.map((item) => (
                <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{item.name}</h4>
                      <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{item.category} • {item.level}</span>
                    </div>
                    <div className="text-[10px] font-mono text-neon-blue">{item.score}% Quality</div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button className="flex-1 py-2 rounded-xl glass border border-red-500/30 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-1">
                      <X size={12} /> Reject
                    </button>
                    <button className="flex-1 py-2 rounded-xl bg-neon-purple text-white text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-1">
                      <Check size={12} /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Health Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Globe size={18} className="text-neon-blue" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Global Node Distribution</h3>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Platform status is <span className="text-white font-bold">Nominal</span>. Tracking {stats.totalCreators} verified cinematic nodes globally.
            </p>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <Activity size={18} className="text-green-500" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Platform Pulse</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-500">Node Latency</span>
              <span className="text-white">12ms</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[98%] h-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </RoleGuard>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Wallet, Briefcase, Heart, Plus, Users, Map as MapIcon, ChevronRight, Layers, Zap, Send } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";

const MapView = dynamic(() => import("@/components/map/MapView").then(mod => mod.MapView), { ssr: false });

import { type Project } from "@/data/projects";
import { type Creator } from "@/data/creators";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [savedCreators] = useState<Creator[]>([]);
  const [nearbyCreators, setNearbyCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeProjects: 0,
    myProjects: 0,
    proposalsReceived: 0,
    unlockedChats: 0
  });

  const spendingData = [
    { name: "Production", value: 0 },
    { name: "Consultation", value: 0 },
    { name: "Unlocks", value: 0 },
  ];

  const COLORS = ["#a855f7", "#3b82f6", "#10b981"];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Fetch Nearby Creators
        const { data: nearby } = await supabase
          .from('creators')
          .select(`*, profiles(full_name, avatar_url, city, area)`)
          .limit(5);
        
        if (nearby) {
          setNearbyCreators((nearby as unknown[]).map((n) => {
            const typedN = n as { 
              id: string; 
              profiles: { full_name: string; avatar_url: string; area: string };
              location_lat: number;
              location_lng: number;
            };
            return {
              id: typedN.id,
              name: typedN.profiles?.full_name || "Unknown",
              image: typedN.profiles?.avatar_url,
              location: { lat: typedN.location_lat, lng: typedN.location_lng, area: typedN.profiles?.area }
            };
          }) as Creator[]);
        }

        // 2. Fetch Projects
        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', user.id)
          .order('updated_at', { ascending: false });

        if (projData) {
          setProjects((projData as unknown as Project[]).slice(0, 5));
          const activeCount = projData.filter(p => ['in_progress', 'delivered'].includes(p.status)).length;
          
          // 3. Fetch Proposals Received
          const projectIds = projData.map(p => p.id);
          const { count: proposalsCount } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .in('project_id', projectIds);

          // 4. Fetch Unlocked Chats
          const { count: unlockCount } = await supabase
            .from('creator_unlocks')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', user.id);

          // 5. Fetch Total Spent
          const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('client_id', user.id)
            .eq('status', 'completed');
          
          const total = (payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0) / 100;

          setStats({
            totalSpent: total,
            activeProjects: activeCount,
            myProjects: projData.length,
            proposalsReceived: proposalsCount || 0,
            unlockedChats: unlockCount || 0
          });
        }

      } catch (err: unknown) {
        console.error("Client dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Client Dashboard">
        {/* Header Subtitle */}
        <div className="mb-10">
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black mb-1 opacity-60">Control Center</p>
          <p className="text-sm text-gray-400 font-medium max-w-2xl">
            Post projects, review proposals, and manage your active productions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-12">
          <StatCard title="Total Spent" value={stats.totalSpent} prefix="₹" icon={Wallet} color="purple" />
          <StatCard title="Active Projects" value={stats.activeProjects} icon={Zap} color="purple" />
          <StatCard title="My Projects" value={stats.myProjects} icon={Layers} color="blue" />
          <StatCard title="Proposals Received" value={stats.proposalsReceived} icon={Send} color="blue" />
          <StatCard title="Unlocked Chats" value={stats.unlockedChats} icon={Users} color="green" />
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 mb-12">
          <Link href="/post-project">
            <button className="px-8 py-4 rounded-2xl bg-neon-purple text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-95 flex items-center gap-2">
              <Plus size={18} /> Post New Project
            </button>
          </Link>
          <Link href="/dashboard/client/proposals">
            <button className="px-8 py-4 rounded-2xl glass border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95 flex items-center gap-2">
              <Send size={18} /> View Proposals
            </button>
          </Link>
          <Link href="/dashboard/client/active-projects">
            <button className="px-8 py-4 rounded-2xl glass border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95 flex items-center gap-2">
              <Briefcase size={18} /> Active Projects
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/10 to-transparent group overflow-hidden relative">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-md">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 group-hover:text-neon-purple transition-colors">Find Elite Creators</h3>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest leading-relaxed opacity-60">
                    Browse world-class editors and videographers ranked by AI performance metrics.
                  </p>
                </div>
                <Link href="/marketplace">
                  <button className="px-10 py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-neon-purple hover:text-white transition-all active:scale-95">
                    Browse Creators
                  </button>
                </Link>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-neon-purple/10 rounded-full blur-[80px] group-hover:bg-neon-purple/20 transition-all duration-700" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Briefcase size={14} className="text-neon-blue" /> Recent Projects
                </h3>
                <Link href="/projects" className="text-[10px] text-neon-blue font-black uppercase tracking-widest hover:underline">Manage All</Link>
              </div>
              
              {projects.length === 0 ? (
                <div className="glass p-12 rounded-[40px] border-white/5 text-center bg-white/[0.01]">
                  <Briefcase size={40} className="mx-auto text-gray-800 mb-4" />
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic">No active projects found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {projects.map((proj) => (
                    <Link key={proj.id} href={`/dashboard/projects/${proj.id}/workspace`} className="block group">
                      <div className="glass p-6 rounded-3xl border-white/5 flex items-center justify-between hover:border-neon-purple/30 transition-all bg-white/[0.01] hover:bg-white/[0.03]">
                        <div className="flex items-center gap-5 min-w-0">
                          <div className="w-14 h-14 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple shrink-0 group-hover:scale-110 transition-transform">
                            <Briefcase size={24} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm md:text-base font-black text-white uppercase tracking-tighter truncate mb-1">{proj.title}</h4>
                            <div className="flex items-center gap-3">
                               <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                 proj.status === 'open' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-neon-blue/10 text-neon-blue border-neon-blue/20'
                               }`}>
                                 {proj.status.replace('_', ' ')}
                               </span>
                               <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                 {proj.created_at ? new Date(proj.created_at).toLocaleDateString() : ''}
                               </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-700 group-hover:text-neon-purple transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-10">
            <div className="glass p-6 rounded-[40px] border-white/5 relative overflow-hidden bg-white/[0.01]">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">Spending Analysis</h3>
              <div className="h-[220px] w-full relative">
                {stats.totalSpent === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest italic opacity-50">No Data Logs Found</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingData}
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(10px)" }}
                        itemStyle={{ color: "#fff", fontSize: "10px", fontWeight: "black", textTransform: "uppercase" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Total</span>
                   <span className="text-lg font-black text-white uppercase tracking-tighter">₹{stats.totalSpent}</span>
                </div>
              </div>
            </div>

            <div className="glass p-4 rounded-[40px] border-white/5 h-[380px] relative overflow-hidden group bg-white/[0.01]">
              <div className="absolute top-6 left-6 z-10">
                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <MapIcon size={12} className="text-neon-blue" /> Nearby Creators
                </h3>
              </div>
              
              <div className="w-full h-full grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">
                <MapView creators={nearbyCreators} />
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-10">
                <Link href="/explore">
                  <button className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-neon-blue hover:text-white transition-all active:scale-95">
                    Open Global Map
                  </button>
                </Link>
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Heart size={14} className="text-neon-purple" /> Saved Talent
              </h3>
              {savedCreators.length === 0 ? (
                <div className="text-center py-6">
                  <Heart size={24} className="text-gray-800 mx-auto mb-3 opacity-30" />
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">No saved creators</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* List creators */}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

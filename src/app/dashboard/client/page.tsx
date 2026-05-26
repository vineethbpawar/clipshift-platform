"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Wallet, Briefcase, Heart, Bell, Plus, Users, Map as MapIcon, Loader2, Info, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { getActivePlan, getClientUnlockDiscount } from "@/lib/plans";
import { Crown, Percent } from "lucide-react";

const getPlanBadge = (plan: string) => {
  switch (plan) {
    case 'client_business': return 'Business';
    case 'client_pro': return 'Pro';
    default: return 'Basic';
  }
};

const MapView = dynamic(() => import("@/components/map/MapView").then(mod => mod.MapView), { ssr: false });

export default function ClientDashboard() {
  const { user, activePlan } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [savedCreators, setSavedCreators] = useState<any[]>([]);
  const [nearbyCreators, setNearbyCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const spendingData = [
    { name: "Post-Production", value: 0 },
    { name: "Shoots", value: 0 },
    { name: "Asset Licenses", value: 0 },
  ];

  const COLORS = ["#a855f7", "#3b82f6", "#10b981"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: nearby, error: nearbyError } = await supabase
          .from('creators')
          .select(`*, profiles(full_name, avatar_url, city, area)`)
          .limit(5);
        
        if (nearbyError) console.error("Error fetching nearby creators:", nearbyError);

        if (nearby) {
          setNearbyCreators(nearby.map(n => ({
            id: n.id,
            name: n.profiles?.full_name || "Unknown",
            image: n.profiles?.avatar_url,
            location: { lat: n.location_lat, lng: n.location_lng, area: n.profiles?.area }
          })));
        }

        // Fetch actual client projects
        if (user) {
          const { data: projData, error: projError } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (projError) console.error("Error fetching client projects:", projError);
          if (projData) setProjects(projData);
        }

      } catch (err) {
        console.error("Client dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const discount = getClientUnlockDiscount(activePlan);

  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Client Command Center">
      {/* Top Section: Plan & Global Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
           <div className="p-4 glass rounded-2xl border-neon-blue/20 flex flex-col gap-1">
             <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Active Protocol</span>
             <div className="flex items-center gap-2">
               <Crown size={16} className={activePlan === 'free' ? "text-gray-500" : "text-neon-blue"} />
               <span className="text-sm font-black text-white uppercase tracking-tighter">{getPlanBadge(activePlan)} Node</span>
             </div>
           </div>
           {activePlan === 'free' && (
             <Link href="/pricing">
               <button className="px-6 py-3 rounded-xl bg-neon-blue/10 text-neon-blue border border-neon-blue/20 text-[10px] font-black uppercase tracking-widest hover:bg-neon-blue hover:text-white transition-all">
                 Upgrade Protocol
               </button>
             </Link>
           )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="Total Investment" value={0} prefix="₹" icon={Wallet} color="purple" />
        <StatCard title="Active Streams" value={projects.length} icon={Briefcase} color="blue" />
        <StatCard title="Saved Talent" value={savedCreators.length} icon={Heart} color="green" />
        <StatCard title="Unlock Discount" value={discount} suffix="%" icon={Percent} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Col: Discovery & Projects */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/10 via-transparent to-transparent group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Discover Elite Talent</h3>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest max-w-sm leading-relaxed">
                  Browse world-class creators ranked by neural performance metrics.
                </p>
              </div>
              <Link href="/marketplace">
                <button className="px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-neon-purple hover:text-white transition-all">
                  Browse Creators
                </button>
              </Link>
            </div>
          </div>

          <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 relative overflow-hidden">
            <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Capital Allocation</h3>
            <div className="h-[250px] md:h-[300px] w-full flex items-center justify-center">
              {spendingData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
                <div className="text-center">
                  <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest italic opacity-50">No Expenditure Logs Detected</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      innerRadius={window.innerWidth < 768 ? 60 : 80}
                      outerRadius={window.innerWidth < 768 ? 90 : 120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                      itemStyle={{ color: "#fff", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Production Stream</h3>
              <Link href="/projects" className="text-[10px] text-neon-blue font-black uppercase tracking-widest hover:underline">View All</Link>
            </div>
            
            {projects.length === 0 ? (
              <div className="glass p-8 md:p-12 rounded-[32px] border-white/5 text-center">
                <p className="text-[10px] md:text-xs text-gray-500 uppercase font-black tracking-widest italic opacity-50">No Active Streams Detected</p>
                <Link href="/post-project" className="inline-block mt-6">
                  <button className="px-8 py-3 rounded-xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                    Initiate Project
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="glass p-4 md:p-6 rounded-2xl md:rounded-3xl border-white/5 flex items-center justify-between group hover:border-neon-purple/30 transition-all gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple shrink-0">
                        <Briefcase size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-tighter truncate">{proj.title}</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 uppercase font-bold tracking-widest">{proj.status}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-neon-purple transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Map & Notifications */}
        <div className="space-y-6 md:space-y-8">
          <div className="glass p-4 md:p-6 rounded-[32px] md:rounded-[40px] border-white/5 h-[350px] md:h-[400px] relative overflow-hidden group">
            <div className="absolute top-6 left-6 z-10">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <MapIcon size={12} className="text-neon-blue" />
                Nearby Nodes
              </h3>
            </div>
            
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-neon-blue" size={24} />
              </div>
            ) : nearbyCreators.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 grayscale">
                <MapIcon size={32} className="text-gray-600 mb-4" />
                <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No Nearby Nodes Found</span>
              </div>
            ) : (
              <div className="w-full h-full grayscale opacity-50 md:opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                <MapView creators={nearbyCreators} />
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6 z-10">
              <Link href="/explore">
                <button className="w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-neon-blue hover:text-white transition-all">
                  Open Discovery Map
                </button>
              </Link>
            </div>
          </div>

          <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Saved Creators</h3>
            {savedCreators.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <Heart size={24} className="text-gray-700 mx-auto mb-3" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No saved creators yet</p>
                <Link href="/marketplace" className="text-[8px] text-neon-purple font-black uppercase tracking-widest hover:underline mt-4 inline-block">Explore Talent</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* List saved creators */}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
    </RoleGuard>
  );
}

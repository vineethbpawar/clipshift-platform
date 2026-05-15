"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Wallet, Briefcase, Heart, Bell, Plus, Users, Map as MapIcon, Loader2, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";

const MapView = dynamic(() => import("@/components/map/MapView").then(mod => mod.MapView), { ssr: false });

export default function ClientDashboard() {
  const { user } = useAuth();
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
      // Fetch projects logic would go here (table doesn't exist yet in user prompt, but we'll fetch from creators for nearby map)
      const { data: nearby } = await supabase
        .from('creators')
        .select(`*, profiles(full_name, avatar_url, city, area)`)
        .limit(5);
      
      if (nearby) {
        setNearbyCreators(nearby.map(n => ({
          id: n.id,
          name: n.profiles.full_name,
          image: n.profiles.avatar_url,
          location: { lat: n.location_lat, lng: n.location_lng, area: n.profiles.area }
        })));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Client Command Center">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Investment" value={0} prefix="₹" icon={Wallet} color="purple" />
        <StatCard title="Active Streams" value={projects.length} icon={Briefcase} color="blue" />
        <StatCard title="Saved Talent" value={savedCreators.length} icon={Heart} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Spending & Projects */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Capital Allocation</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              {spendingData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
                <div className="text-center">
                  <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest">No Expenditure Logs</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      innerRadius={80}
                      outerRadius={120}
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
              <div className="glass p-12 rounded-3xl border-white/5 text-center">
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">No Active Streams Detected</p>
                <Link href="/post-project">
                  <button className="mt-4 px-6 py-3 rounded-xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Initiate Project
                  </button>
                </Link>
              </div>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="glass p-6 rounded-3xl border-white/5 flex items-center justify-between group hover:border-neon-purple/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tighter">{proj.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{proj.status}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Map & Notifications */}
        <div className="space-y-8">
          <div className="glass p-6 rounded-[40px] border-white/5 h-[400px] relative overflow-hidden group">
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
              <div className="w-full h-full grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                <MapView creators={nearbyCreators} />
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6 z-10">
              <Link href="/explore">
                <button className="w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                  Open Discovery Map
                </button>
              </Link>
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border-white/5">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Saved Creators</h3>
            {savedCreators.length === 0 ? (
              <div className="text-center py-8">
                <Heart size={24} className="text-gray-700 mx-auto mb-3" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No saved creators yet</p>
                <Link href="/marketplace" className="text-[8px] text-neon-purple font-black uppercase tracking-widest hover:underline mt-2 inline-block">Explore Talent</Link>
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

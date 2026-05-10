"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Wallet, Briefcase, Heart, Bell, Plus, Users, Map as MapIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { mockProjects } from "@/data/projects";
import { creators } from "@/data/creators";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView").then(mod => mod.MapView), { ssr: false });

export default function ClientDashboard() {
  const data = [
    { name: "Post-Production", value: 4500 },
    { name: "Shoots", value: 3200 },
    { name: "Asset Licenses", value: 1800 },
  ];

  const COLORS = ["#a855f7", "#3b82f6", "#10b981"];

  return (
    <DashboardLayout title="Client Command Center">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Investment" value={9500} prefix="$" icon={Wallet} trend={{ value: 12, isUp: true }} color="purple" />
        <StatCard title="Active Streams" value={mockProjects.length} icon={Briefcase} color="blue" />
        <StatCard title="Saved Talent" value={8} icon={Heart} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Spending & Projects */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Capital Allocation</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {data.map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-[8px] text-gray-500 uppercase font-black mb-1">{item.name}</div>
                  <div className="text-lg font-black text-white">${item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Production Stream</h3>
              <button className="text-[10px] text-neon-blue font-black uppercase tracking-widest hover:underline">View All</button>
            </div>
            {mockProjects.map((proj) => (
              <div key={proj.id} className="glass p-6 rounded-3xl border-white/5 flex items-center justify-between group hover:border-neon-purple/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
                    <LayersIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tighter">{proj.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{proj.status} • 4 days left</p>
                  </div>
                </div>
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black overflow-hidden glass">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            <div className="w-full h-full grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
              <MapView creators={creators.slice(0, 5)} />
            </div>
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <button className="w-full py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                Open Discovery Map
              </button>
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border-white/5">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Activity Feed</h3>
            <div className="space-y-6">
              {[
                { label: "Milestone Reached", msg: "Footage Assembly for Cyberpunk Edit", time: "2h ago", color: "purple" },
                { label: "New Proposal", msg: "Sarah Cinematic bid on Drone Shoot", time: "5h ago", color: "blue" },
                { label: "Contract Signed", msg: "Marcus Cut confirmed Wedding Reel", time: "1d ago", color: "green" }
              ].map((item, i) => (
                <div key={i} className="relative pl-6 border-l border-white/5 pb-6 last:pb-0">
                  <div className={`absolute left-[-5px] top-0 w-2 h-2 rounded-full ${item.color === "purple" ? "bg-neon-purple" : item.color === "blue" ? "bg-neon-blue" : "bg-green-500"} shadow-[0_0_10px_currentColor]`} />
                  <h4 className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{item.label}</h4>
                  <p className="text-[10px] text-gray-300 font-bold leading-tight">{item.msg}</p>
                  <span className="text-[8px] text-gray-600 font-mono mt-1 block uppercase">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const LayersIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>
  </svg>
);

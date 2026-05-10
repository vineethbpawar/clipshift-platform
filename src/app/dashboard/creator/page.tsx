"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Users, 
  MapPin, 
  Zap,
  ChevronRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CommissionTable } from "@/components/monetization/CommissionTable";
import { motion, AnimatePresence } from "framer-motion";
import { VideoAnalyzer } from "@/components/ai/VideoAnalyzer";
import { PortfolioInsights } from "@/components/ai/PortfolioInsights";

export default function CreatorDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);

  const earningsData = [
    { name: "Day 1", amount: 400 },
    { name: "Day 5", amount: 1200 },
    { name: "Day 10", amount: 900 },
    { name: "Day 15", amount: 1800 },
    { name: "Day 20", amount: 1400 },
    { name: "Day 25", amount: 2200 },
    { name: "Day 30", amount: 3100 },
  ];

  return (
    <DashboardLayout title="Creator Command">
      {/* Top Section: Stats & Availability */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
          <StatCard title="Total Earnings" value={12450} prefix="$" icon={DollarSign} trend={{ value: 15, isUp: true }} color="purple" />
          <StatCard title="Profile Reach" value={2840} icon={Eye} color="blue" />
          <StatCard title="Client Matches" value={42} icon={Users} color="green" />
        </div>
        
        <div className="glass p-6 rounded-3xl border-white/5 flex items-center gap-6 self-stretch">
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 text-right">Status</div>
            <div className={`text-xs font-black uppercase tracking-widest ${isAvailable ? "text-green-500" : "text-neon-purple"}`}>
              {isAvailable ? "Ready for Shoots" : "In Production"}
            </div>
          </div>
          <button 
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-14 h-8 rounded-full p-1 transition-colors relative ${isAvailable ? "bg-green-500" : "bg-zinc-800"}`}
          >
            <motion.div 
              animate={{ x: isAvailable ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full shadow-lg"
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Revenue Flow (30D)</h3>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-[10px] font-black text-green-500 uppercase">+₹1.2k today</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="amount" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Location */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Production Pipeline</h3>
            <div className="space-y-4">
              {[
                { title: "Music Video Grade", status: "Revision" },
                { title: "Drone Landscape", status: "Delivered" },
                { title: "Cyberpunk Edit", status: "Encoding" }
              ].map((proj, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                  <div>
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">{proj.title}</h4>
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest">{proj.status}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-neon-purple transition-all" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border-neon-blue/20">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={18} className="text-neon-blue" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Base Node</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">Your location is currently set to <span className="text-white font-bold">Andheri, Mumbai</span>. This affects your local shoot visibility.</p>
            <button className="text-[10px] text-neon-blue font-black uppercase tracking-widest hover:underline">Update Location Map</button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Commission & Portfolio Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <CommissionTable />
        
        <div className="glass p-8 rounded-[40px] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Top Performances</h3>
            <Zap size={18} className="text-neon-purple animate-pulse" />
          </div>
          <div className="space-y-6">
            {[
              { name: "Urban Dusk Reel", views: "12.4k", score: 98 },
              { name: "Vogue Fashion Film", views: "8.1k", score: 94 },
              { name: "Hyper-lapse City", views: "5.2k", score: 91 }
            ].map((piece, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">{piece.name}</h4>
                    <span className="text-[8px] text-gray-500 uppercase tracking-widest">{piece.views} views</span>
                  </div>
                  <span className="text-[10px] font-mono text-neon-purple">{piece.score}% Quality</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${piece.score}%` }}
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Deep Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <VideoAnalyzer />
        <PortfolioInsights />
      </div>
    </DashboardLayout>
  );
}

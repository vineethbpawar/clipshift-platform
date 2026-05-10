"use client";

import React from "react";
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
  ArrowUpRight,
  Zap,
  Globe
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const platformRevenue = [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 48000 },
    { month: "Apr", amount: 61000 },
    { month: "May", amount: 59000 },
    { month: "Jun", amount: 72000 },
  ];

  const verificationQueue = [
    { id: "v1", name: "CyberNode Media", category: "VFX", level: "Professional", score: 92 },
    { id: "v2", name: "Lunar Lens", category: "Drone", level: "Expert", score: 95 },
    { id: "v3", name: "Retro Vibe", category: "Colorist", level: "Standard", score: 88 },
  ];

  return (
    <DashboardLayout title="Platform Control Center">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={1420} icon={Users} trend={{ value: 8, isUp: true }} color="blue" />
        <StatCard title="Platform Revenue" value={342500} prefix="$" icon={DollarSign} trend={{ value: 22, isUp: true }} color="purple" />
        <StatCard title="Total Creators" value={480} icon={Zap} trend={{ value: 5, isUp: true }} color="green" />
        <StatCard title="Fraud Alerts" value={3} icon={AlertTriangle} color="purple" />
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
          <div className="h-[350px] w-full">
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
          </div>
        </div>

        {/* Verification Queue */}
        <div className="glass p-8 rounded-[40px] border-white/5">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Verification Queue</h3>
            <span className="text-[10px] font-mono text-neon-purple">({verificationQueue.length} Pending)</span>
          </div>
          <div className="space-y-6">
            {verificationQueue.map((item) => (
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
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl glass border border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all">
            Full Review List
          </button>
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
              Highest creator density detected in <span className="text-white font-bold">South Asia (Mumbai/Delhi Nodes)</span> followed by Europe Central. 
            </p>
          </div>
          <div className="hidden md:flex gap-4">
            {[72, 45, 30].map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-16 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${v}%` }}
                    className="absolute bottom-0 w-full bg-neon-blue"
                  />
                </div>
                <span className="text-[8px] font-mono text-gray-600">N{i+1}</span>
              </div>
            ))}
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
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-500">Escrow Liquidity</span>
              <span className="text-white">Nominal</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-neon-purple" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

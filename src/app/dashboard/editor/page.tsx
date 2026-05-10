"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { CommissionTable } from "@/components/monetization/CommissionTable";

export default function EditorDashboard() {
  return (
    <DashboardLayout title="Editor Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="col-span-2">
          <h3 className="text-xl font-bold mb-4 text-white">Pending Commissions</h3>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Color Grade: Neon Nights</div>
                  <div className="text-xs text-gray-500">Client: Arasaka Corp</div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-neon-purple text-white text-[10px] font-bold uppercase">Accept</button>
              </div>
            ))}
          </div>
        </GlassCard>
        
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-xl font-bold mb-4 text-white">Analytics</h3>
            <div className="space-y-4 text-center">
              <div className="text-4xl font-black text-neon-purple">84%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Portfolio Completion</div>
            </div>
          </GlassCard>
          <CommissionTable />
        </div>
      </div>
    </DashboardLayout>
  );
}

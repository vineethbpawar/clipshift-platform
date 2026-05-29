"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { TrendingUp } from "lucide-react";

export default function ClientAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Spending Analytics">
        <div className="py-20 text-center glass rounded-[40px] border-white/5">
          <TrendingUp size={40} className="text-neon-blue mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Analyzing Platform Volume...</h3>
          <p className="text-xs text-gray-500 font-black uppercase tracking-widest">No transaction data detected for this cycle.</p>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

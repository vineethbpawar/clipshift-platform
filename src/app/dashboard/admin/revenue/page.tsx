"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DollarSign } from "lucide-react";

export default function AdminRevenuePage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout title="Platform Revenue">
        <div className="py-20 text-center glass rounded-[40px] border-white/5">
          <DollarSign size={40} className="text-neon-blue mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Revenue Ledger</h3>
          <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Compiling transaction history...</p>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

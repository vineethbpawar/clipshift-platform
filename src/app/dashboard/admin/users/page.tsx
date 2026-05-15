"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Users } from "lucide-react";

export default function AdminUserAuditPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout title="User Audit">
        <div className="py-20 text-center glass rounded-[40px] border-white/5">
          <Users size={40} className="text-neon-purple mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Synchronizing User Nodes</h3>
          <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Global directory loading...</p>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

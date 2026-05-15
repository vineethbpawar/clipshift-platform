"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ShieldCheck } from "lucide-react";

export default function AdminModerationPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout title="Moderation Stream">
        <div className="py-20 text-center glass rounded-[40px] border-white/5">
          <ShieldCheck size={40} className="text-red-500 mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Security Enforcement</h3>
          <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Scanning content nodes for violations...</p>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

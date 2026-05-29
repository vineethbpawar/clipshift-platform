"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Heart } from "lucide-react";

export default function ClientSavedTalentPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <DashboardLayout title="Saved Talent">
        <div className="py-20 text-center glass rounded-[40px] border-white/5">
          <Heart size={40} className="text-neon-purple mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No Saved Creators</h3>
          <p className="text-xs text-gray-500">Your curated list of cinematic creators will appear here.</p>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

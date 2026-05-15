"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { PortfolioUpload } from "@/components/dashboard/PortfolioUpload";
import { VideoAnalyzer } from "@/components/ai/VideoAnalyzer";
import { PortfolioInsights } from "@/components/ai/PortfolioInsights";
import { Briefcase } from "lucide-react";

export default function CreatorPortfolioPage() {
  return (
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="Portfolio Command">
        <div className="space-y-8 md:space-y-12">
          {/* Top Info */}
          <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 bg-gradient-to-br from-neon-purple/5 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase size={20} className="text-neon-purple" />
              <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-[0.2em]">Portfolio Transmitter</h3>
            </div>
            <p className="text-[11px] md:text-xs text-gray-400 max-w-2xl leading-relaxed">
              Manage your cinematic nodes and global showcase. High-fidelity uploads are automatically indexed by our AI for market matching.
            </p>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <PortfolioUpload />
            <VideoAnalyzer />
          </div>

          <div className="mt-8 md:mt-12">
            <PortfolioInsights />
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

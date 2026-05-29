"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert, Gavel, Trash2, CheckCircle, ExternalLink, Inbox } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { toast } from "react-hot-toast";

export default function AdminModerationPage() {
  const [loading, setLoading] = useState(true);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout title="Content Moderation">
        <div className="space-y-12">
          <div className="mb-4">
             <p className="text-sm text-gray-400 font-medium max-w-2xl">
               Monitor and review user-generated content for community standard compliance.
             </p>
          </div>

          <div className="glass p-20 rounded-[50px] border-white/5 bg-white/[0.01] text-center">
             <div className="w-20 h-20 rounded-3xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mx-auto mb-8 text-neon-blue">
                <ShieldAlert size={40} />
             </div>
             <h3 className="text-2xl font-black text-white uppercase mb-4 italic tracking-tighter">Queue Clear</h3>
             <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto opacity-60 leading-relaxed">
               All reported content and automated flags have been resolved. Monitoring platform in real-time.
             </p>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

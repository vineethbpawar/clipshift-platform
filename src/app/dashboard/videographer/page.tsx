"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function VideographerDashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/creator");
  }, [router]);
  return (
    <RoleGuard allowedRoles={["creator"]}>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-purple" size={32} />
      </div>
    </RoleGuard>
  );
}

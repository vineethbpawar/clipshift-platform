"use client";

import { useAuth, type Role, getDashboardPath } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      if (role && !allowedRoles.includes(role)) {
        console.warn(`Unauthorized access attempt. Role: ${role}, Allowed: ${allowedRoles}`);
        router.push(getDashboardPath(role));
      }
    }
  }, [user, role, loading, allowedRoles, router]);

  if (loading || !user || (role && !allowedRoles.includes(role))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="animate-spin text-neon-purple" size={40} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          Verifying Security Clearances...
        </span>
      </div>
    );
  }

  return <>{children}</>;
};

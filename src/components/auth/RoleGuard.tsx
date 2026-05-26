"use client";

import { useAuth, type Role, getDashboardPath } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If auth is loaded and user doesn't match, redirect immediately
    if (!loading) {
      if (!user || !role || !allowedRoles.includes(role)) {
        router.push("/auth/login");
      } else {
        setIsReady(true);
      }
    }
  }, [loading, user, role, allowedRoles, router]);

  // Loading state
  if (loading && !isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black">
        <Loader2 className="animate-spin text-neon-purple" size={40} />
      </div>
    );
  }

  // Final check before rendering
  if (!isReady) return null;

  return <>{children}</>;
};

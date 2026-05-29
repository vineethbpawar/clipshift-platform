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
  const [timedOut, setTimedOut] = useState(false);

  const isReady = !loading && user && role && allowedRoles.includes(role);

  useEffect(() => {
    console.log("ROLEGUARD STATE", { loading, hasUser: !!user, role, allowedRoles });

    const timer = setTimeout(() => {
      if (loading && !isReady) {
        console.log("ROLEGUARD: Timeout reached, checking fallback...");
        setTimedOut(true);
      }
    }, 5000);

    // Side effects: Redirects
    if (!loading) {
      if (user && role && !allowedRoles.includes(role)) {
        // Wrong dashboard for this role
        const correctPath = getDashboardPath(role);
        console.log("ROLEGUARD: Wrong dashboard, redirecting to", correctPath);
        router.push(correctPath);
      } else if (!user || !role) {
        console.log("ROLEGUARD: No user/role, redirecting to login");
        router.push("/auth/login");
      }
    }

    return () => clearTimeout(timer);
  }, [loading, user, role, allowedRoles, router, isReady]);

  // Fallback Check if timed out
  useEffect(() => {
    if (timedOut && loading) {
      console.log("ROLEGUARD FALLBACK START");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
      const storageKey = `sb-${projectRef}-auth-token`;
      
      const rawSession = localStorage.getItem(storageKey) || localStorage.getItem("clipshift_session");
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);
          if (session?.user) {
            console.log("ROLEGUARD: Stuck, forcing reload");
            window.location.reload();
          }
        } catch { router.push("/auth/login"); }
      } else {
        router.push("/auth/login");
      }
    }
  }, [timedOut, loading, router]);

  // Loading state
  if (loading && !isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black">
        <Loader2 className="animate-spin text-neon-purple" size={40} />
        {timedOut && <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Authenticating...</p>}
      </div>
    );
  }

  // Final check before rendering
  if (!isReady) return null;

  return <>{children}</>;
};

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setTimedOut(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [loading]);

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

  if (timedOut && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="p-6 glass border-red-500/20 rounded-3xl max-w-md">
          <h2 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Security Node Timeout</h2>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Something went wrong while verifying your session. This node is taking too long to respond.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-neon-purple text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
            >
              Refresh Node
            </button>
            <button 
              onClick={() => router.push("/auth/login")}
              className="w-full py-4 glass border-white/10 text-gray-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-white"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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

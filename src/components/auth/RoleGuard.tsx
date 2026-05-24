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

  console.log("ROLEGUARD STATE", { loading, user: !!user, role, allowedRoles });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("ROLEGUARD: Session verification timed out.");
        setTimedOut(true);
      }
    }, 15000); // Increased to 15s

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("ROLEGUARD: No user session, redirecting to login...");
        router.push("/auth/login");
        return;
      }

      if (!role) {
        console.warn("ROLEGUARD: User session exists but role is missing.");
        return; // Handled in render
      }

      if (!allowedRoles.includes(role)) {
        console.warn(`ROLEGUARD: Unauthorized access. Role: ${role}, Allowed: ${allowedRoles}`);
        router.push(getDashboardPath(role));
      }
    }
  }, [user, role, loading, allowedRoles, router]);

  if (timedOut && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black px-4 text-center">
        <div className="p-8 glass border-red-500/20 rounded-3xl max-w-md">
          <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">Security Node Timeout</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed uppercase tracking-widest font-bold text-[10px]">
            The authentication grid is responding slowly. Please check your signal or restart the node.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-neon-purple text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-transform"
            >
              Restart Sync
            </button>
            <button 
              onClick={() => router.push("/auth/login")}
              className="w-full py-4 glass border-white/10 text-gray-400 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:text-white"
            >
              Abort to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black">
        <Loader2 className="animate-spin text-neon-purple" size={40} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">
          Synchronizing Security Keys...
        </span>
      </div>
    );
  }

  if (user && !role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black px-4 text-center">
        <div className="p-8 glass border-yellow-500/20 rounded-3xl max-w-md">
          <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">Profile Incomplete</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed uppercase tracking-widest font-bold text-[10px]">
            Your security profile is missing a valid role. Please re-authenticate.
          </p>
          <button 
            onClick={() => router.push("/auth/login")}
            className="w-full py-4 bg-neon-blue text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-transform"
          >
            Re-Authenticate Node
          </button>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(role)) {
    return null; // Redirect logic in useEffect handles this
  }

  return <>{children}</>;
};

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
      if (loading) {
        console.warn("ROLEGUARD: Session verification timed out.");
        setTimedOut(true);
      }
    }, 8000); 

    return () => clearTimeout(timer);
  }, [loading]);

  if (timedOut && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black px-4 text-center">
        <div className="p-8 glass border-red-500/20 rounded-3xl max-w-md">
          <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">Security Node Timeout</h2>
          <p className="text-[10px] text-gray-400 mb-8 leading-relaxed uppercase tracking-widest font-bold">
            The authentication grid is responding slowly. Please check your signal.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-neon-purple text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-transform"
          >
            Restart Sync
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black">
        <Loader2 className="animate-spin text-neon-purple" size={40} />
      </div>
    );
  }

  if (!user || !role || !allowedRoles.includes(role)) {
    router.push("/auth/login");
    return null;
  }

  console.log("ROLEGUARD READY", { role, allowedRoles });
  return <>{children}</>;
};

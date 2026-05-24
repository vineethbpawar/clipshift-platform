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
  const [fallbackUser, setFallbackUser] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (loading && !user) {
        console.log("ROLEGUARD: Session verification slow, starting fallback...");
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
        const storageKey = `sb-${projectRef}-auth-token`;
        const rawSession = localStorage.getItem(storageKey);
        console.log("ROLEGUARD FALLBACK SESSION FOUND", !!rawSession);

        if (rawSession) {
          try {
            const session = JSON.parse(rawSession);
            const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${session.user.id}&select=*`, {
              headers: { "apikey": supabaseAnonKey, "Authorization": `Bearer ${session.access_token}` }
            });
            const profiles = await response.json();
            const profile = profiles[0];
            
            console.log("ROLEGUARD FALLBACK PROFILE", profile);
            if (profile && allowedRoles.includes(profile.role)) {
              setFallbackUser(profile);
            } else {
              setTimedOut(true);
            }
          } catch (error) {
            console.error("ROLEGUARD FALLBACK ERROR", error);
            setTimedOut(true);
          }
        } else {
          setTimedOut(true);
        }
      }
    }, 3000); // Trigger fallback after 3 seconds

    return () => clearTimeout(timer);
  }, [loading, user, allowedRoles]);

  if (timedOut && loading && !fallbackUser) {
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

  const effectiveUser = user || fallbackUser;
  const effectiveRole = role || fallbackUser?.role;

  if (loading && !effectiveUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black">
        <Loader2 className="animate-spin text-neon-purple" size={40} />
      </div>
    );
  }

  if (!effectiveUser || !effectiveRole || !allowedRoles.includes(effectiveRole)) {
    router.push("/auth/login");
    return null;
  }

  console.log("ROLEGUARD READY", { role: effectiveRole, allowedRoles });
  return <>{children}</>;
};

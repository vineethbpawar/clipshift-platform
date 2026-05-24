"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { PageWrapper } from "@/components/layout/PageWrapper";
import Link from "next/link";
import { User, Video, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type Role } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const cleanEmail = email.trim().toLowerCase();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      console.log("LOGIN REST START", cleanEmail);

      const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseAnonKey!,
          "Authorization": `Bearer ${supabaseAnonKey!}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        }),
        signal: controller.signal
      });

      const authData = await tokenResponse.json();

      console.log("DIRECT AUTH RESPONSE", { status: tokenResponse.status, authData });

      if (!tokenResponse.ok) {
        throw new Error(authData.error_description || authData.msg || "Invalid login credentials");
      }

      if (!authData.access_token || !authData.refresh_token || !authData.user) {
        throw new Error("Invalid response from Supabase auth.");
      }

      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${authData.user.id}&select=id,email,role`, {
        method: "GET",
        headers: {
          "apikey": supabaseAnonKey!,
          "Authorization": `Bearer ${authData.access_token}`,
          "Content-Type": "application/json"
        },
        signal: controller.signal
      });

      const profileDataArray = await profileResponse.json();
      console.log("DIRECT PROFILE RESPONSE", { status: profileResponse.status, profileData: profileDataArray });

      if (!profileResponse.ok) {
        throw new Error(profileDataArray.message || "Failed to fetch profile");
      }

      const profile = profileDataArray[0];

      if (!profile) {
        throw new Error("Profile not found. Please signup again.");
      }

      try {
        console.log("SYNCING SESSION TO SDK...");
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
        });
        
        if (sessionError) throw sessionError;
      } catch (sessionErr: unknown) {
        console.error("SDK SESSION SYNC FAILED, USING FALLBACK:", sessionErr);
        
        // Manual localStorage fallback if SDK fails
        try {
          const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
          const storageKey = `sb-${projectRef}-auth-token`;
          
          const sessionPayload = {
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            expires_in: authData.expires_in,
            expires_at: Math.floor(Date.now() / 1000) + Number(authData.expires_in || 3600),
            token_type: authData.token_type || "bearer",
            user: authData.user
          };

          localStorage.setItem(storageKey, JSON.stringify(sessionPayload));
          console.log("MANUAL SESSION STORAGE SUCCESS");
        } catch (storageErr) {
          console.error("CRITICAL: SESSION STORAGE FAILED", storageErr);
        }
      }

      let dashboardPath = "/dashboard/client";

      if (profile.role === "creator") {
        dashboardPath = "/dashboard/creator";
      } else if (profile.role === "admin") {
        dashboardPath = "/dashboard/admin";
      }

      console.log("LOGIN REDIRECT TO", dashboardPath);

      // Force reload redirect
      window.location.href = dashboardPath;
    } catch (err: unknown) {
      console.error("LOGIN REST ERROR", err);

      if (err instanceof Error && err.name === 'AbortError') {
        setError("Login timed out. Please check your internet or Supabase connection.");
        return;
      }

      const message = err instanceof Error ? err.message : "";

      if (message.includes("Invalid login credentials") || message.includes("Invalid email or password") || message.includes("invalid_credentials")) {
        setError("Invalid email or password.");
      } else if (message.includes("Failed to fetch") || message.includes("NetworkError") || (err instanceof Error && err.name === 'TypeError')) {
        setError("Cannot connect to Supabase. Check your internet/network and try again.");
      } else if (message.includes("Profile not found")) {
        setError("Profile not found. Please signup again.");
      } else {
        setError(message || "Login failed. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      console.log("LOGIN REST FINALLY");
    }
  };

  const roleIcons = [
    { id: "client", label: "Client", icon: User },
    { id: "creator", label: "Creator", icon: Video },
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
              Welcome <span className="text-neon-purple">Back</span>
            </h1>
            <p className="text-gray-400">Enter your credentials to access the cinematic world</p>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5 relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between gap-2 mb-8 p-1 bg-white/5 rounded-xl">
                {roleIcons.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id as Role)}
                      className={`flex-1 flex flex-col items-center py-3 rounded-lg transition-all duration-300 ${
                        isActive ? "bg-neon-purple text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <Icon size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{role.label}</span>
                    </button>
                  );
                })}
              </div>

              <FloatingInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <FloatingInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link href="/auth/forgot-password" title="Forgot Password?" className="text-[10px] text-gray-500 hover:text-neon-purple transition-colors uppercase font-bold tracking-widest">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <NeonButton variant="purple" className="w-full py-4" type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Access Dashboard"}
              </NeonButton>
            </form>

            <div className="mt-4 text-center">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                Debug: direct REST login enabled
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-neon-purple font-bold hover:underline">
                  Join the Collective
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

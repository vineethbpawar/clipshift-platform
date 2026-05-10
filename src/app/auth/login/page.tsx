"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuth, type Role } from "@/context/AuthContext";
import Link from "next/link";
import { User, Edit3, Video } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("client");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const roleIcons = [
    { id: "client", label: "Client", icon: User },
    { id: "editor", label: "Editor", icon: Edit3 },
    { id: "videographer", label: "Creator", icon: Video },
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
              <FloatingInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <NeonButton variant="purple" className="w-full py-4" type="submit">
                Access Dashboard
              </NeonButton>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{" "}
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

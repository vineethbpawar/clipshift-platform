"use client";

import React, { useState } from "react";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated successfully");
      router.push("/auth/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
              New <span className="text-neon-purple">Identity</span>
            </h1>
            <p className="text-gray-400">Establish your new cinematic access credentials</p>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5 relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-8">
                <Lock className="text-neon-purple" size={20} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Secured Connection</span>
              </div>

              <div className="relative">
                <FloatingInput
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <FloatingInput
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <NeonButton variant="purple" className="w-full py-4" type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Update Credentials"}
              </NeonButton>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

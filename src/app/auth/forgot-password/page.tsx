"use client";

import React, { useState } from "react";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
      toast.success("Reset link sent to your email");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full max-w-md">
          <Link href="/auth/login" className="inline-flex items-center text-gray-500 hover:text-white transition-colors mb-8 group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Login</span>
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
              Recover <span className="text-neon-purple">Access</span>
            </h1>
            <p className="text-gray-400">We&apos;ll send you a link to reset your production keys</p>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5 relative">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <FloatingInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <NeonButton variant="purple" className="w-full py-4" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Send Reset Link"}
                </NeonButton>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-neon-purple/10 rounded-2xl flex items-center justify-center text-neon-purple mx-auto mb-6">
                  <Mail size={32} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Check Your Inbox</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  If an account exists for <span className="text-white font-bold">{email}</span>, you will receive a password reset link shortly.
                </p>
                <NeonButton variant="purple" className="w-full" onClick={() => setSubmitted(false)}>
                  Resend Link
                </NeonButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

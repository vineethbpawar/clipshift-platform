"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Mail, MessageSquare, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
    toast.success("Signal Received. We'll get back to you soon.");
  };

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Signal <span className="text-neon-blue">Headquarters</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto uppercase tracking-widest text-[10px] font-black">
            Reach out for support, partnerships, or network inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="space-y-12">
            <div className="glass p-8 rounded-[40px] border-white/5 space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Electronic Mail</h3>
                  <p className="text-sm text-gray-400 font-bold">clipshiftplatform@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Network Support</h3>
                  <p className="text-sm text-gray-400 font-bold">Available 24/7 for premium nodes</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Base Coordinates</h3>
                  <p className="text-sm text-gray-400 font-bold">Global Distributed Network</p>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Corporate Intelligence</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                ClipShift is built for the next generation of cinematic creators. 
                Our team is dedicated to providing the most secure and efficient marketplace for creative talent.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative">
            {sent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-12 rounded-[40px] border-green-500/20 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-8">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Signal Sent</h2>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">We have received your transmission and will respond shortly.</p>
                <button 
                  onClick={() => setSent(false)}
                  className="mt-8 px-8 py-3 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
                >
                  Send Another Signal
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="glass p-8 md:p-12 rounded-[40px] border-white/5 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2">Node Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-neon-blue/50 transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2">Signal Address</label>
                  <input 
                    required
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-neon-blue/50 transition-all"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2">Transmission</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-neon-blue/50 transition-all resize-none"
                    placeholder="Describe your inquiry..."
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-neon-blue text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      <Send size={16} />
                      Send Transmission
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

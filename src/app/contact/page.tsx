"use client";

import React, { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck, Zap, Globe, Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    setTimeout(() => {
      setFormStatus("sent");
      toast.success("Message Received. We'll get back to you soon.");
    }, 1500);
  };

  const contactInfo = [
    {
      title: "Direct Support",
      value: "support@clipshift.com",
      icon: Mail,
      desc: "Available 24/7 for premium members"
    },
    {
      title: "Global HQ",
      value: "Mumbai, India",
      icon: Globe,
      desc: "Creative Hub & Operations"
    },
    {
      title: "Community",
      value: "@clipshift_collective",
      icon: Heart,
      desc: "Follow our creative journey"
    }
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left: Info */}
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neon-blue/10 rounded-xl text-neon-blue border border-neon-blue/20">
                  <MessageSquare size={20} />
                </div>
                <h1 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Connect With Us</h1>
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8 italic">
                Get in <span className="text-neon-blue">Touch</span>
              </h2>
              <p className="text-gray-500 uppercase tracking-widest text-xs font-bold leading-relaxed max-w-md opacity-70">
                Have questions about our marketplace or need technical assistance? Our team is ready to help you elevate your productions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((item, i) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 glass rounded-[40px] border-white/5 bg-white/[0.01] hover:border-neon-blue/30 transition-all group"
                >
                  <item.icon size={28} className="text-neon-blue mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{item.title}</h3>
                  <p className="text-sm font-black text-white uppercase tracking-tighter mb-1 italic">{item.value}</p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {formStatus === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center glass rounded-[50px] border-neon-blue/20 bg-neon-blue/[0.02] p-12 text-center"
                >
                  <div className="w-24 h-24 rounded-[40px] bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <Send size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Message Sent</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-relaxed mb-10">
                    Your inquiry has been successfully delivered. <br /> Our team will respond within 12 hours.
                  </p>
                  <button 
                    onClick={() => setFormStatus("idle")}
                    className="px-10 py-4 glass border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all active:scale-95"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="glass p-10 sm:p-14 rounded-[50px] border-white/5 bg-white/[0.01] space-y-8"
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-4 block opacity-60">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Your name"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-blue transition-all italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-4 block opacity-60">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="name@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-blue transition-all italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-4 block opacity-60">Message</label>
                      <textarea 
                        required
                        placeholder="How can we help with your project?"
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-[32px] py-6 px-8 text-sm text-white outline-none focus:border-neon-blue transition-all resize-none italic"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={formStatus === "sending"}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-neon-blue hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {formStatus === "sending" ? (
                      <Loader2 className="animate-spin text-black" size={20} />
                    ) : (
                      <>Send Message <Send size={18} /></>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-neon-blue/5 rounded-full blur-[100px] pointer-events-none" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

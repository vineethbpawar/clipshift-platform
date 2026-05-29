"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { ChatList } from "@/components/chat/ChatList";

export default function ChatLandingPage() {
  return (
    <PageWrapper>
      <div className="h-[100dvh] pt-20 flex bg-black overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-full lg:w-96 border-r border-white/5 bg-black/40 backdrop-blur-2xl shrink-0">
          <ChatList />
        </div>

        {/* Empty State / Welcome */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-white/[0.01] p-10">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 rounded-[40px] bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
              <MessageSquare size={48} className="text-neon-purple" />
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
              Professional <span className="text-neon-purple">Messages</span>
            </h2>
            <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold leading-relaxed mb-12">
              Select a conversation from the sidebar to coordinate your projects. Secure, professional, and seamless.
            </p>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 glass rounded-3xl border-white/5 bg-black/40">
                  <ShieldCheck size={20} className="text-neon-blue mx-auto mb-3" />
                  <p className="text-[8px] text-white font-black uppercase tracking-widest">End-to-End Encrypted</p>
               </div>
               <div className="p-6 glass rounded-3xl border-white/5 bg-black/40">
                  <Zap size={20} className="text-yellow-500 mx-auto mb-3" />
                  <p className="text-[8px] text-white font-black uppercase tracking-widest">Real-time Delivery</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

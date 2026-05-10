"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ChatList } from "@/components/chat/ChatList";
import { MessageSquare, ShieldCheck } from "lucide-react";

export default function ChatListPage() {
  return (
    <PageWrapper>
      <div className="h-screen pt-20 flex bg-black">
        <div className="w-full max-w-sm">
          <ChatList />
        </div>
        
        {/* Empty State / Welcome */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-20 text-center">
          <div className="w-24 h-24 rounded-[40px] bg-neon-purple/5 border border-neon-purple/20 flex items-center justify-center mb-8 relative">
            <MessageSquare size={48} className="text-neon-purple opacity-50" />
            <div className="absolute inset-0 bg-neon-purple/10 blur-3xl rounded-full -z-10" />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Cinematic <span className="text-neon-purple">Signals</span>
          </h2>
          <p className="text-gray-500 max-w-sm leading-relaxed mb-12">
            Select a conversation from the sidebar to coordinate your production stream. Secure, encrypted, and seamless.
          </p>
          
          <div className="flex items-center gap-2 px-6 py-3 glass border-neon-blue/20 rounded-full">
            <ShieldCheck size={16} className="text-neon-blue" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">End-to-End Encrypted Node</span>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

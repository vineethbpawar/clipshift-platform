"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { Search, ShieldCheck, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export const ChatList = () => {
  const { conversations, loading } = useChat();

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border-r border-white/5">
      <div className="p-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Messages</h2>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-purple transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-white outline-none focus:border-neon-purple transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-neon-purple" size={24} />
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Scanning Signal...</span>
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => {
            const otherUser = conv.other_user;
            if (!otherUser) return null;

            return (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden glass border border-white/10">
                      <img src={otherUser.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-1">
                        {otherUser.full_name}
                        <ShieldCheck size={12} className="text-neon-blue" />
                      </h4>
                      <span className="text-[8px] text-gray-600 font-mono">
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-[10px] truncate transition-colors ${conv.unreadCount && conv.unreadCount > 0 ? "text-white font-black" : "text-gray-500 group-hover:text-gray-300"}`}>
                        {conv.last_message || "Start a cinematic conversation..."}
                      </p>
                      {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-neon-purple text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })
        ) : (
          <div className="py-20 text-center px-8 flex flex-col items-center">
            <MessageSquare size={32} className="text-gray-800 mb-4" />
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest leading-relaxed">
              No active signals found. Unlock a creator to start collaborating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

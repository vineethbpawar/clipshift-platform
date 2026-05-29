"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { Search, ShieldCheck, MessageSquare, Loader2, Filter } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const ChatList = () => {
  const { conversations, loading, setActiveConversation } = useChat();

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-2xl">
      <div className="p-8 sm:p-10 border-b border-white/5">
        <div className="flex items-center justify-between mb-10">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Messages</h2>
           <div className="p-2 glass rounded-xl text-gray-500 hover:text-white transition-colors cursor-pointer border border-white/5">
              <Filter size={18} />
           </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-purple transition-all" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white outline-none focus:border-neon-purple transition-all italic bg-black/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-neon-purple animate-spin" />
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">Loading Inbox</span>
          </div>
        ) : conversations.length > 0 ? (
          <AnimatePresence>
            {conversations.map((conv, idx) => {
              const otherUser = conv.other_user;
              if (!otherUser) return null;

              return (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-5 p-5 rounded-3xl hover:bg-white/5 transition-all group relative border border-transparent hover:border-white/5"
                  >
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden glass border border-white/10 group-hover:border-neon-purple/50 transition-colors shadow-lg">
                        <img src={otherUser.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-1.5 truncate italic">
                          {otherUser.full_name}
                          <ShieldCheck size={14} className="text-neon-blue" />
                        </h4>
                        <span className="text-[8px] text-gray-600 font-mono">
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-[10px] uppercase tracking-widest truncate transition-colors font-medium ${conv.unreadCount && conv.unreadCount > 0 ? "text-neon-purple font-black" : "text-gray-500 group-hover:text-gray-300 opacity-60"}`}>
                          {conv.last_message || "Start a conversation..."}
                        </p>
                        {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-neon-purple text-white text-[9px] font-black flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="py-24 text-center px-10 flex flex-col items-center glass rounded-[40px] border-white/5 m-4 bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
              <MessageSquare size={24} className="text-gray-700" />
            </div>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] leading-relaxed opacity-60">
              No conversations found. Unlock a creator to start collaborating.
            </p>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-black/40">
         <div className="flex items-center justify-center gap-3 py-3 glass rounded-2xl border border-white/5 text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">
            <ShieldCheck size={12} className="text-neon-blue" /> Secure Messaging Node
         </div>
      </div>
    </div>
  );
};

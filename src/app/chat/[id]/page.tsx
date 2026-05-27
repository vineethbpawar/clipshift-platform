"use client";

import React, { useState, useEffect, useRef } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { Send, Image, Paperclip, ShieldCheck, MoreVertical, Search, ArrowLeft, Pin, Smile, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ProjectUpdateCard } from "@/components/chat/ProjectUpdateCard";
import { ChatList } from "@/components/chat/ChatList";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const { 
    conversations, 
    activeChatMessages, 
    setActiveConversation, 
    sendMessage, 
    markAsRead, 
    loading 
  } = useChat();
  
  const conversationId = params.id as string;
  const conversation = conversations.find(c => c.id === conversationId);
  const otherUser = conversation?.other_user;
  
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveConversation(conversationId);
    if (conversationId) markAsRead(conversationId);
    
    return () => setActiveConversation(null);
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !conversation) return;
    
    setIsSending(true);
    try {
      // 1. Force Session Restoration
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { getStoredSession } = await import("@/lib/supabase");
        const stored = getStoredSession();
        if (stored?.access_token) {
          await supabase.auth.setSession({ access_token: stored.access_token, refresh_token: stored.refresh_token });
        }
      }

      console.log("CHAT CURRENT USER", user.id);
      console.log("CHAT CONVERSATION ID", conversationId);
      console.log("CHAT CONVERSATION RESULT", conversation);

      const receiverId = user.id === conversation.client_id ? conversation.creator_id : conversation.client_id;
      await sendMessage(receiverId, inputText);
      setInputText("");
    } catch (err) {
      console.error("CHAT ERROR", err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="h-screen flex items-center justify-center bg-black">
          <Loader2 className="animate-spin text-neon-purple" size={48} />
          <span className="ml-4 text-xs font-black uppercase tracking-widest text-gray-500">Loading chat...</span>
        </div>
      </PageWrapper>
    );
  }

  if (!conversation && !loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center pt-20 bg-black">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-widest">Chat not found</h2>
            <p className="text-gray-500 mb-8">Conversation not found or access denied.</p>
            <Link href="/chat">
              <button className="px-8 py-4 bg-neon-purple text-white rounded-full font-black uppercase text-xs">Back to Messages</button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="h-[100dvh] pt-20 flex bg-black overflow-hidden">
        {/* Sidebar for Desktop */}
        <div className="hidden lg:block w-full max-w-sm border-r border-white/5">
          <ChatList />
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col relative min-w-0">
          {/* Chat Header */}
          <div className="glass border-b border-white/5 px-4 sm:px-8 py-4 flex items-center justify-between z-10 backdrop-blur-xl">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              <Link href="/chat" className="lg:hidden text-gray-500 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 rounded-xl overflow-hidden glass border border-neon-purple/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] shrink-0">
                <img src={otherUser?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2 truncate">
                  {otherUser?.full_name}
                  <ShieldCheck size={14} className="text-neon-blue shrink-0" />
                </h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 text-gray-500">
              <Search size={18} className="hidden sm:block cursor-pointer hover:text-white transition-colors" />
              <MoreVertical size={18} className="cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar scroll-smooth"
          >
            {activeChatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center opacity-30">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <MessageSquare size={28} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                  Start a conversation with {otherUser?.full_name}
                </p>
              </div>
            )}

            {activeChatMessages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isMe={msg.sender_id === user?.id}
                onReact={() => {}}
              />
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 sm:p-8 pt-0">
            <div className="glass border border-white/10 rounded-[28px] sm:rounded-[32px] p-1 sm:p-2 flex items-center gap-1 sm:gap-2 focus-within:border-neon-purple/50 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all">
              <div className="flex">
                <button className="p-2 sm:p-3 text-gray-500 hover:text-neon-blue transition-colors">
                  <Paperclip size={18} />
                </button>
              </div>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-gray-600 font-medium px-2"
                disabled={isSending}
              />
              
              <div className="flex items-center gap-1">
                <button className="hidden sm:block p-3 text-gray-500 hover:text-yellow-500 transition-colors">
                  <Smile size={18} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={isSending || !inputText.trim()}
                  className="p-3 sm:p-4 rounded-2xl bg-neon-purple text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </div>
            <div className="h-safe-area-bottom lg:hidden" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

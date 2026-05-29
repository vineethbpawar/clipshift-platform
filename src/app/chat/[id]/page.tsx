"use client";

import React, { useState, useEffect, useRef } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatList } from "@/components/chat/ChatList";
import { 
  Send, 
  Paperclip, 
  ShieldCheck, 
  MoreVertical, 
  Search, 
  ArrowLeft, 
  Smile, 
  Loader2, 
  MessageSquare,
  Zap
} from "lucide-react";

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
    if (conversationId) {
      setActiveConversation(conversationId);
      markAsRead(conversationId);
    }
    
    return () => setActiveConversation(null);
  }, [conversationId, setActiveConversation, markAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !conversation) return;
    
    setIsSending(true);
    try {
      const receiverId = user.id === conversation.client_id ? conversation.creator_id : conversation.client_id;
      
      console.log("CHAT SEND START", { convId: conversationId, sender: user.id, receiver: receiverId });

      await sendMessage(receiverId, inputText.trim());
      
      setInputText("");
      console.log("CHAT MESSAGE SENT SUCCESSFUL");
    } catch (err) {
      console.error("CHAT ERROR", err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading && !conversation) {
    return (
      <PageWrapper>
        <div className="h-screen flex flex-col items-center justify-center bg-black">
          <Loader2 className="animate-spin text-neon-purple mb-4" size={48} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Loading conversation</span>
        </div>
      </PageWrapper>
    );
  }

  if (!conversation && !loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center pt-20 bg-black px-6">
          <div className="text-center glass p-12 rounded-[50px] border-white/5 max-w-lg w-full">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
               <Zap size={32} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter italic">Conversation not found</h2>
            <p className="text-gray-500 mb-10 uppercase tracking-widest text-[10px] font-bold leading-relaxed">
              This conversation may have been deleted or you do not have permission to access it.
            </p>
            <Link href="/chat">
              <button className="px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-xl">Back to Messages</button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="h-[100dvh] pt-20 flex bg-black overflow-hidden relative">
        {/* Sidebar for Desktop */}
        <div className="hidden lg:block w-72 lg:w-96 border-r border-white/5 bg-black/40 backdrop-blur-2xl shrink-0">
          <ChatList />
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col relative min-w-0 bg-white/[0.01]">
          {/* Chat Header */}
          <div className="glass border-b border-white/5 px-6 sm:px-10 py-5 flex items-center justify-between z-10 backdrop-blur-3xl bg-black/60">
            <div className="flex items-center gap-4 sm:gap-6 overflow-hidden">
              <Link href="/chat" className="lg:hidden p-2.5 glass rounded-xl text-gray-500 hover:text-white transition-colors border border-white/5">
                <ArrowLeft size={18} />
              </Link>
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden glass border border-neon-purple/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <img src={otherUser?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-white uppercase tracking-tighter flex items-center gap-2 truncate italic">
                  {otherUser?.full_name}
                  <ShieldCheck size={16} className="text-neon-blue shrink-0" />
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[8px] text-green-500 uppercase font-black tracking-[0.2em]">Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex p-3 glass rounded-xl border border-white/5 text-gray-500 hover:text-white cursor-pointer transition-all">
                <Search size={18} />
              </div>
              <div className="p-3 glass rounded-xl border border-white/5 text-gray-500 hover:text-white cursor-pointer transition-all">
                <MoreVertical size={18} />
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 custom-scrollbar scroll-smooth"
          >
            {activeChatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                <div className="w-20 h-20 rounded-[32px] bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                  <MessageSquare size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                  Start a professional conversation with {otherUser?.full_name}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {activeChatMessages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isMe={msg.sender_id === user?.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 sm:p-10 pt-0 bg-gradient-to-t from-black via-black/80 to-transparent">
            <div className="glass border border-white/10 rounded-[35px] sm:rounded-[45px] p-2 flex items-center gap-2 focus-within:border-neon-purple/50 shadow-[0_10px_50px_rgba(0,0,0,0.5)] transition-all bg-black/40 backdrop-blur-xl">
              <button className="p-4 text-gray-500 hover:text-neon-blue transition-colors group">
                <Paperclip size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="bg-transparent border-none outline-none text-base text-white w-full placeholder:text-gray-600 font-medium px-2 py-3"
                disabled={isSending}
              />
              
              <div className="flex items-center gap-2 pr-2">
                <button className="hidden sm:flex p-4 text-gray-500 hover:text-yellow-500 transition-colors">
                  <Smile size={20} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={isSending || !inputText.trim()}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neon-purple text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-90 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center shrink-0"
                >
                  {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="ml-1" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

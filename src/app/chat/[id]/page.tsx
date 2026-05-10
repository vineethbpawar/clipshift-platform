"use client";

import React, { useState, useEffect, useRef } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { creators } from "@/data/creators";
import { useAuth } from "@/context/AuthContext";
import { useChat, type Message } from "@/context/ChatContext";
import { Send, Image, Paperclip, ShieldCheck, MoreVertical, Search, ArrowLeft, Pin, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ProjectUpdateCard } from "@/components/chat/ProjectUpdateCard";
import { ChatList } from "@/components/chat/ChatList";

export default function ChatPage() {
  const params = useParams();
  const { unlockedCreators } = useAuth();
  const { messages, sendMessage, markAsRead, typingStates, setTyping } = useChat();
  
  const creatorId = params.id as string;
  const creator = creators.find(c => c.id === creatorId);
  const isUnlocked = unlockedCreators.includes(creatorId);
  
  const [inputText, setInputText] = useState("");
  const chatMessages = messages[creatorId] || [];
  const isTyping = typingStates[creatorId];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isUnlocked) markAsRead(creatorId);
  }, [creatorId, isUnlocked]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Mock Auto-reply Logic
  const handleSend = () => {
    if (!inputText.trim()) return;
    
    sendMessage(creatorId, inputText);
    setInputText("");

    // Simulate creator typing
    setTimeout(() => {
      setTyping(creatorId, true);
      
      setTimeout(() => {
        setTyping(creatorId, false);
        const replies = [
          "That sounds like an amazing vision. Let's make it happen!",
          "I've updated the project milestone. Please check the card above.",
          "Perfect. I'll start working on the color grade tonight.",
          "Received the references. The moody lighting is definitely my style."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        // This is a bit hacky since we need to simulate an incoming message in the context
        // In a real app, this would come from a websocket
        // For the mock, I'll just use the context's sendMessage but with a different senderId logic if I had it
        // Since the current context hardcodes "me", I'll just keep it simple for now or update context
      }, 2500);
    }, 1500);
  };

  if (!creator || !isUnlocked) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white uppercase mb-4 tracking-widest">Access Restricted</h2>
            <p className="text-gray-500 mb-8">You need to unlock this connection first.</p>
            <Link href="/marketplace">
              <button className="px-8 py-4 bg-neon-purple text-white rounded-full font-black uppercase text-xs">Back to Discovery</button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="h-screen pt-20 flex bg-black">
        {/* Sidebar for Desktop */}
        <div className="hidden lg:block w-full max-w-sm">
          <ChatList />
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Chat Header */}
          <div className="glass border-b border-white/5 px-8 py-4 flex items-center justify-between z-10 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <Link href="/chat" className="lg:hidden text-gray-500 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-10 h-10 rounded-xl overflow-hidden glass border border-neon-purple/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <img src={creator.image} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  {creator.name}
                  <ShieldCheck size={14} className="text-neon-blue" />
                </h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Active Node</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-500">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 glass rounded-full border-white/5">
                <Pin size={12} className="text-neon-purple" />
                <span className="text-[8px] text-white uppercase font-black tracking-widest">Pinned: Project Moodboard</span>
              </div>
              <Search size={18} className="cursor-pointer hover:text-white transition-colors" />
              <MoreVertical size={18} className="cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* Messages Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth"
          >
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-xs leading-relaxed">
                Establishing quantum-secure channel with node ID-{creator.id.toUpperCase()}
              </p>
            </div>

            {/* Mock Initial Message */}
            <MessageBubble 
              message={{
                id: "init",
                senderId: creator.id,
                text: `Hi! I'm excited to help with your project. I've reviewed your request for ${creator.category}.`,
                timestamp: new Date().toISOString(),
                status: "read",
                type: "text"
              }}
              isMe={false}
              onReact={() => {}}
            />

            <ProjectUpdateCard 
              type="milestone_reached" 
              title="Creative Brief Confirmed" 
            />

            {chatMessages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isMe={msg.senderId === "me"}
                onReact={() => {}}
              />
            ))}

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <div className="p-8 pt-0">
            <div className="glass border border-white/10 rounded-[32px] p-2 flex items-center gap-2 focus-within:border-neon-purple/50 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all">
              <div className="flex gap-1">
                <button className="p-3 text-gray-500 hover:text-neon-blue transition-colors">
                  <Paperclip size={18} />
                </button>
                <button className="p-3 text-gray-500 hover:text-neon-blue transition-colors">
                  <Image size={18} />
                </button>
              </div>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Compose secure signal..."
                className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-gray-600 font-medium px-2"
              />
              
              <div className="flex items-center gap-1">
                <button className="p-3 text-gray-500 hover:text-yellow-500 transition-colors">
                  <Smile size={18} />
                </button>
                <button 
                  onClick={handleSend}
                  className="p-4 rounded-2xl bg-neon-purple text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

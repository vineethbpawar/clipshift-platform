"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { type Message } from "@/context/ChatContext";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReact: (emoji: string) => void;
}

export const MessageBubble = ({ message, isMe, onReact }: MessageBubbleProps) => {
  const isRead = message.read;

  return (
    <motion.div
      initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative`}
    >
      <div className={`relative max-w-[70%] p-4 rounded-3xl ${
        isMe 
          ? "bg-neon-purple text-white rounded-tr-none shadow-[0_10px_20px_rgba(168,85,247,0.2)]" 
          : "glass border-white/5 text-gray-300 rounded-tl-none"
      }`}>
        {message.media_type === "image" && message.media_url && (
          <div className="mb-2 rounded-xl overflow-hidden glass">
            <img src={message.media_url} className="w-full object-cover max-h-60" alt="" />
          </div>
        )}
        
        {message.media_type === "video" && message.media_url && (
          <div className="mb-2 rounded-xl overflow-hidden glass relative group/vid">
            <video src={message.media_url} className="w-full max-h-60" controls />
          </div>
        )}

        <p className="text-xs leading-relaxed">{message.content}</p>
        
        <div className={`mt-2 flex items-center gap-2 ${isMe ? "justify-end text-white/50" : "justify-start text-gray-500"}`}>
          <span className="text-[8px] font-mono tracking-widest uppercase">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && (
            <div className={isRead ? "text-neon-blue" : "text-white/30"}>
              {isRead ? <CheckCheck size={12} /> : <Check size={12} />}
            </div>
          )}
        </div>
      </div>

      {/* Hover Reactions Popup */}
      <div className={`absolute -top-8 ${isMe ? "right-0" : "left-0"} opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 glass px-3 py-1.5 rounded-full border-white/10 z-20`}>
        {["🔥", "🎬", "💎", "👍"].map(emoji => (
          <button 
            key={emoji} 
            onClick={() => onReact(emoji)}
            className="hover:scale-125 transition-transform text-xs"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck, Clock } from "lucide-react";
import { type Message } from "@/context/ChatContext";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isMe ? "justify-end" : "justify-start"} w-full group`}
    >
      <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        <div className={`
          relative px-6 py-4 rounded-[28px] text-sm md:text-base leading-relaxed
          ${isMe 
            ? "bg-neon-purple text-white rounded-tr-none shadow-[0_10px_30px_rgba(168,85,247,0.2)]" 
            : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none hover:bg-white/[0.08] transition-colors"
          }
        `}>
          <p className="font-medium tracking-wide">{message.content}</p>
          
          {message.media_url && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
               {message.media_type?.startsWith('image') ? (
                 <img src={message.media_url} className="w-full h-auto max-h-80 object-cover" alt="attachment" />
               ) : (
                 <video src={message.media_url} controls className="w-full max-h-80" />
               )}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
             <Clock size={8} />
             {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && (
            <div className="text-neon-blue">
               {message.read ? <CheckCheck size={12} /> : <Check size={12} />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

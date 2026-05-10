"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "video" | "project_update";
  mediaUrl?: string;
  reactions?: string[];
}

export interface Conversation {
  id: string;
  creatorId: string;
  lastMessage?: string;
  unreadCount: number;
  updatedAt: string;
}

interface ChatContextType {
  messages: Record<string, Message[]>;
  conversations: Conversation[];
  sendMessage: (chatId: string, text: string, type?: Message["type"], mediaUrl?: string) => void;
  markAsRead: (chatId: string) => void;
  typingStates: Record<string, boolean>;
  setTyping: (chatId: string, isTyping: boolean) => void;
  totalUnreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedMessages = localStorage.getItem("clipshift_messages");
    const savedConvs = localStorage.getItem("clipshift_conversations");
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedConvs) setConversations(JSON.parse(savedConvs));
  }, []);

  const sendMessage = (chatId: string, text: string, type: Message["type"] = "text", mediaUrl?: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: "me",
      text,
      timestamp: new Date().toISOString(),
      status: "sent",
      type,
      mediaUrl
    };

    setMessages((prev) => {
      const chatMessages = prev[chatId] || [];
      const updated = { ...prev, [chatId]: [...chatMessages, newMessage] };
      localStorage.setItem("clipshift_messages", JSON.stringify(updated));
      return updated;
    });

    setConversations((prev) => {
      const existing = prev.find(c => c.id === chatId);
      let updated;
      if (existing) {
        updated = prev.map(c => c.id === chatId ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } : c);
      } else {
        updated = [{ id: chatId, creatorId: chatId, lastMessage: text, unreadCount: 0, updatedAt: new Date().toISOString() }, ...prev];
      }
      localStorage.setItem("clipshift_conversations", JSON.stringify(updated));
      return updated;
    });
  };

  const markAsRead = (chatId: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c);
      localStorage.setItem("clipshift_conversations", JSON.stringify(updated));
      return updated;
    });
  };

  const setTyping = (chatId: string, isTyping: boolean) => {
    setTypingStates(prev => ({ ...prev, [chatId]: isTyping }));
  };

  const totalUnreadCount = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0);

  return (
    <ChatContext.Provider value={{ messages, conversations, sendMessage, markAsRead, typingStates, setTyping, totalUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};

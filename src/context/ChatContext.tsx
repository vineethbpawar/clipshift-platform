"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  creator_id: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
  unreadCount?: number;
  other_user?: {
    full_name: string;
    avatar_url: string;
  };
}

interface ChatContextType {
  conversations: Conversation[];
  activeChatMessages: Message[];
  setActiveConversation: (id: string | null) => void;
  sendMessage: (receiverId: string, content: string, type?: string, mediaUrl?: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  typingStates: Record<string, boolean>;
  setTyping: (chatId: string, isTyping: boolean) => void;
  totalUnreadCount: number;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchConversations = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { getStoredSession } = await import("@/lib/supabase");
        const stored = getStoredSession();
        if (stored?.access_token) {
          await supabase.auth.setSession({ access_token: stored.access_token, refresh_token: stored.refresh_token });
        }
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          client:profiles!conversations_client_id_fkey (full_name, avatar_url),
          creator:profiles!conversations_creator_id_fkey (full_name, avatar_url)
        `)
        .or(`client_id.eq.${user.id},creator_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped = await Promise.all(data.map(async (c) => {
          const typedC = c as { 
            id: string; 
            client_id: string; 
            creator_id: string; 
            client: { full_name: string; avatar_url: string }; 
            creator: { full_name: string; avatar_url: string };
          };
          const isClient = typedC.client_id === user.id;
          const otherUser = isClient ? typedC.creator : typedC.client;
          
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', c.id)
            .eq('receiver_id', user.id)
            .eq('read', false);

          return {
            ...c,
            other_user: otherUser as { full_name: string; avatar_url: string },
            unreadCount: count || 0
          };
        }));
        setConversations(mapped);
      }
    } catch (err) {
      console.error("Chat fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMessages = React.useCallback(async (convId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (messages) setActiveChatMessages(messages);
    } catch (err) {
      console.error("FAILED TO FETCH MESSAGES:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    // Use a microtask to avoid synchronous setState during render/effect initialization
    Promise.resolve().then(() => fetchConversations());

    const messageSub = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        if (newMessage.receiver_id === user.id || newMessage.sender_id === user.id) {
          fetchConversations();
          if (activeConversationId && newMessage.conversation_id === activeConversationId) {
            setActiveChatMessages(prev => [...prev.filter(m => m.id !== newMessage.id), newMessage]);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSub);
    };
  }, [user, activeConversationId, fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      // Use a microtask to avoid synchronous setState during render/effect initialization
      Promise.resolve().then(() => fetchMessages(activeConversationId));
    } else {
      Promise.resolve().then(() => setActiveChatMessages([]));
    }
  }, [activeConversationId, fetchMessages]);

  const sendMessage = async (receiverId: string, content: string, type: string = "text", mediaUrl?: string) => {
    if (!user || !activeConversationId) return;

    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        media_url: mediaUrl,
        media_type: type
      });

    if (msgError) throw msgError;

    await supabase
      .from('conversations')
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq('id', activeConversationId);
  };

  const markAsRead = async (convId: string) => {
    if (!user) return;
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', convId)
      .eq('receiver_id', user.id)
      .eq('read', false);
    
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
  };

  const setTyping = (chatId: string, isTyping: boolean) => {
    setTypingStates(prev => ({ ...prev, [chatId]: isTyping }));
  };

  const totalUnreadCount = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

  return (
    <ChatContext.Provider value={{ 
      conversations, 
      activeChatMessages, 
      setActiveConversation: setActiveConversationId,
      sendMessage, 
      markAsRead, 
      typingStates, 
      setTyping, 
      totalUnreadCount,
      loading
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, MessageSquare, Settings } from "lucide-react";
import { useAuth, getDashboardPath } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

export const MobileNav = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const { totalUnreadCount } = useChat();

  if (!user) return null;

  const navLinks = [
    { 
      name: "Home", 
      href: getDashboardPath(user.role), 
      icon: Home 
    },
    { 
      name: "Projects", 
      href: "/projects", 
      icon: FolderOpen 
    },
    { 
      name: "Messages", 
      href: "/chat", 
      icon: MessageSquare,
      badge: totalUnreadCount
    },
    { 
      name: "Profile", 
      href: "/settings", 
      icon: Settings 
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] glass border-t border-white/10 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
                isActive ? "text-neon-purple" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon size={24} className={isActive ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : ""} />
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-purple text-white text-[8px] flex items-center justify-center rounded-full border border-black">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-60"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

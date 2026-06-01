"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, MessageSquare, Settings } from "lucide-react";
import { useAuth, getDashboardPath } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

export const MobileNav = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const { totalUnreadCount } = useChat();

  if (!user) return null;

  const dashboardPath = getDashboardPath(user.role);

  const navLinks = [
    { 
      name: "Dashboard", 
      href: dashboardPath, 
      icon: LayoutDashboard 
    },
    { 
      name: "Explore", 
      href: "/explore", 
      icon: FolderOpen 
    },
    { 
      name: "Messages", 
      href: "/chat", 
      icon: MessageSquare,
      badge: totalUnreadCount
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings 
    },
  ];

  const isActive = (href: string) => {
    if (href === dashboardPath) return pathname.startsWith("/dashboard");
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] glass border-t border-white/10 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] bg-black/80 backdrop-blur-xl">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
                active ? "text-neon-purple" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon size={20} className={active ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : ""} />
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-neon-purple text-white text-[7px] flex items-center justify-center rounded-full border border-black font-black">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${active ? "opacity-100" : "opacity-60"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

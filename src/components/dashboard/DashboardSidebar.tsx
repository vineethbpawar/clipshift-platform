"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Layers, 
  MessageSquare, 
  Settings, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  Map as MapIcon,
  Heart,
  TrendingUp,
  Briefcase
} from "lucide-react";
import { useAuth, type Role, getDashboardPath } from "@/context/AuthContext";

const SidebarLink = ({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) => (
  <Link href={href}>
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${
        isActive ? "bg-neon-purple/10 text-white shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
      }`}
    >
      <Icon size={18} className={isActive ? "text-neon-purple" : "group-hover:text-gray-300"} />
      <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? "text-white" : ""}`}>
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-8 bg-neon-purple rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
        />
      )}
    </motion.div>
  </Link>
);

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const getLinks = (role: Role) => {
    const dashboardPath = getDashboardPath(role);
    const common = [
      { href: dashboardPath, icon: LayoutDashboard, label: "Overview" },
      { href: "/projects", icon: Layers, label: "Projects" },
      { href: "/chat", icon: MessageSquare, label: "Messages" },
    ];

    if (!role) return common;

    if (role === "client") {
      return [
        ...common,
        { href: "/marketplace", icon: Users, label: "Find Creators" },
        { href: "/dashboard/client/saved", icon: Heart, label: "Saved Talent" },
        { href: "/dashboard/client/analytics", icon: TrendingUp, label: "Spending" },
      ];
    }

    if (role === "creator") {
      return [
        ...common,
        { href: `${dashboardPath}/earnings`, icon: DollarSign, label: "Earnings" },
        { href: `${dashboardPath}/portfolio`, icon: Briefcase, label: "My Portfolio" },
        { href: "/explore", icon: MapIcon, label: "Live Map" },
      ];
    }

    if (role === "admin") {
      return [
        { href: "/dashboard/admin", icon: ShieldCheck, label: "Control Center" },
        { href: "/dashboard/admin/users", icon: Users, label: "User Audit" },
        { href: "/dashboard/admin/revenue", icon: DollarSign, label: "Platform Rev" },
        { href: "/dashboard/admin/moderation", icon: Layers, label: "Moderation" },
      ];
    }

    return common;
  };

  const links = getLinks(role);

  return (
    <div className="w-64 h-[calc(100vh-80px)] flex flex-col bg-black/40 backdrop-blur-md border-r border-white/5 p-6 sticky top-20">
      <div className="flex-1 space-y-2">
        <h3 className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-6 px-4">Menu</h3>
        {links.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            isActive={pathname === link.href}
          />
        ))}
      </div>

      <div className="pt-6 border-t border-white/5 space-y-2">
        <SidebarLink
          href="/settings"
          icon={Settings}
          label="Settings"
          isActive={pathname === "/settings"}
        />
        <div className="px-4 py-8">
          <div className="glass p-4 rounded-2xl border-neon-blue/20 bg-gradient-to-br from-neon-blue/5 to-transparent">
            <h4 className="text-[9px] font-black text-white uppercase tracking-widest mb-2">Platform Health</h4>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">All Nodes Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

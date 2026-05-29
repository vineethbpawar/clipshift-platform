"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Layers, 
  MessageSquare, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Map as MapIcon,
  Plus,
  Send,
  X,
  User,
  LogOut,
  Settings
} from "lucide-react";
import { useAuth, getDashboardPath } from "@/context/AuthContext";

const SidebarLink = ({ href, icon: Icon, label, isActive, onClick }: { href: string, icon: React.ElementType, label: string, isActive: boolean, onClick?: () => void }) => (
  <Link href={href} onClick={onClick}>
    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive ? "bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
      <Icon size={18} className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-neon-purple"} transition-colors`} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {isActive && (
        <motion.div layoutId="active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
      )}
    </div>
  </Link>
);

const DashboardSidebar = ({ onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();

  const dashboardPath = getDashboardPath(role);

  const isActive = (href: string) => {
    if (href === "/dashboard/client" || href === "/dashboard/creator") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const getLinks = () => {
    const common = [
      { href: dashboardPath, icon: LayoutDashboard, label: "Dashboard" },
    ];

    if (role === "client") {
      return [
        ...common,
        { href: "/post-project", icon: Plus, label: "Post Project" },
        { href: "/dashboard/client/active-projects", icon: Briefcase, label: "Active Projects" },
        { href: "/projects", icon: Layers, label: "My Projects" },
        { href: "/dashboard/client/proposals", icon: Send, label: "Proposals" },
        { href: "/chat", icon: MessageSquare, label: "Messages" },
        { href: "/settings", icon: Settings, label: "Settings" },
      ];
    }

    if (role === "creator") {
      return [
        ...common,
        { href: "/dashboard/creator/active-projects", icon: TrendingUp, label: "Active Projects" },
        { href: "/dashboard/creator/proposals", icon: Send, label: "My Proposals" },
        { href: `${dashboardPath}/portfolio`, icon: Briefcase, label: "Portfolio" },
        { href: `${dashboardPath}/earnings`, icon: DollarSign, label: "Earnings" },
        { href: "/projects", icon: Layers, label: "Find Projects" },
        { href: "/chat", icon: MessageSquare, label: "Messages" },
        { href: "/explore", icon: MapIcon, label: "Map" },
        { href: "/settings", icon: Settings, label: "Settings" },
      ];
    }

    return common;
  };

  const links = getLinks();

  return (
    <div className="h-full w-72 glass border-r border-white/5 flex flex-col p-6 bg-black/40 backdrop-blur-2xl">
      <div className="flex items-center justify-between mb-12 px-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-neon-purple flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">CS</div>
          <span className="font-black text-white uppercase tracking-tighter text-2xl group-hover:text-neon-purple transition-colors">ClipShift</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white p-2 glass rounded-xl border-white/10">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
         <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] mb-4 ml-6 italic opacity-50">Navigation</p>
         <nav className="space-y-1">
           {links.map((link) => (
             <SidebarLink 
               key={link.label} 
               {...link} 
               isActive={isActive(link.href)} 
               onClick={onClose}
             />
           ))}
         </nav>
      </div>

      <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
        <div className="p-5 glass rounded-3xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-neon-blue transition-colors">
              <User size={24} className="text-gray-400 group-hover:text-neon-blue transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{user?.name}</p>
              <p className="text-[9px] text-neon-blue font-bold uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full py-3.5 rounded-2xl glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black/40 rounded-full border border-white/5 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">System Online</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;

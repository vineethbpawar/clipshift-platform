"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Layers, 
  MessageSquare, 
  Briefcase, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Map as MapIcon,
  Heart,
  Plus,
  Send,
  X,
  User,
  LogOut
} from "lucide-react";
import { useAuth, type Role, getDashboardPath } from "@/context/AuthContext";

const SidebarLink = ({ href, icon: Icon, label, isActive, onClick }: { href: string, icon: any, label: string, isActive: boolean, onClick?: () => void }) => (
  <Link href={href} onClick={onClick}>
    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive ? "bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
      <Icon size={18} className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-neon-purple"} transition-colors`} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {isActive && (
        <motion.div layoutId="active" className="ml-auto w-1 h-1 rounded-full bg-white" />
      )}
    </div>
  </Link>
);

const DashboardSidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();

  const dashboardPath = getDashboardPath(role);

  const getLinks = () => {
    const common = [
      { href: dashboardPath, icon: LayoutDashboard, label: "Overview" },
    ];

    if (role === "client") {
      return [
        ...common,
        { href: "/post-project", icon: Plus, label: "Post Project" },
        { href: "/dashboard/client/active-projects", icon: Briefcase, label: "Active Projects" },
        { href: "/projects", icon: Layers, label: "My Projects" },
        { href: "/chat", icon: MessageSquare, label: "Messages" },
      ];
    }

    if (role === "creator") {
      return [
        ...common,
        { href: "/dashboard/creator/active-projects", icon: TrendingUp, label: "Active Work" },
        { href: "/dashboard/creator/proposals", icon: Send, label: "My Proposals" },
        { href: `${dashboardPath}/earnings`, icon: DollarSign, label: "Earnings" },
        { href: `${dashboardPath}/portfolio`, icon: Briefcase, label: "My Portfolio" },
        { href: "/explore", icon: MapIcon, label: "Map" },
      ];
    }

    return common;
  };

  const links = getLinks();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed top-0 left-0 bottom-0 w-72 glass border-r border-white/5 z-[70] transition-transform duration-500 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neon-purple flex items-center justify-center font-black text-white text-xs">CS</div>
              <span className="font-black text-white uppercase tracking-tighter text-lg">ClipShift</span>
            </Link>
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-1 mb-8">
             <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] mb-4 ml-4 italic">Navigation</p>
             <nav className="space-y-1">
               {links.map((link) => (
                 <SidebarLink 
                   key={link.label} 
                   {...link} 
                   isActive={pathname === link.href} 
                   onClick={onClose}
                 />
               ))}
             </nav>
          </div>

          <div className="mt-auto space-y-4">
            <div className="p-4 glass rounded-2xl border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <User size={20} className="text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white font-black uppercase tracking-tighter truncate">{user?.name}</p>
                  <p className="text-[8px] text-neon-blue font-bold uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={() => signOut()}
                className="w-full py-3 rounded-xl glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={12} /> Disconnect
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-black/20 rounded-full border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;

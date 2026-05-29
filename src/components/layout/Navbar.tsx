"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ShoppingCart, Search, LogOut, MessageSquare, Loader2, User } from "lucide-react";
import { NeonButton } from "../ui/NeonButton";
import { useAuth, getDashboardPath } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

export const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.8)"]
  );
  const backdropBlur = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  );

  const { totalUnreadCount } = useChat();

  const navLinks = [
    { name: "Explore", href: "/explore" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Projects", href: "/projects" },
    { name: "Pricing", href: "/pricing" },
    { name: "Messages", href: "/chat", badge: totalUnreadCount },
  ];

  const dashboardPath = user ? getDashboardPath(user.role) : "/auth/login";

  return (
    <motion.nav
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-neon-purple flex items-center justify-center font-black text-white text-xs shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform italic">CS</div>
            <span className="font-black text-white uppercase tracking-tighter text-xl group-hover:text-neon-purple transition-colors italic">ClipShift</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-all relative group"
              >
                {link.name}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-purple group-hover:w-full transition-all duration-300" />
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-2 -right-3 w-4 h-4 bg-neon-purple text-white text-[8px] flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center gap-2 border-l border-white/10 ml-4 pl-8 min-w-[150px] justify-end">
              {loading ? (
                <Loader2 className="animate-spin text-gray-600" size={18} />
              ) : user ? (
                <div className="flex items-center gap-5">
                  <Link href={dashboardPath}>
                    <div className="flex flex-col items-end group cursor-pointer">
                      <span className="text-white font-black text-[10px] uppercase tracking-widest group-hover:text-neon-purple transition-colors truncate max-w-[100px] italic">
                        {user.name}
                      </span>
                      <span className="text-[8px] text-neon-blue font-bold uppercase tracking-widest opacity-60">
                        {user.role}
                      </span>
                    </div>
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    className="p-2.5 glass rounded-xl text-gray-500 hover:text-red-500 hover:border-red-500/20 transition-all border border-transparent active:scale-90"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login">
                    <button className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-xl active:scale-95">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {!loading && user && (
               <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Live</span>
               </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2.5 glass rounded-xl border border-white/5 active:scale-90 transition-all"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-24 left-4 right-4 z-50 md:hidden glass p-6 rounded-[40px] border-white/10 shadow-[0_20px_100px_rgba(0,0,0,1)] flex flex-col gap-2 bg-black/80"
            >
              <div className="grid grid-cols-2 gap-3 mb-6">
                {user && (
                  <Link
                    href={dashboardPath}
                    onClick={() => setIsOpen(false)}
                    className="col-span-2 text-neon-purple hover:text-white flex items-center justify-between p-6 glass rounded-3xl gap-2 border-neon-purple/20 transition-all active:scale-95 bg-neon-purple/5"
                  >
                    <div className="flex items-center gap-3">
                       <User size={18} />
                       <span className="text-[10px] font-black uppercase tracking-widest italic">User Dashboard</span>
                    </div>
                    <ChevronRight size={14} />
                  </Link>
                )}
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white flex flex-col items-center justify-center p-6 glass rounded-3xl gap-2 border-white/5 transition-all active:scale-95 bg-white/[0.02]"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                    {link.badge && link.badge > 0 && (
                      <span className="text-[8px] px-2 py-0.5 bg-neon-purple text-white rounded-full">
                        {link.badge} New
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-neon-purple" size={20} />
                  </div>
                ) : user ? (
                  <div className="flex flex-col gap-4">
                    <div className="text-center p-2">
                      <div className="text-sm font-black text-white uppercase tracking-tighter italic">{user.name}</div>
                      <div className="text-[8px] text-neon-blue font-black uppercase tracking-[0.2em] mt-1">{user.role}</div>
                    </div>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full py-5 rounded-2xl glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 active:scale-95 transition-all"
                    >
                      Logout Account
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <button className="w-full text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest py-5 glass rounded-3xl border-white/5">
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <button className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl">
                        Join
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

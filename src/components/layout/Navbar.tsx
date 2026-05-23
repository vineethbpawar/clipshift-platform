"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ShoppingCart, Search, LogOut, MessageSquare } from "lucide-react";
import { NeonButton } from "../ui/NeonButton";
import { useAuth, getDashboardPath } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

export const Navbar = () => {
  const { user, signOut } = useAuth();
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
    { name: "Creators", href: "/marketplace" },
    { name: "Projects", href: "/projects" },
    { name: "Pricing", href: "/pricing" },
    { name: "Messages", href: "/chat", badge: totalUnreadCount },
  ];

  if (user) {
    navLinks.unshift({ name: "Dashboard", href: getDashboardPath(user.role) });
  }

  return (
    <motion.nav
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="ClipShift" width={180} height={60} className="h-8 md:h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-black text-gray-300 hover:text-white uppercase tracking-widest transition-colors relative"
              >
                {link.name}
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-2 -right-3 w-4 h-4 bg-neon-purple text-white text-[8px] flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white p-2">
              <Search size={20} />
            </button>
            <button className="text-gray-300 hover:text-white p-2 relative">
              <ShoppingCart size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-neon-purple" />
            </button>
            
            <div className="flex items-center space-x-2 border-l border-white/10 ml-4 pl-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href={getDashboardPath(user.role)} className="text-white font-bold text-sm uppercase tracking-widest hover:text-neon-purple transition-colors">
                    {user.name}
                  </Link>
                  <button onClick={signOut} className="text-gray-500 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="text-gray-300 hover:text-white text-sm font-bold uppercase tracking-widest px-4 py-2 transition-all hover:scale-105">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <NeonButton variant="purple" size="sm">
                      Join Collective
                    </NeonButton>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {user && (
              <div className="text-[8px] font-black text-neon-purple uppercase tracking-widest px-3 py-1 border border-neon-purple/20 rounded-full">
                Active Node
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 glass rounded-lg"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-24 left-4 right-4 z-50 md:hidden glass p-4 rounded-[32px] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-2"
            >
              <div className="grid grid-cols-2 gap-2 mb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-300 hover:text-white flex flex-col items-center justify-center p-6 glass rounded-2xl gap-2 border-white/5 transition-all active:scale-95"
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

              <div className="space-y-3 pt-4 border-t border-white/5">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="text-center p-2">
                      <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Identified As</div>
                      <div className="text-xs font-bold text-white">{user.name}</div>
                    </div>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full py-4 rounded-2xl glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10"
                    >
                      Disconnect Node
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <button className="w-full text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-widest py-4 glass rounded-2xl border-white/5">
                        Access Node
                      </button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <NeonButton variant="purple" className="w-full py-4 text-[10px]">
                        Join the Collective
                      </NeonButton>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

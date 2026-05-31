"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, LogOut, MessageSquare, Loader2, ChevronRight } from "lucide-react";
import { useAuth, getDashboardPath } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

export const Navbar = () => {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
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

  const isDashboard = pathname.startsWith("/dashboard");
  const dashboardPath = user ? getDashboardPath(user.role) : "/dashboard/client";

  interface NavLink {
    name: string;
    href: string;
    badge?: number;
    icon?: React.ElementType;
  }

  const publicLinks: NavLink[] = [
    { name: "Explore", href: "/explore" },
    { name: "Creators", href: "/marketplace" },
    { name: "Projects", href: "/projects" },
    { name: "Pricing", href: "/pricing" },
  ];

  const authLinks: NavLink[] = [
    { name: "Dashboard", href: dashboardPath },
    ...publicLinks,
  ];

  const navLinks = user ? authLinks : publicLinks;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === dashboardPath) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <Image
              src="/logo.png"
              alt="ClipShift"
              width={140}
              height={40}
              className="h-9 w-auto object-contain brightness-110"
              priority
            />
          </Link>

          {/* Desktop Nav - Only for Public Pages */}
          {!isDashboard && (
            <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${
                    isActive(link.href) ? "text-neon-purple" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.name}
                  <div className={`absolute -bottom-1 left-0 h-0.5 bg-neon-purple transition-all duration-300 ${
                    isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                  }`} />
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-2 -right-3 w-4 h-4 bg-neon-purple text-white text-[8px] flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] border border-black">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Right Section */}
          <div className="hidden md:flex items-center">
            <div className={`flex items-center gap-2 ${!isDashboard ? "border-l border-white/10 ml-4 pl-8" : ""} min-w-[150px] justify-end`}>
              {loading ? (
                <Loader2 className="animate-spin text-gray-600" size={18} />
              ) : user ? (
                <div className="flex items-center gap-6">
                  {/* Dashboard-specific items: Messages */}
                  {isDashboard && (
                    <Link href="/chat" className="relative p-2.5 glass rounded-xl text-gray-400 hover:text-neon-purple transition-all border border-transparent group">
                      <MessageSquare size={18} />
                      {totalUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-purple text-white text-[8px] flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] border border-black font-black">
                          {totalUnreadCount}
                        </span>
                      )}
                    </Link>
                  )}

                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end">
                      <span className="text-white font-black text-[10px] uppercase tracking-widest truncate max-w-[120px] italic">
                        {user.name}
                      </span>
                      <span className="text-[8px] text-neon-blue font-black uppercase tracking-widest opacity-60">
                        {user.role}
                      </span>
                    </div>
                    <button 
                      onClick={() => signOut()} 
                      className="p-2.5 glass rounded-xl text-gray-500 hover:text-red-500 hover:border-red-500/20 transition-all border border-transparent active:scale-90"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
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
                      Join
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            {isDashboard && user && (
               <Link href="/chat" className="relative p-2.5 glass rounded-xl text-gray-400">
                 <MessageSquare size={18} />
                 {totalUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-neon-purple text-white text-[7px] flex items-center justify-center rounded-full border border-black">
                      {totalUnreadCount}
                    </span>
                 )}
               </Link>
            )}
            {!loading && user && !isDashboard && (
               <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Active</span>
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
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-24 left-4 right-4 z-50 md:hidden glass p-6 rounded-[40px] border-white/10 shadow-[0_20px_100px_rgba(0,0,0,1)] flex flex-col gap-2 bg-black/80"
            >
              <div className="grid grid-cols-1 gap-2 mb-4">
                {/* On Dashboard, show dashboard links in mobile menu too? 
                    The rules say "Menu includes dashboard links". 
                    But Dashboard already has its own sidebar. 
                    However, the top navbar menu is what the user clicks.
                */}
                {!isDashboard ? (
                  navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-5 glass rounded-3xl gap-2 transition-all active:scale-95 ${
                        isActive(link.href) ? "bg-neon-purple/10 border-neon-purple/20 text-white" : "bg-white/[0.02] border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest italic">{link.name}</span>
                      <div className="flex items-center gap-2">
                        {link.badge && link.badge > 0 && (
                          <span className="text-[8px] px-2 py-0.5 bg-neon-purple text-white rounded-full">
                            {link.badge}
                          </span>
                        )}
                        <ChevronRight size={14} className={isActive(link.href) ? "text-neon-purple" : "text-gray-700"} />
                      </div>
                    </Link>
                  ))
                ) : (
                  /* Dashboard mobile menu could just be logout and profile since sidebar is drawer */
                  <div className="space-y-2">
                     <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4 ml-4">Account</p>
                     <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 glass rounded-3xl bg-white/[0.02] border-white/5 text-gray-400">
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Settings</span>
                        <ChevronRight size={14} />
                     </Link>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-neon-purple" size={20} />
                  </div>
                ) : user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 glass rounded-[32px] border-white/5">
                       <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple font-black italic">
                          {user.name.charAt(0)}
                       </div>
                       <div>
                          <div className="text-[10px] font-black text-white uppercase tracking-tighter italic truncate max-w-[150px]">{user.name}</div>
                          <div className="text-[8px] text-neon-blue font-black uppercase tracking-[0.2em] mt-0.5">{user.role}</div>
                       </div>
                    </div>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full py-5 rounded-2xl glass border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="flex-1">
                      <button className="w-full text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest py-5 glass rounded-3xl border-white/5">
                        Login
                      </button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)} className="flex-1">
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

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X, ShoppingCart, Search, LogOut, MessageSquare } from "lucide-react";
import { NeonButton } from "../ui/NeonButton";
import { useAuth } from "@/context/AuthContext";
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
    { name: "Marketplace", href: "/marketplace" },
    { name: "Projects", href: "/projects" },
    { name: "Messages", href: "/chat", badge: totalUnreadCount },
  ];

  if (user) {
    navLinks.unshift({ name: "Dashboard", href: `/dashboard/${user.role}` });
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
            <Image src="/logo.png" alt="ClipShift" width={180} height={60} className="h-10 w-auto" />
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
                  <Link href={`/dashboard/${user.role}`} className="text-white font-bold text-sm uppercase tracking-widest hover:text-neon-purple transition-colors">
                    {user.name}
                  </Link>
                  <button onClick={signOut} className="text-gray-500 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="text-gray-300 hover:text-white text-sm font-bold uppercase tracking-widest px-4 py-2">
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

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden glass"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white block px-3 py-4 text-base font-medium border-b border-white/5"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 px-3 space-y-3">
              <Link href="/auth/login" className="block">
                <button className="w-full text-gray-300 hover:text-white text-sm font-bold uppercase tracking-widest px-4 py-4 glass rounded-xl">
                  Login
                </button>
              </Link>
              <Link href="/auth/signup" className="block">
                <NeonButton variant="purple" className="w-full">
                  Join Collective
                </NeonButton>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

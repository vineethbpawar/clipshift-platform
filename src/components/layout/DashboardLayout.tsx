"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardSidebar } from "../dashboard/DashboardSidebar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Menu, X } from "lucide-react";

export const DashboardLayout = ({ 
  children, 
  title 
}: { 
  children: React.ReactNode, 
  title: string 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <PageWrapper>
      <div className="flex pt-20 h-screen overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Wrapper */}
        <div className={`
          fixed md:sticky top-20 z-50 md:z-30 h-[calc(100vh-80px)] transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <DashboardSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <main className="flex-1 p-4 md:p-12 overflow-y-auto custom-scrollbar relative">
          {/* Mobile Header Toggle */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 glass rounded-xl text-neon-purple"
            >
              <Menu size={24} />
            </button>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              ClipShift / Dashboard
            </div>
          </div>

          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-20">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4 break-words">
                {title}
              </h1>
              <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full" />
            </motion.div>
            {children}
          </div>
        </main>
      </div>
    </PageWrapper>
  );
};

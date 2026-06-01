"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "../dashboard/DashboardSidebar";
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
      <div className="min-h-screen bg-black flex flex-col pt-16">
        <div className="flex flex-1 relative">
          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Sidebar Wrapper */}
          <div className={`
            fixed lg:sticky top-16 z-[70] lg:z-30 h-[calc(100vh-64px)] transition-transform duration-300 w-72 shrink-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 relative px-6 lg:px-10 py-8 lg:py-12 pb-32">
            {/* Mobile Header Toggle */}
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 glass rounded-2xl text-neon-purple active:scale-95 transition-transform border border-white/10"
              >
                <Menu size={24} />
              </button>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Dashboard / {title}
              </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8 lg:space-y-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                  {title}
                </h1>
                <div className="w-16 md:w-24 h-1.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full" />
              </motion.div>

              {children}
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

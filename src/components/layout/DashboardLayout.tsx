"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export const DashboardLayout = ({ 
  children, 
  title 
}: { 
  children: React.ReactNode, 
  title: string 
}) => {
  // Use a null or undefined initial state to avoid hydration mismatch
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean | null>(null);

  useEffect(() => {
    // Read from localStorage on mount
    const savedState = localStorage.getItem("clipshift_sidebar_open");
    const isMobile = window.innerWidth < 1024;
    
    if (savedState !== null) {
      setIsSidebarOpen(savedState === "true");
    } else {
      // Default behavior
      setIsSidebarOpen(!isMobile);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("clipshift_sidebar_open", newState ? "true" : "false");
      return newState;
    });
  };

  const handleSidebarLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Prevent flash of incorrect state
  if (isSidebarOpen === null) return null;

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
            fixed lg:sticky top-16 z-[70] lg:z-30 h-[calc(100vh-64px)] transition-all duration-300 shrink-0 overflow-hidden
            ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-0"}
          `}>
            <div className={`h-full transition-opacity duration-300 ${!isSidebarOpen && "lg:opacity-0 lg:pointer-events-none"}`}>
              <DashboardSidebar isOpen={isSidebarOpen} onClose={handleSidebarLinkClick} />
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 relative px-6 lg:px-10 py-8 lg:py-12 pb-32 transition-all duration-300">
            {/* Sidebar Toggle & Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleSidebar}
                  className="p-3 glass rounded-2xl text-neon-purple active:scale-95 transition-transform border border-white/10 hover:bg-white/5"
                  title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                  {isSidebarOpen ? <PanelLeftClose size={20} className="hidden lg:block" /> : <PanelLeftOpen size={20} className="hidden lg:block" />}
                  <Menu size={20} className="lg:hidden" />
                </button>
                <div className="hidden lg:block">
                   <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                    Dashboard / {title}
                  </div>
                </div>
              </div>

              <div className="lg:hidden text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                {title}
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

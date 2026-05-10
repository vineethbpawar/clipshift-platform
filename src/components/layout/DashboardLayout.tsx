"use client";

import React from "react";
import { motion } from "framer-motion";
import { DashboardSidebar } from "../dashboard/DashboardSidebar";
import { PageWrapper } from "@/components/layout/PageWrapper";

export const DashboardLayout = ({ 
  children, 
  title 
}: { 
  children: React.ReactNode, 
  title: string 
}) => {
  return (
    <PageWrapper>
      <div className="flex pt-20 h-screen overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                {title}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full" />
            </motion.div>
            {children}
          </div>
        </main>
      </div>
    </PageWrapper>
  );
};

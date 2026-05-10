"use client";

import React from "react";
import { motion } from "framer-motion";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  return (
    <div className="w-full max-w-md mx-auto mb-12">
      <div className="flex justify-between items-center relative">
        {/* Connection Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-white/10 z-0" />
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-neon-purple z-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: isActive ? "var(--color-neon-purple)" : "rgba(31, 41, 55, 1)",
                  scale: isCurrent ? 1.2 : 1,
                  boxShadow: isCurrent ? "0 0 15px rgba(168,85,247,0.5)" : "none",
                }}
                className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white transition-colors"
              >
                {stepNumber}
              </motion.div>
              <span className="absolute top-10 text-[10px] uppercase tracking-widest text-gray-500 whitespace-nowrap">
                Step {stepNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

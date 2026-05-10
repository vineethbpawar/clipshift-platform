"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface ScoreCircleProps {
  score: number;
  label: string;
  size?: number;
  color?: string;
  delay?: number;
}

export const ScoreCircle = ({ score, label, size = 100, color = "#a855f7", delay = 0 }: ScoreCircleProps) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const spring = useSpring(0, { mass: 1, stiffness: 60, damping: 20 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(score);
    }, delay * 1000 + 500);
    
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [score, spring, delay]);

  const offset = useTransform(spring, (v) => circumference - (v / 100) * circumference);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Track */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          {/* Animated Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_currentColor]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-white tracking-tighter">
            {displayValue}%
          </span>
        </div>
      </div>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
};

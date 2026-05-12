"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Circle, AlertCircle, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Project } from "@/data/projects";
import { sanitizeDescription } from "@/lib/sanitizer";

export const ProjectCard = ({ project }: { project: Project }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(project.deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Deadline Reached");
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`${days}d ${hours}h left`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [project.deadline]);

  return (
    <div
      onClick={() => router.push(`/projects/${project.id}`)}
      className="cursor-pointer glass border-white/5 rounded-[32px] p-8 overflow-hidden group hover:border-purple-500 transition-all duration-500"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-black text-neon-purple uppercase tracking-widest">
              {project.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[10px] font-black text-neon-blue uppercase tracking-widest">
              {project.service_type === 'editing_and_shoot' ? 'Editing + Shoot' : 'Editing Only'}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <Clock size={12} />
              {timeLeft}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
            {project.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-widest">
             <MapPin size={12} /> {project.locations?.[0]?.name || "Remote/Flexible"}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget</div>
          <div className="text-xl font-black text-white">{project.budget}</div>
        </div>
      </div>

      <p className="text-sm text-gray-400 line-clamp-2 mb-6">
        {sanitizeDescription(project.description || "")}
      </p>

      {/* Status Timeline */}
      <div className="mb-10">
        <div className="flex justify-between mb-4 px-2">
          {["Kickoff", "Production", "Review", "Delivery"].map((step, i) => {
            const isCompleted = i < 1; 
            const isCurrent = i === 1;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isCompleted ? "bg-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]" : isCurrent ? "bg-neon-blue animate-pulse" : "bg-white/10"}`} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${isCurrent ? "text-white" : "text-gray-500"}`}>{step}</span>
              </div>
            );
          })}
        </div>
        <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "35%" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-purple to-neon-blue"
          />
        </div>
      </div>
    </div>
  );
};

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
      className="cursor-pointer glass border-white/5 rounded-[32px] p-6 sm:p-8 overflow-hidden group hover:border-purple-500 transition-all duration-500"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
        <div className="w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[9px] font-black text-neon-purple uppercase tracking-widest">
              {project.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[9px] font-black text-neon-blue uppercase tracking-widest">
              {project.service_type === 'editing_and_shoot' ? 'Shoot Required' : 'Edit Only'}
            </span>
            {project.location_mode === 'anywhere_india' ? (
              <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-500 uppercase tracking-widest">
                Anywhere in India
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {project.location_mode === 'preferred_location' ? 'Preferred Location' : 'Shoot Location'}
              </span>
            )}
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <Clock size={10} />
              {timeLeft}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
            {project.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
             <div className="flex items-center gap-1">
               <MapPin size={10} className="text-neon-purple" /> 
               {project.location_mode === 'anywhere_india' ? "Remote (India)" : (project.locations?.[0]?.name || "Flexible")}
             </div>
             {project.location_mode !== 'anywhere_india' && project.shoot_radius_km && (
               <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                 <Circle size={8} className="text-neon-blue fill-neon-blue/20" />
                 Radius: {project.shoot_radius_km}km
               </div>
             )}
          </div>
        </div>

        <div className="w-full sm:w-auto text-left sm:text-right pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget</div>
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

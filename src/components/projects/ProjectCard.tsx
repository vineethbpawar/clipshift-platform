"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Circle, AlertCircle, MapPin, Zap, ExternalLink, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Project } from "@/data/projects";
import { sanitizeDescription } from "@/lib/sanitizer";

export const ProjectCard = ({ project }: { project: any }) => {
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
      <div className="flex flex-col md:flex-row gap-8">
        {/* Project Thumbnail */}
        {project.file_url && project.file_type?.startsWith('image') ? (
          <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden glass border border-white/5 shrink-0">
            <img src={project.file_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
          </div>
        ) : project.file_url ? (
          <div className="w-full md:w-48 h-32 rounded-2xl glass border border-white/5 flex flex-col items-center justify-center gap-2 text-gray-500 shrink-0">
             <Paperclip size={24} />
             <span className="text-[8px] font-black uppercase tracking-widest">Document</span>
          </div>
        ) : null}

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[9px] font-black text-neon-purple uppercase tracking-widest">
                  {project.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[9px] font-black text-neon-blue uppercase tracking-widest">
                  {project.service_type === 'editing_and_shoot' ? 'Shoot & Edit' : 'Edit Only'}
                </span>
                {project.priority_project && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                    <Zap size={10} className="fill-amber-500" />
                    Priority
                  </span>
                )}
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1">
                  <Clock size={10} />
                  {timeLeft}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-2 truncate">
                {project.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                 <div className="flex items-center gap-1">
                   <MapPin size={10} className="text-neon-purple" /> 
                   {project.location_mode === 'anywhere_india' ? "Remote (India)" : (project.location || "Flexible")}
                 </div>
              </div>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget</div>
              <div className="text-xl font-black text-white">₹{project.budget}</div>
            </div>
          </div>

          <p className="text-sm text-gray-400 line-clamp-2 mb-6 uppercase tracking-wider font-medium opacity-60 leading-relaxed">
            {sanitizeDescription(project.description || "")}
          </p>
        </div>
      </div>
    </div>
  );
};

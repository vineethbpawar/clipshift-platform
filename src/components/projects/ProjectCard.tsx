"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Zap, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { sanitizeDescription } from "@/lib/sanitizer";
import { type Project } from "@/data/projects";

export const ProjectCard = ({ project }: { project: Project }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(project.deadline).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Closed");
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
      className="cursor-pointer glass border-white/5 rounded-[40px] p-6 sm:p-8 overflow-hidden group hover:border-neon-purple/50 transition-all duration-500 bg-white/[0.01] hover:bg-white/[0.03]"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Project Thumbnail */}
        <div className="w-full md:w-56 lg:w-64 shrink-0">
          {project.file_url && project.file_type?.startsWith('image') ? (
            <div className="aspect-video md:aspect-square rounded-[32px] overflow-hidden glass border border-white/10 group-hover:scale-[1.02] transition-transform duration-700 shadow-xl">
              <img src={project.file_url} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="aspect-video md:aspect-square rounded-[32px] glass border border-white/5 flex flex-col items-center justify-center gap-3 text-gray-700 bg-white/5">
              <Briefcase size={40} />
              <span className="text-[8px] font-black uppercase tracking-widest">Project Visual</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[9px] font-black text-neon-purple uppercase tracking-widest">
                  {project.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {project.service_type === 'editing_and_shoot' ? 'Shoot & Edit' : 'Edit Only'}
                </span>
                {project.priority_project && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1 shadow-lg">
                    <Zap size={10} className="fill-amber-500" />
                    Priority
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-3 truncate group-hover:text-neon-purple transition-colors italic">
                {project.title}
              </h2>
              <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                 <div className="flex items-center gap-1.5">
                   <MapPin size={12} className="text-neon-blue" /> 
                   {project.location_mode === 'anywhere_india' ? "Remote" : (project.city || "Flexible")}
                 </div>
                 <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                   <Clock size={12} className="text-neon-purple" />
                   {timeLeft}
                 </div>
              </div>
            </div>

            <div className="w-full sm:w-auto text-left sm:text-right pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 opacity-60">Agreed Budget</div>
              <div className="text-2xl font-black text-white italic">₹{project.budget}</div>
            </div>
          </div>

          <p className="text-sm text-gray-400 line-clamp-2 mb-8 uppercase tracking-wider font-medium opacity-60 leading-relaxed max-w-3xl">
            {sanitizeDescription(project.description || "")}
          </p>

          <div className="flex items-center justify-between mt-auto">
             <button className="px-6 py-2.5 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest shadow-xl group-hover:bg-neon-purple group-hover:text-white transition-all">
                View Project Details
             </button>
             <div className="flex -space-x-2 overflow-hidden px-2">
                {[1,2,3].map((i) => (
                  <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-white/5 border border-white/10" />
                ))}
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-neon-purple text-white text-[8px] font-black ring-2 ring-black">+12</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

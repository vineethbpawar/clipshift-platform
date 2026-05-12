"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, Circle, AlertCircle, ChevronRight, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Project } from "@/data/projects";

export const ProjectCard = ({ project }: { project: Project }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const router = useRouter();

  const handleOpenProject = () => {
    console.log("Opening project:", project.id);
    if (!project?.id) {
      console.error("Missing project id");
      return;
    }
    router.push(`/projects/${project.id}`);
  };

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
      onClick={handleOpenProject}
      className="cursor-pointer glass border-white/5 rounded-[32px] p-8 overflow-hidden group hover:border-purple-500 transition-all duration-500"
    >
      <button
        onClick={() => {
          console.log("TEST BUTTON WORKS");
          router.push(`/projects/${project.id}`);
        }}
        className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold uppercase"
      >
        Test Open
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-black text-neon-purple uppercase tracking-widest">
              {project.category}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1">
              <Clock size={12} />
              {timeLeft}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
            {project.title}
          </h2>
          <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-widest">Client: {project.clientName}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget</div>
            <div className="text-xl font-black text-white">{project.budget}</div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-10">
        <div className="flex justify-between mb-4 px-2">
          {["Kickoff", "Production", "Review", "Delivery"].map((step, i) => {
            const isCompleted = i < 1; // Simulated
            const isCurrent = i === 1; // Simulated
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

      {/* Milestones */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.milestones.map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              {m.completed ? (
                <CheckCircle2 size={18} className="text-neon-purple" />
              ) : (
                <Circle size={18} className="text-gray-600" />
              )}
              <div className="flex-1">
                <div className={`text-[10px] font-bold uppercase tracking-widest ${m.completed ? "text-white" : "text-gray-500"}`}>{m.title}</div>
                {m.date && <div className="text-[8px] text-gray-600 font-mono mt-0.5">{m.date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {project.status === "Pending" && (
        <div className="p-6 bg-neon-blue/5 border border-neon-blue/20 rounded-2xl flex items-center gap-4">
          <AlertCircle className="text-neon-blue shrink-0" />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Awaiting creator proposals. {project.proposals?.length || 0} bids received so far.
          </p>
        </div>
      )}
    </div>
  );
};

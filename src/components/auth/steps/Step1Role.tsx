"use client";

import React from "react";
import { RoleCard } from "../RoleCard";
import { useAuth, type Role } from "@/context/AuthContext";
import { motion } from "framer-motion";

export const Step1Role = ({ onNext }: { onNext: () => void }) => {
  const { setRole, role } = useAuth();

  const handleSelect = (r: Role) => {
    setRole(r);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Choose Your Path</h2>
        <p className="text-gray-400">Select the role that best defines your cinematic journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoleCard
          role="client"
          isSelected={role === "client"}
          onSelect={() => handleSelect("client")}
          title="Client"
          description="Looking for premium cinematic assets or to hire top-tier creators for your projects."
        />
        <RoleCard
          role="creator"
          isSelected={role === "creator"}
          onSelect={() => handleSelect("creator")}
          title="Creator"
          description="A visual storyteller and post-production expert capturing footage and crafting narratives."
        />
      </div>

      <div className="flex justify-center mt-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          disabled={!role}
          className="px-12 py-4 rounded-full bg-neon-purple text-white font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
};

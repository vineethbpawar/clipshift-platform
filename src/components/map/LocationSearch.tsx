"use client";

import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export const LocationSearch = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md pointer-events-auto"
    >
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-neon-purple/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
        <div className="relative glass border-white/10 rounded-full flex items-center px-6 py-4">
          <Search className="text-gray-500 mr-3" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, area, or pincode..."
            className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600 font-medium"
          />
          <button
            type="submit"
            className="ml-2 p-2 rounded-full bg-neon-purple/20 text-neon-purple hover:bg-neon-purple hover:text-white transition-all"
          >
            <MapPin size={18} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

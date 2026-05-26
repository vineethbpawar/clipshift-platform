"use client";

import React, { useState } from "react";
import { FloatingInput } from "../../ui/FloatingInput";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

import { Eye, EyeOff } from "lucide-react";

export const Step2Personal = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
  const { signupData, updateSignupData } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [localData, setLocalData] = useState({
    name: signupData.name || "",
    email: signupData.email || "",
    mobile: signupData.mobile || "",
    password: signupData.password || "",
    dob: signupData.dob || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSignupData(localData);
    onNext();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Personal Identity</h2>
        <p className="text-gray-400">Let&apos;s start with the basics of your profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          label="Full Name"
          name="name"
          value={localData.name}
          onChange={handleChange}
          required
        />
        <FloatingInput
          label="Email Address"
          name="email"
          type="email"
          inputMode="email"
          value={localData.email}
          onChange={handleChange}
          required
        />
        <FloatingInput
          label="Mobile Number"
          name="mobile"
          type="tel"
          inputMode="tel"
          value={localData.mobile}
          onChange={handleChange}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <FloatingInput
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={localData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <FloatingInput
            label="Date of Birth"
            name="dob"
            type="date"
            value={localData.dob}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors order-2 sm:order-1"
          >
            Back
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full sm:flex-1 px-12 py-4 rounded-full bg-neon-purple text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)] order-1 sm:order-2"
          >
            Continue
          </motion.button>
        </div>
      </form>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { FloatingInput } from "../../ui/FloatingInput";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Crosshair, Loader2 } from "lucide-react";
import { detectLocation } from "@/lib/geolocation";
import { toast } from "react-hot-toast";

// Dynamic import for Leaflet components to avoid SSR errors
const SignupMap = dynamic(() => import("@/components/map/signup/SignupMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface animate-pulse flex items-center justify-center text-gray-500 uppercase tracking-widest text-xs font-bold">Loading Discovery Map...</div>
});

export const Step3Location = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => {
  const { signupData, updateSignupData } = useAuth();
  const [isDetecting, setIsDetecting] = useState(false);
  const [localData, setLocalData] = useState({
    city: signupData.city || "",
    area: signupData.area || "",
    pincode: signupData.pincode || "",
    address: signupData.address || "",
  });
  
  const [position, setPosition] = useState<[number, number] | null>(
    signupData.lat && signupData.lng ? [signupData.lat, signupData.lng] : [19.0760, 72.8777]
  );

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const data = await detectLocation();
      setLocalData({
        city: data.city || localData.city,
        area: data.area || localData.area,
        pincode: data.pincode || localData.pincode,
        address: data.address || localData.address,
      });
      setPosition([data.lat, data.lng]);
      toast.success("Location detected!");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to detect location");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSignupData({ ...localData, lat: position?.[0], lng: position?.[1] });
    onNext();
  };

  // Fix for Leaflet icon issues in Next.js
  useEffect(() => {
    import("leaflet").then(L => {
      // @ts-expect-error - Internal Leaflet property not in types
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Base of Operations</h2>
        <p className="text-gray-400">Where do you create your magic?</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full mb-6 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl glass border-white/10 text-neon-purple font-bold uppercase tracking-widest text-xs hover:bg-neon-purple/10 hover:border-neon-purple/50 transition-all group shadow-[0_0_20px_rgba(168,85,247,0)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
          >
            {isDetecting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Crosshair size={18} className="group-hover:scale-110 transition-transform" />
            )}
            <span>{isDetecting ? "Detecting..." : "Detect My Location"}</span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label="City"
              name="city"
              value={localData.city}
              onChange={handleChange}
              required
            />
            <FloatingInput
              label="Pincode"
              name="pincode"
              value={localData.pincode}
              onChange={handleChange}
              required
            />
          </div>
          <FloatingInput
            label="Area / Locality"
            name="area"
            value={localData.area}
            onChange={handleChange}
            required
          />
          <FloatingInput
            label="Full Address"
            name="address"
            value={localData.address}
            onChange={handleChange}
            required
          />
          
          <div className="flex items-center justify-between mt-12 gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-4 rounded-full border border-white/10 text-gray-400 font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
            >
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="flex-1 px-12 py-4 rounded-full bg-neon-purple text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              Continue
            </motion.button>
          </div>
        </div>

        <div className="h-[400px] rounded-2xl overflow-hidden glass border-white/10 relative z-0">
          <SignupMap position={position} setPosition={setPosition} />
          <div className="absolute top-4 right-4 z-[1000] glass px-3 py-1 rounded-full text-[10px] text-white uppercase tracking-widest pointer-events-none">
            Click to set pin
          </div>
        </div>
      </form>
    </div>
  );
};

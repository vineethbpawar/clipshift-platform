"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  User, 
  MapPin, 
  Camera, 
  Shield, 
  Bell, 
  Loader2,
  Trash2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { generateCreatorBioAI, suggestCreatorPricingAI } from "@/lib/gemini";
import { Sparkles, DollarSign, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [suggestingPricing, setSuggestingPricing] = useState(false);
  const [pricingSuggestion, setPricingSuggestion] = useState<any>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    instagram: "",
    portfolio: "",
    profileImage: "",
    specialization: "",
    experience: "",
    startingPrice: "",
    chatUnlockFee: ""
  });

  const [locationData, setLocationData] = useState({
    city: "",
    area: "",
    pincode: "",
    address: "",
    lat: 19.0760,
    lng: 72.8777
  });

  const initialized = React.useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user && !initialized.current) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        instagram: user.instagram || "",
        portfolio: user.portfolio || "",
        profileImage: user.profileImage || "",
        specialization: (user as any).specialization || "",
        experience: (user as any).experience || "",
        startingPrice: (user as any).price || "",
        chatUnlockFee: (user as any).chat_unlock_fee || ""
      });

      setLocationData({
        city: user.city || "",
        area: user.area || "",
        pincode: user.pincode || "",
        address: user.address || "",
        lat: user.lat || 19.0760,
        lng: user.lng || 72.8777
      });

      initialized.current = true;
    }
  }, [user, authLoading, router]);

  const handleGenerateBio = async () => {
    setGeneratingBio(true);
    try {
      const result = await generateCreatorBioAI({
        name: profileData.name,
        specialization: profileData.specialization,
        city: locationData.city,
        experience: profileData.experience
      });
      if (result.fallback) {
        setProfileData({ ...profileData, bio: result.fallback.bio });
        toast.success("AI limit reached, using fallback bio.");
      } else if (!result.error) {
        setProfileData({ ...profileData, bio: result.bio });
        toast.success("Bio generated!");
      }
    } catch (e) {
      toast.error("Could not generate bio.");
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleSuggestPricing = async () => {
    setSuggestingPricing(true);
    try {
      const result = await suggestCreatorPricingAI({
        specialization: profileData.specialization,
        experience: profileData.experience,
        location: locationData.city
      });
      if (result.fallback) {
        setPricingSuggestion({ ...result.fallback, isFallback: true });
        toast.success("AI limit reached, showing standard pricing.");
      } else if (!result.error) {
        setPricingSuggestion(result);
        toast.success("Pricing suggestion ready!");
      }
    } catch (e) {
      toast.error("Could not suggest pricing.");
    } finally {
      setSuggestingPricing(false);
    }
  };

  const applyPricing = () => {
    if (!pricingSuggestion) return;
    setProfileData({
      ...profileData,
      startingPrice: pricingSuggestion.startingPrice.toString(),
      chatUnlockFee: pricingSuggestion.chatUnlockFee.toString()
    });
    setPricingSuggestion(null);
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.name,
          bio: profileData.bio,
          instagram: profileData.instagram,
          portfolio_link: profileData.portfolio,
          avatar_url: profileData.profileImage,
          specialization: profileData.specialization,
          experience: profileData.experience,
          price: Number(profileData.startingPrice),
          chat_unlock_fee: Number(profileData.chatUnlockFee)
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          city: locationData.city,
          area: locationData.area,
          pincode: locationData.pincode,
          address: locationData.address
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Location updated successfully!");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="space-y-12">
        <div className="mb-4">
           <p className="text-sm text-gray-400 font-medium max-w-2xl">
             Manage your personal information, security preferences, and marketplace visibility.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           {/* Left: Section Links */}
           <div className="lg:col-span-1 space-y-4 h-fit sticky top-32">
              {[
                { id: 'profile', label: 'Profile Info', icon: User },
                { id: 'location', label: 'Location', icon: MapPin },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'danger', label: 'Danger Zone', icon: Trash2, color: 'text-red-500' }
              ].map((item) => (
                <button 
                  key={item.id}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl glass border border-white/5 transition-all text-left group hover:bg-white/[0.03] ${item.color || 'text-gray-400 hover:text-white'}`}
                >
                   <item.icon size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
           </div>

           {/* Right: Forms */}
           <div className="lg:col-span-2 space-y-10 pb-32">
              
              {/* Profile Section */}
              <div className="glass p-8 sm:p-12 rounded-[50px] border-white/5 bg-white/[0.01] space-y-10">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple border border-neon-purple/20">
                       <User size={18} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Profile Information</h3>
                 </div>

                 <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-white/5">
                    <div className="relative group">
                       <div className="w-32 h-32 rounded-[40px] overflow-hidden glass border-2 border-neon-purple/30 bg-black/40 group-hover:border-neon-purple transition-colors shadow-2xl">
                          <img src={profileData.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                       </div>
                       <button className="absolute -bottom-2 -right-2 p-3 bg-neon-purple text-white rounded-2xl shadow-xl border-4 border-black hover:scale-110 active:scale-95 transition-all">
                          <Camera size={18} />
                       </button>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                       <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-1 italic">{user?.name}</h4>
                       <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Member ID: {user?.id.slice(0, 12)}</p>
                       <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">{user?.role}</span>
                          <span className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[8px] font-black text-neon-blue uppercase tracking-widest">Active</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Full Name</label>
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all italic bg-black/20"
                         value={profileData.name}
                         onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Instagram Handle</label>
                       <div className="relative">
                          <Camera className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                          <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 text-sm text-white outline-none focus:border-neon-purple transition-all italic bg-black/20"
                            placeholder="username"
                            value={profileData.instagram}
                            onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Specialization</label>
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all italic bg-black/20"
                         placeholder="e.g. Cinematic Colorist"
                         value={profileData.specialization}
                         onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Experience</label>
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all italic bg-black/20"
                         placeholder="e.g. 5 Years"
                         value={profileData.experience}
                         onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Professional Bio</label>
                          <button 
                            type="button"
                            onClick={handleGenerateBio}
                            disabled={generatingBio}
                            className="text-[8px] text-neon-purple font-black uppercase tracking-widest flex items-center gap-1 hover:underline disabled:opacity-50"
                          >
                            {generatingBio ? <Loader2 size={8} className="animate-spin" /> : <Sparkles size={8} />}
                            Generate with AI
                          </button>
                       </div>
                       <textarea 
                         className="w-full h-32 bg-white/5 border border-white/10 rounded-[32px] py-6 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all resize-none italic bg-black/20"
                         placeholder="Tell the collective about your vision..."
                         value={profileData.bio}
                         onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                   onClick={handleProfileSave}
                   disabled={loading}
                   className="w-full py-5 bg-white text-black rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-neon-purple hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                 >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : <>Save Profile Changes</>}
                 </button>
              </div>

              {/* Location Section */}
              <div className="glass p-8 sm:p-12 rounded-[50px] border-white/5 bg-white/[0.01] space-y-8">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                       <MapPin size={18} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Base Location</h3>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">City</label>
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-blue transition-all italic bg-black/20"
                         value={locationData.city}
                         onChange={(e) => setLocationData({...locationData, city: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Area / Neighborhood</label>
                       <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-blue transition-all italic bg-black/20"
                         value={locationData.area}
                         onChange={(e) => setLocationData({...locationData, area: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                   onClick={handleLocationSave}
                   disabled={loading}
                   className="w-full py-5 bg-white text-black rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-neon-blue hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : <>Update Location Hub</>}
                 </button>
              </div>

              {/* Pricing Section (Creators Only) */}
              {user?.role === 'creator' && (
                <div className="glass p-8 sm:p-12 rounded-[50px] border-white/5 bg-white/[0.01] space-y-8">
                   <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple border border-neon-purple/20">
                           <DollarSign size={18} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Service Pricing</h3>
                      </div>
                      <button 
                        type="button"
                        onClick={handleSuggestPricing}
                        disabled={suggestingPricing}
                        className="px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[8px] font-black uppercase tracking-widest hover:bg-neon-purple/20 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {suggestingPricing ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                        Suggest Pricing
                      </button>
                   </div>

                   {pricingSuggestion && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-3xl bg-neon-purple/5 border border-neon-purple/20 space-y-4">
                         <div className="flex justify-between items-start">
                            <div>
                               <p className="text-[8px] text-neon-purple font-black uppercase tracking-widest mb-1">{pricingSuggestion.isFallback ? "Est. Pricing" : "AI Suggested Pricing"}</p>
                               <h4 className="text-xl font-black text-white italic">₹{pricingSuggestion.startingPrice}<span className="text-[10px] text-gray-500 ml-2">Starting</span></h4>
                            </div>
                            <div className="text-right">
                               <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Chat Unlock</p>
                               <p className="text-xs font-bold text-white uppercase">₹{pricingSuggestion.chatUnlockFee}</p>
                            </div>
                         </div>
                         <p className="text-[10px] text-gray-400 font-medium italic opacity-70">&quot;{pricingSuggestion.pricingNote}&quot;</p>
                         <button type="button" onClick={applyPricing} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all mt-2">Apply Suggestion</button>
                      </motion.div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Starting Price (₹)</label>
                         <input 
                           type="number" 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all italic bg-black/20"
                           placeholder="999"
                           value={profileData.startingPrice}
                           onChange={(e) => setProfileData({...profileData, startingPrice: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-4 opacity-60">Chat Unlock Fee (₹)</label>
                         <input 
                           type="number" 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-sm text-white outline-none focus:border-neon-purple transition-all italic bg-black/20"
                           placeholder="49"
                           value={profileData.chatUnlockFee}
                           onChange={(e) => setProfileData({...profileData, chatUnlockFee: e.target.value})}
                         />
                      </div>
                   </div>
                </div>
              )}

           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

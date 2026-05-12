"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Settings as SettingsIcon, 
  Camera, 
  Globe, 
  Trash2, 
  Lock,
  Loader2,
  CheckCircle2,
  AtSign
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CreatorCategory } from "@/data/creators";

const SignupMap = dynamic(() => import("@/components/map/signup/SignupMap"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl" />
});

const CATEGORIES: CreatorCategory[] = [
  "Wedding", "Pre-Wedding", "Cinematic Reels", "YouTube", 
  "Commercial Ads", "Drone", "Event Coverage", "Fashion", 
  "Music Video", "Podcast", "Gaming", "Corporate Production"
];

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "location" | "creator" | "account">("profile");

  // Profile State
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    instagram: "",
    portfolio: "",
    profileImage: ""
  });

  // Location State
  const [locationData, setLocationData] = useState({
    city: "",
    area: "",
    pincode: "",
    address: "",
    lat: 0,
    lng: 0
  });

  // Creator State
  const [creatorData, setCreatorData] = useState({
    availability: "Available" as "Available" | "Busy" | "Away",
    categories: [] as string[],
    startingPrice: "",
    deliverySpeed: ""
  });

  // Account State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        instagram: user.instagram || "",
        portfolio: user.portfolio || "",
        profileImage: user.profileImage || ""
      });

      setLocationData({
        city: user.city || "",
        area: user.area || "",
        pincode: user.pincode || "",
        address: user.address || "",
        lat: user.lat || 19.0760, // Default to Mumbai if not set
        lng: user.lng || 72.8777
      });

      // Fetch creator data if applicable
      if (user.role === "editor" || user.role === "videographer") {
        fetchCreatorData();
      }
    }
  }, [user, authLoading]);

  const fetchCreatorData = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (data) {
        setCreatorData({
          availability: data.availability || "Available",
          categories: data.specialty || [],
          startingPrice: data.price || "",
          deliverySpeed: data.delivery || ""
        });
      }
    } catch (err) {
      console.error("Error fetching creator data:", err);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.name,
          bio: profileData.bio,
          instagram: profileData.instagram,
          portfolio_link: profileData.portfolio,
          avatar_url: profileData.profileImage
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          city: locationData.city,
          area: locationData.area,
          pincode: locationData.pincode,
          address: locationData.address,
          lat: locationData.lat,
          lng: locationData.lng
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Location updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatorSave = async () => {
    setLoading(true);
    try {
      // Check if creator record exists
      const { data: existing } = await supabase
        .from("creators")
        .select("id")
        .eq("id", user?.id)
        .single();

      const creatorPayload = {
        availability: creatorData.availability,
        specialty: creatorData.categories,
        price: creatorData.startingPrice,
        delivery: creatorData.deliverySpeed
      };

      if (existing) {
        const { error } = await supabase
          .from("creators")
          .update(creatorPayload)
          .eq("id", user?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("creators")
          .insert({ id: user?.id, ...creatorPayload });
        if (error) throw error;
      }

      toast.success("Creator settings updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      toast.success("Password updated successfully");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // In a real app, you'd call a function or use a service role to delete
      // Since we can't delete user from client easily, we might just sign out or mark for deletion
      const { error } = await supabase.from("profiles").delete().eq("id", user?.id);
      if (error) throw error;
      
      await signOut();
      router.push("/");
      toast.success("Account deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setProfileData(prev => ({ ...prev, profileImage: publicUrl }));
      toast.success("Profile image uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-purple" size={48} />
      </div>
    );
  }

  const isCreator = user?.role === "editor" || user?.role === "videographer";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "location", label: "Location", icon: MapPin },
    ...(isCreator ? [{ id: "creator", label: "Creator", icon: Briefcase }] : []),
    { id: "account", label: "Account", icon: SettingsIcon },
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen pt-32 pb-20 px-4">
        {/* Background Decorative Elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-blue/5 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 space-y-2">
              <h1 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter">Settings</h1>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id 
                        ? "bg-neon-purple/20 text-white border border-neon-purple/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={20} className={activeTab === tab.id ? "text-neon-purple" : ""} />
                    <span className="font-bold uppercase tracking-wider text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Profile Settings */}
                  {activeTab === "profile" && (
                    <GlassCard className="p-8">
                      <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center">
                        <User className="mr-3 text-neon-purple" size={24} />
                        Profile Settings
                      </h2>

                      <div className="flex flex-col md:flex-row gap-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-neon-purple transition-colors bg-white/5">
                              {profileData.profileImage ? (
                                <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                  <Camera size={40} />
                                </div>
                              )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                              <Camera className="text-white" size={24} />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Change Avatar</p>
                        </div>

                        <div className="flex-1 space-y-4">
                          <FloatingInput 
                            label="Full Name" 
                            value={profileData.name} 
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          />
                          <div className="relative w-full mb-6">
                            <div className="glass border-white/5 bg-white/[0.02] rounded-xl px-4 py-3">
                              <label className="text-xs text-gray-500 font-medium block mb-1">Email Address (Read-only)</label>
                              <div className="text-gray-400 font-medium">{user?.email}</div>
                            </div>
                          </div>
                          <div className="relative w-full mb-6">
                            <div className="glass border-white/10 rounded-xl p-4 focus-within:border-neon-purple transition-all">
                              <label className="text-xs text-gray-500 font-medium block mb-2">Bio</label>
                              <textarea 
                                className="w-full bg-transparent text-white outline-none min-h-[100px] resize-none"
                                placeholder="Tell us about your cinematic vision..."
                                value={profileData.bio}
                                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                              <input 
                                className="w-full glass border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-neon-purple transition-all"
                                placeholder="Instagram Handle"
                                value={profileData.instagram}
                                onChange={(e) => setProfileData({...profileData, instagram: e.target.value})}
                              />
                            </div>
                            <div className="relative">
                              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                              <input 
                                className="w-full glass border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-neon-purple transition-all"
                                placeholder="Portfolio Link"
                                value={profileData.portfolio}
                                onChange={(e) => setProfileData({...profileData, portfolio: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="pt-8">
                            <NeonButton 
                              variant="purple" 
                              className="w-full" 
                              onClick={handleProfileSave}
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Update Profile"}
                            </NeonButton>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {/* Location Settings */}
                  {activeTab === "location" && (
                    <GlassCard className="p-8">
                      <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center">
                        <MapPin className="mr-3 text-neon-blue" size={24} />
                        Location Settings
                      </h2>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FloatingInput 
                              label="City" 
                              value={locationData.city}
                              onChange={(e) => setLocationData({...locationData, city: e.target.value})}
                            />
                            <FloatingInput 
                              label="Area" 
                              value={locationData.area}
                              onChange={(e) => setLocationData({...locationData, area: e.target.value})}
                            />
                          </div>
                          <FloatingInput 
                            label="Pincode" 
                            value={locationData.pincode}
                            onChange={(e) => setLocationData({...locationData, pincode: e.target.value})}
                          />
                          <div className="glass border-white/10 rounded-xl p-4 focus-within:border-neon-blue transition-all">
                            <label className="text-xs text-gray-500 font-medium block mb-2">Full Address</label>
                            <textarea 
                              className="w-full bg-transparent text-white outline-none min-h-[100px] resize-none"
                              placeholder="Your full studio or home address..."
                              value={locationData.address}
                              onChange={(e) => setLocationData({...locationData, address: e.target.value})}
                            />
                          </div>
                          
                          <div className="pt-4">
                            <NeonButton 
                              variant="blue" 
                              className="w-full" 
                              onClick={handleLocationSave}
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Update Location"}
                            </NeonButton>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="h-[400px] rounded-3xl overflow-hidden border border-white/10">
                            <SignupMap 
                              position={[locationData.lat, locationData.lng]} 
                              setPosition={(pos: [number, number]) => setLocationData({...locationData, lat: pos[0], lng: pos[1]})} 
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center uppercase font-bold tracking-widest">
                            Drag to refine your location pin
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {/* Creator Settings */}
                  {activeTab === "creator" && isCreator && (
                    <GlassCard className="p-8">
                      <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center">
                        <Briefcase className="mr-3 text-neon-purple" size={24} />
                        Creator Settings
                      </h2>

                      <div className="space-y-8">
                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-widest block mb-4">Availability Status</label>
                          <div className="flex gap-4">
                            {["Available", "Busy", "Away"].map((status) => (
                              <button
                                key={status}
                                onClick={() => setCreatorData({...creatorData, availability: status as any})}
                                className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-300 font-bold uppercase tracking-wider text-xs ${
                                  creatorData.availability === status
                                    ? "bg-neon-purple/20 border-neon-purple text-white"
                                    : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-widest block mb-4">Categories & Specialties</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                onClick={() => {
                                  const cats = creatorData.categories.includes(cat)
                                    ? creatorData.categories.filter(c => c !== cat)
                                    : [...creatorData.categories, cat];
                                  setCreatorData({...creatorData, categories: cats});
                                }}
                                className={`py-3 px-2 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all ${
                                  creatorData.categories.includes(cat)
                                    ? "bg-neon-purple/20 border-neon-purple text-white"
                                    : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <FloatingInput 
                            label="Starting Price (₹)" 
                            value={creatorData.startingPrice}
                            onChange={(e) => setCreatorData({...creatorData, startingPrice: e.target.value})}
                          />
                          <FloatingInput 
                            label="Avg. Delivery Speed" 
                            placeholder="e.g. 3-5 Days"
                            value={creatorData.deliverySpeed}
                            onChange={(e) => setCreatorData({...creatorData, deliverySpeed: e.target.value})}
                          />
                        </div>

                        <div className="pt-4">
                          <NeonButton 
                            variant="purple" 
                            className="w-full" 
                            onClick={handleCreatorSave}
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Update Creator Profile"}
                          </NeonButton>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {/* Account Settings */}
                  {activeTab === "account" && (
                    <div className="space-y-8">
                      <GlassCard className="p-8">
                        <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest flex items-center">
                          <Lock className="mr-3 text-neon-blue" size={24} />
                          Security Settings
                        </h2>
                        
                        <div className="space-y-4 max-w-md">
                          <FloatingInput 
                            label="Old Password" 
                            type="password" 
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                          />
                          <FloatingInput 
                            label="New Password" 
                            type="password" 
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          />
                          <FloatingInput 
                            label="Confirm New Password" 
                            type="password" 
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          />
                          
                          <div className="pt-4">
                            <NeonButton 
                              variant="blue" 
                              className="w-full" 
                              onClick={handleChangePassword}
                              disabled={loading}
                            >
                              {loading ? "Updating..." : "Change Password"}
                            </NeonButton>
                          </div>
                        </div>
                      </GlassCard>

                      <GlassCard className="p-8 border-red-500/20">
                        <h2 className="text-xl font-black text-white mb-4 uppercase tracking-widest flex items-center text-red-500">
                          <Trash2 className="mr-3" size={24} />
                          Danger Zone
                        </h2>
                        <p className="text-gray-400 text-sm mb-8">
                          Deleting your account is permanent. All your data, portfolio, and messages will be removed.
                        </p>
                        
                        <button 
                          onClick={() => setShowDeleteModal(true)}
                          className="px-8 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all"
                        >
                          Delete Account Permanent
                        </button>
                      </GlassCard>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative glass max-w-md w-full p-8 border-red-500/20 rounded-3xl text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-white uppercase mb-2">Final Confirmation</h3>
              <p className="text-gray-400 mb-8">
                Are you absolutely sure you want to delete your ClipShift account? This action cannot be undone.
              </p>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-4 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.3)]"
                >
                  Yes, Delete Everything
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-4 rounded-xl glass border-white/10 text-white font-bold uppercase tracking-widest text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type Role = "client" | "editor" | "videographer" | "admin" | null;

export const getDashboardPath = (role: Role) => {
  switch (role) {
    case "admin": return "/dashboard/admin";
    case "editor": return "/dashboard/editor";
    case "videographer": return "/dashboard/videographer";
    case "client": return "/dashboard/client";
    default: return "/dashboard/client";
  }
};

interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  mobile?: string;
  city?: string;
  area?: string;
  pincode?: string;
  address?: string;
  instagram?: string;
  portfolio?: string;
  languages?: string;
  bio?: string;
  profileImage?: string;
  password?: string;
  dob?: string;
  lat?: number;
  lng?: number;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  signupData: Partial<User>;
  unlockedCreators: string[];
  setRole: (role: Role) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSignupData: (data: Partial<User>) => void;
  unlockCreator: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [signupData, setSignupData] = useState<any>({});
  const [unlockedCreators, setUnlockedCreators] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUnlocks = async (userId: string) => {
      const { data } = await supabase
        .from('unlocked_chats')
        .select('creator_id')
        .eq('client_id', userId);
      
      if (data) {
        setUnlockedCreators(data.map(u => u.creator_id));
      }
    };

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleUserSession(session.user);
        await fetchUnlocks(session.user.id);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await handleUserSession(session.user);
        await fetchUnlocks(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setUnlockedCreators([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (supabaseUser: any) => {
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    if (!profile) {
      console.log("Profile not found, creating default profile");
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
          email: supabaseUser.email,
          role: role || "client",
        })
        .select()
        .maybeSingle();
      
      if (!error && newProfile) {
        profile = newProfile;
      }
    }

    if (profile) {
      const userData: User = {
        id: supabaseUser.id,
        role: profile.role || "client",
        name: profile.full_name,
        email: profile.email,
        mobile: profile.mobile,
        city: profile.city,
        area: profile.area,
        pincode: profile.pincode,
        address: profile.address,
        instagram: profile.instagram,
        portfolio: profile.portfolio_link,
        languages: profile.languages,
        bio: profile.bio,
        profileImage: profile.avatar_url
      };
      setUser(userData);
      setRole(profile.role || "client");
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
        
      const userRole = profile?.role || "client";
      router.push(getDashboardPath(userRole));
    }
  };

  const signUp = async (password: string) => {
    const targetRole = role || "client";
    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password,
      options: {
        data: {
          full_name: signupData.name,
          role: targetRole,
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Save profile details to profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          full_name: signupData.name,
          email: signupData.email,
          role: targetRole,
          mobile: signupData.mobile,
          city: signupData.city,
          area: signupData.area,
          pincode: signupData.pincode,
          address: signupData.address,
          instagram: signupData.instagram,
          portfolio_link: signupData.portfolio,
          languages: signupData.languages,
          bio: signupData.bio,
          avatar_url: signupData.profileImage
        });

      if (profileError && profileError.code !== "23505") throw profileError;
      
      router.push(getDashboardPath(targetRole));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setUnlockedCreators([]);
    localStorage.removeItem("clipshift_unlocks");
    router.push("/");
  };

  const updateSignupData = (data: any) => {
    setSignupData((prev: any) => ({ ...prev, ...data }));
  };

  const unlockCreator = (id: string) => {
    const newUnlocks = [...unlockedCreators, id];
    setUnlockedCreators(newUnlocks);
    localStorage.setItem("clipshift_unlocks", JSON.stringify(newUnlocks));
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, role, loading, setRole, signupData, unlockedCreators, 
        signIn, signUp, signOut, updateSignupData, unlockCreator 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

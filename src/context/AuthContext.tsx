"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getActivePlan, type PlanType } from "@/lib/plans";

export type Role = "client" | "creator" | "admin" | null;

export const getDashboardPath = (role: Role) => {
  switch (role) {
    case "admin": return "/dashboard/admin";
    case "creator": return "/dashboard/creator";
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
  specialization?: string;
  plan_type?: PlanType;
  plan_expires_at?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  activePlan: PlanType;
  loading: boolean;
  signupData: Partial<User>;
  unlockedCreators: string[];
  setRole: (role: Role) => void;
  signIn: (email: string, password: string) => Promise<{ user: any; role: Role }>;
  signUp: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSignupData: (data: Partial<User>) => void;
  unlockCreator: (id: string) => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [activePlan, setActivePlan] = useState<PlanType>("free");
  const [loading, setLoading] = useState(true);
  const [signupData, setSignupData] = useState<any>({});
  const [unlockedCreators, setUnlockedCreators] = useState<string[]>([]);
  const router = useRouter();

  const handleUserSession = async (supabaseUser: { id: string }) => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Profile fetch error:", fetchError);
        return;
      }

      if (!profile) {
        console.warn("Profile not found for user", supabaseUser.id);
        setUser(null);
        setRole(null);
        return;
      }

      const userData: User = {
        id: supabaseUser.id,
        role: profile.role as Role,
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
        profileImage: profile.avatar_url,
        specialization: profile.specialization
      };
      setUser(userData);
      setRole(profile.role as Role);
    } catch (err) {
      console.error("Session handling failed:", err);
    }
  };

  const fetchUnlocks = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('creator_unlocks')
        .select('creator_id')
        .eq('client_id', userId);
      
      if (data) {
        setUnlockedCreators(data.map(u => u.creator_id));
      }
    } catch (err) {
      console.error("Error fetching unlocks:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        setLoading(true);
        console.log("AUTH INIT: GETTING SESSION...");

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("GET SESSION ERROR:", error);
        }

        const session = data?.session;

        if (!session?.user) {
          console.log("AUTH INIT: NO SESSION USER");
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
          return;
        }

        console.log("AUTH INIT: FETCHING PROFILE FOR", session.user.id);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("PROFILE SESSION FETCH ERROR:", profileError);
        }

        if (!mounted) return;

        if (profile) {
          const userData: User = {
            id: session.user.id,
            role: profile.role as Role,
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
            profileImage: profile.avatar_url,
            specialization: profile.specialization,
            plan_type: profile.plan_type,
            plan_expires_at: profile.plan_expires_at
          };
          setUser(userData);
          setRole(profile.role as Role);
          setActivePlan(getActivePlan(profile));
          await fetchUnlocks(session.user.id);
        } else {
          console.warn("PROFILE NOT FOUND IN DB");
          // Optionally set user basic data from auth session
          setRole(null);
        }
      } catch (error) {
        console.error("AUTH INIT ERROR:", error);
        if (mounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AUTH STATE CHANGE:", event);
      try {
        if (!session?.user) {
          setUser(null);
          setRole(null);
          setActivePlan("free");
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (mounted) {
          if (profile) {
            const userData: User = {
              id: session.user.id,
              role: profile.role as Role,
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
              profileImage: profile.avatar_url,
              specialization: profile.specialization,
              plan_type: profile.plan_type,
              plan_expires_at: profile.plan_expires_at
            };
            setUser(userData);
            setRole(profile.role as Role);
            setActivePlan(getActivePlan(profile));
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("AUTH STATE CHANGE ERROR:", error);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      throw error;
    }

    const authUser = data.user;

    if (!authUser) {
      throw new Error("No user returned from Supabase.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw profileError;
    }

    if (!profile) {
      throw new Error("Profile not found. Please signup again.");
    }

    const userData: User = {
      id: authUser.id,
      role: (profile.role as Role) || "client",
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
      profileImage: profile.avatar_url,
      specialization: profile.specialization
    };

    setUser(userData);
    setRole(profile.role as Role);

    return {
      user: authUser,
      profile,
      role: profile.role as Role,
    };
  };

  const signUp = async (password: string) => {
    try {
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

      if (error) {
        console.error("Supabase signup error:", error);
        throw error;
      }

      if (data.user) {
        // Save profile details to profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
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
            avatar_url: signupData.profileImage,
            specialization: signupData.specialization
            }, { onConflict: 'id' });
        if (profileError && profileError.code !== "23505") {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }
        
        router.push(getDashboardPath(targetRole));
      }
    } catch (error) {
      console.error("Signup process failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setUnlockedCreators([]);
      localStorage.removeItem("clipshift_unlocks");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateSignupData = (data: any) => {
    setSignupData((prev: any) => ({ ...prev, ...data }));
  };

  const unlockCreator = (id: string) => {
    const newUnlocks = [...unlockedCreators, id];
    setUnlockedCreators(newUnlocks);
    localStorage.setItem("clipshift_unlocks", JSON.stringify(newUnlocks));
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, role, activePlan, loading, setRole, signupData, unlockedCreators, 
        signIn, signUp, signOut, updateSignupData, unlockCreator,
        resetPassword, updatePassword
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

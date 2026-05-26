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

  const [authError, setAuthError] = useState<string | null>(null);

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
      console.log("AUTH INIT START");
      try {
        setLoading(true);
        setAuthError(null);

        let session = null;
        let source = "none";

        // 1. Try Supabase SDK
        const { data: { session: sdkSession } } = await supabase.auth.getSession();
        if (sdkSession) {
          session = sdkSession;
          source = "sdk";
        }

        // 2. Try Supabase expected localStorage key
        if (!session) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
          const storageKey = `sb-${projectRef}-auth-token`;
          const rawSession = localStorage.getItem(storageKey);
          if (rawSession) {
            try {
              session = JSON.parse(rawSession);
              source = "storage_key";
            } catch (e) { console.error("Failed to parse local storage session", e); }
          }
        }

        // 3. Try clipshift_session backup
        if (!session) {
          const backupSession = localStorage.getItem("clipshift_session");
          if (backupSession) {
            try {
              session = JSON.parse(backupSession);
              source = "backup_key";
            } catch (e) { console.error("Failed to parse backup session", e); }
          }
        }

        console.log("AUTH SESSION SOURCE", source);

        if (!session?.user) {
          console.log("AUTH INIT: No session found");
          if (mounted) {
            setUser(null);
            setRole(null);
          }
          return;
        }

        const userId = session.user.id;
        console.log("AUTH USER ID", userId);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error("AUTH PROFILE FETCH ERROR", profileError);
          setAuthError("Failed to load profile data.");
        }

        if (mounted) {
          if (profile) {
            console.log("AUTH PROFILE", profile);
            const userRole = profile.role as Role;
            console.log("AUTH ROLE", userRole);

            setUser({
              id: userId,
              role: userRole,
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
            });
            setRole(userRole);
            setActivePlan(getActivePlan(profile));
            fetchUnlocks(userId);
          } else {
            console.warn("AUTH INIT: Profile not found for", userId);
            setAuthError("Profile not found.");
            setUser(null);
            setRole(null);
          }
        }
      } catch (error) {
        console.error("AUTH INIT ERROR:", error);
        setAuthError("An unexpected error occurred during sync.");
      } finally {
        if (mounted) {
          setLoading(false);
          console.log("AUTH INIT DONE");
        }
      }
    }

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AUTH STATE CHANGE:", event);
      try {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          setActivePlan("free");
          setUnlockedCreators([]);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (mounted && profile) {
            const userRole = profile.role as Role;
            const userData: User = {
              id: session.user.id,
              role: userRole,
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
            setRole(userRole);
            setActivePlan(getActivePlan(profile));
            if (event === 'SIGNED_IN') fetchUnlocks(session.user.id);
          }
        }
        if (mounted) setLoading(false);
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
      throw new Error("Profile not found. Please signup again or contact support.");
    }

    const validRoles = ["client", "creator", "admin"];
    if (!validRoles.includes(profile.role)) {
      throw new Error("Invalid account role. Please contact support.");
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
    console.log("AUTH SIGNOUT START");
    try {
      await supabase.auth.signOut();
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
      const storageKey = `sb-${projectRef}-auth-token`;
      
      localStorage.removeItem(storageKey);
      localStorage.removeItem("clipshift_session");
      localStorage.removeItem("clipshift_unlocks");
      
      setUser(null);
      setRole(null);
      setUnlockedCreators([]);
      console.log("AUTH SIGNOUT SUCCESS");
      window.location.replace("/auth/login");
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

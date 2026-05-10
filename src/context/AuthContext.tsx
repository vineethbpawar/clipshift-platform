"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Role = "client" | "editor" | "videographer" | null;

interface User {
  role: Role;
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  dob?: string;
  city?: string;
  area?: string;
  pincode?: string;
  address?: string;
  lat?: number;
  lng?: number;
  instagram?: string;
  portfolio?: string;
  languages?: string;
  bio?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  signupData: Partial<User>;
  unlockedCreators: string[];
  setRole: (role: Role) => void;
  login: (email: string, role: Role) => void;
  logout: () => void;
  updateSignupData: (data: Partial<User>) => void;
  unlockCreator: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [signupData, setSignupData] = useState<any>({});
  const [unlockedCreators, setUnlockedCreators] = useState<string[]>([]);
  const router = useRouter();

  // Persist session in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("clipshift_user");
    const savedUnlocks = localStorage.getItem("clipshift_unlocks");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setRole(parsedUser.role);
    }
    if (savedUnlocks) {
      setUnlockedCreators(JSON.parse(savedUnlocks));
    }
  }, []);

  const login = (email: string, selectedRole: Role) => {
    const newUser = { email, role: selectedRole, name: signupData.name || "User" };
    setUser(newUser);
    setRole(selectedRole);
    localStorage.setItem("clipshift_user", JSON.stringify(newUser));
    router.push(`/dashboard/${selectedRole}`);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setUnlockedCreators([]);
    localStorage.removeItem("clipshift_user");
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
        user, role, setRole, signupData, unlockedCreators, 
        login, logout, updateSignupData, unlockCreator 
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

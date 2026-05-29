"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { Search, Mail, MapPin, Trash2, Loader2 } from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
  city?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*').limit(20);
      if (data) setUsers(data as UserProfile[]);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout title="User Management">
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
             <p className="text-sm text-gray-400 font-medium max-w-2xl">
               Browse and manage global user accounts, verified creators, and client identities.
             </p>
             <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name or email..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-xs text-white outline-none focus:border-neon-blue transition-all italic shadow-inner"
                />
             </div>
          </div>

          <div className="glass rounded-[40px] border-white/5 overflow-hidden bg-white/[0.01]">
             <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                         <th className="px-8 py-6 text-left text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">User Profile</th>
                         <th className="px-8 py-6 text-left text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Account Type</th>
                         <th className="px-8 py-6 text-left text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Location</th>
                         <th className="px-8 py-6 text-right text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {loading ? (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center">
                              <Loader2 className="animate-spin text-neon-blue mx-auto mb-4" size={32} />
                              <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Fetching Accounts</span>
                           </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center">
                              <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No Accounts Found</span>
                           </td>
                        </tr>
                      ) : users.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl overflow-hidden glass border border-white/10 shrink-0">
                                    <img src={u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-sm font-black text-white uppercase tracking-tighter truncate italic">{u.full_name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold truncate">{u.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${u.role === 'creator' ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/20' : 'bg-neon-blue/10 text-neon-blue border-neon-blue/20'}`}>
                                 {u.role}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                 <MapPin size={12} className="text-gray-600" />
                                 {u.city || "Remote"}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2.5 rounded-xl glass border border-white/10 text-gray-400 hover:text-white transition-all"><Mail size={14} /></button>
                                 <button className="p-2.5 rounded-xl glass border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

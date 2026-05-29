"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PortfolioUpload } from "@/components/dashboard/PortfolioUpload";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Trash2, ExternalLink, Film, Image as ImageIcon, Music, Grid, List, Briefcase } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  url: string;
  thumbnail_url?: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export default function CreatorPortfolioPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchPortfolio = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('creator_portfolio')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data as PortfolioItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      Promise.resolve().then(() => fetchPortfolio());
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item from your portfolio?")) return;
    try {
      const { error } = await supabase
        .from('creator_portfolio')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Item removed");
      setItems(prev => prev.filter((i: PortfolioItem) => i.id !== id));
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="Your Portfolio">
        <div className="space-y-12">
          {/* Header Description */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4">
             <p className="text-sm text-gray-400 font-medium max-w-2xl">
               Manage your professional showcase. High-quality uploads are automatically indexed for marketplace discovery.
             </p>
             <div className="flex items-center gap-2 p-1.5 glass rounded-2xl border border-white/5 bg-black/40">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-neon-purple text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-neon-purple text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  <List size={18} />
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Upload Section */}
            <div className="lg:col-span-1 h-fit sticky top-32">
               <PortfolioUpload />
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
               {loading ? (
                 <div className="py-20 flex flex-col items-center gap-4">
                   <Loader2 className="animate-spin text-neon-purple" size={32} />
                   <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Loading Items</span>
                 </div>
               ) : items.length === 0 ? (
                 <div className="py-24 text-center glass rounded-[40px] border-white/5 bg-white/[0.01]">
                    <Briefcase size={40} className="mx-auto text-gray-800 mb-4 opacity-30" />
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest italic opacity-60">Your showcase is empty</p>
                 </div>
               ) : viewMode === 'grid' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group aspect-square glass rounded-[32px] border-white/5 overflow-hidden relative bg-black/40"
                        >
                           <img src={item.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                              <h4 className="text-xs font-black text-white uppercase truncate mb-4">{item.title}</h4>
                              <div className="flex gap-2">
                                 <a href={item.url} target="_blank" className="flex-1 py-2 rounded-xl bg-white text-black text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neon-purple hover:text-white transition-all">
                                    <ExternalLink size={12} /> View
                                 </a>
                                 <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl glass border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 size={12} />
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 glass rounded-2xl border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden glass border border-white/10 shrink-0">
                               <img src={item.url} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0">
                               <h4 className="text-[11px] font-black text-white uppercase truncate">{item.title}</h4>
                               <p className="text-[8px] text-gray-500 uppercase font-bold mt-1">{(item.file_size / 1024 / 1024).toFixed(1)} MB • {item.file_type.split('/')[1].toUpperCase()}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a href={item.url} target="_blank" className="p-2 text-gray-500 hover:text-white transition-colors"><ExternalLink size={14} /></a>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500/60 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

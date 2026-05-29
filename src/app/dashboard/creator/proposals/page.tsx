"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Briefcase,
  ArrowRight,
  MessageSquare,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { motion, AnimatePresence } from "framer-motion";

interface CreatorProposal {
  id: string;
  project_id: string;
  cover_letter: string;
  proposed_budget: number;
  estimated_days: number;
  status: string;
  project?: {
    id: string;
    title: string;
    budget: string;
    status: string;
  };
}

export default function CreatorProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<CreatorProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects(title, budget)
        `)
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data as unknown as CreatorProposal[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      Promise.resolve().then(() => fetchProposals());
    }
  }, [user?.id]);

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" size={40} /></div>;

  return (
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="My Proposals">
        <div className="space-y-10">
          <div className="mb-4">
             <p className="text-sm text-gray-400 font-medium max-w-2xl">
               Track your bids and respond to client inquiries for cinematic projects.
             </p>
          </div>

          {proposals.length === 0 ? (
            <div className="glass p-16 rounded-[50px] text-center border-white/5 bg-white/[0.01]">
              <Send className="mx-auto text-gray-800 mb-6" size={56} />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 italic">No proposals sent yet</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto mb-10 leading-relaxed opacity-60">
                Your submitted proposals for cinematic projects will appear here for tracking.
              </p>
              <Link href="/projects">
                <button className="px-10 py-4 rounded-2xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                  Browse Projects
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {proposals.map((prop, idx) => (
                <motion.div 
                  key={prop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass p-6 sm:p-8 rounded-[40px] border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-neon-purple/20 transition-all bg-white/[0.01]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                         prop.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                         prop.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                         'bg-neon-blue/10 text-neon-blue border-neon-blue/20'
                       }`}>
                         {prop.status === 'pending' ? 'Waiting for client' : prop.status === 'accepted' ? 'Accepted by client' : 'Rejected by client'}
                       </span>
                       <span className="text-[9px] text-gray-600 uppercase font-bold tracking-widest opacity-60 italic">
                         Project Status: {prop.project?.status}
                       </span>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-3 truncate italic">{prop.project?.title}</h4>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest opacity-60 line-clamp-2 max-w-2xl leading-relaxed">
                       &quot;{prop.cover_letter}&quot;
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10">
                    <div className="text-left md:text-right">
                       <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1 opacity-60">Your Bid</div>
                       <div className="text-lg font-black text-white italic">₹{prop.proposed_budget}</div>
                       <div className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-1">{prop.estimated_days} Days ETA</div>
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto">
                      {prop.status === 'accepted' ? (
                        <>
                          <Link href={`/dashboard/projects/${prop.project_id}/workspace`} className="flex-1 sm:flex-initial">
                            <button className="w-full px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                              Open Project <ArrowRight size={14} />
                            </button>
                          </Link>
                        </>
                      ) : prop.status === 'pending' ? (
                        <div className="px-8 py-4 rounded-2xl glass border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                          <Clock size={14} /> Awaiting Client
                        </div>
                      ) : (
                        <div className="px-8 py-4 rounded-2xl glass border-red-500/10 text-red-500/40 text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                           <XCircle size={14} /> Closed
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

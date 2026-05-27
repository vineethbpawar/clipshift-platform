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
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function CreatorProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          project:projects(title, status)
        `)
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error("Error fetching creator proposals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user?.id]);

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;

  return (
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="My Proposals">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {proposals.length === 0 ? (
            <div className="glass p-12 rounded-[40px] text-center border-white/5">
              <Send className="mx-auto text-gray-700 mb-4" size={48} />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No proposals sent yet</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest max-w-xs mx-auto mb-8">
                Your submitted proposals for cinematic projects will appear here.
              </p>
              <Link href="/projects">
                <button className="px-8 py-4 rounded-2xl bg-neon-purple text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  Browse Projects
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((prop) => (
                <div key={prop.id} className="glass p-6 rounded-3xl border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-neon-purple/20 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                         prop.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                         prop.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                         'bg-neon-blue/10 text-neon-blue border-neon-blue/20'
                       }`}>
                         {prop.status === 'pending' ? 'Waiting for client' : prop.status === 'accepted' ? 'Accepted by client' : 'Rejected by client'}
                       </span>
                       <span className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">
                         Project Status: {prop.project?.status}
                       </span>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">{prop.project?.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider opacity-60 line-clamp-1">{prop.cover_letter}</p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                       <div className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Proposed</div>
                       <div className="text-sm font-black text-white">₹{prop.proposed_budget}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      {prop.status === 'accepted' ? (
                        <>
                          <Link href={`/dashboard/projects/${prop.project_id}/workspace`}>
                            <button className="px-6 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all flex items-center gap-2">
                              Workspace <ArrowRight size={14} />
                            </button>
                          </Link>
                          <Link href={`/chat`}>
                            <button className="p-3 rounded-xl glass border-white/5 text-gray-400 hover:text-white transition-all">
                              <MessageSquare size={16} />
                            </button>
                          </Link>
                        </>
                      ) : (
                        <div className="px-6 py-3 rounded-xl glass border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
                          Locked until accepted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

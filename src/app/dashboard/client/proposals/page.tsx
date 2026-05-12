"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, projects(title), profiles(full_name)');
    
    if (error) {
      toast.error("Failed to load proposals");
    } else {
      setProposals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleAction = async (id: string, status: 'accepted' | 'rejected', projectId: string, freelancerId: string) => {
    setLoading(true);
    
    if (status === 'accepted') {
      // 1. Update accepted proposal
      await supabase.from('proposals').update({ status: 'accepted' }).eq('id', id);
      // 2. Reject others
      await supabase.from('proposals').update({ status: 'rejected' }).eq('project_id', projectId).neq('id', id);
      // 3. Update project
      await supabase.from('projects').update({ status: 'in_progress', creator_id: freelancerId }).eq('id', projectId);
    } else {
      await supabase.from('proposals').update({ status: 'rejected' }).eq('id', id);
    }
    
    toast.success(`Proposal ${status}`);
    fetchProposals();
  };

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto pt-32 pb-20 px-4">
        <h1 className="text-3xl font-black text-white uppercase mb-8">Received Proposals</h1>
        {proposals.length === 0 ? (
          <p className="text-gray-500">No proposals received yet.</p>
        ) : (
          <div className="space-y-6">
            {proposals.map((prop: any) => (
              <div key={prop.id} className="glass p-6 rounded-2xl border border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">{prop.projects.title}</h3>
                  <p className="text-sm text-gray-400">By {prop.profiles.full_name} ({prop.freelancer_role})</p>
                  <p className="text-xs text-gray-500 mt-2">Budget: ₹{prop.proposed_budget} | Delivery: {prop.estimated_delivery_days} days</p>
                </div>
                {prop.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(prop.id, 'accepted', prop.project_id, prop.freelancer_id)} className="p-2 bg-green-500/20 text-green-500 rounded-lg"><CheckCircle2 /></button>
                    <button onClick={() => handleAction(prop.id, 'rejected', prop.project_id, prop.freelancer_id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><XCircle /></button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${prop.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {prop.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

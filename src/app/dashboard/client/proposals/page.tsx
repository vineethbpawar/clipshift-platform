"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProposals = async () => {
    console.log("Fetching proposals for user:", user?.id);
    const { data, error } = await supabase
      .from('proposals')
      .select('*, projects!inner(title, client_id), profiles(full_name)');
    
    if (error) {
      console.error("Proposal fetch error:", error);
      toast.error("Failed to load proposals");
    } else {
      console.log("Fetched proposals:", data);
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
      await supabase.from('proposals').update({ status: 'accepted' }).eq('id', id);
      await supabase.from('proposals').update({ status: 'rejected' }).eq('project_id', projectId).neq('id', id);
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
                  <h3 className="text-lg font-bold text-white">{prop.projects?.title}</h3>
                  <p className="text-sm text-gray-400">By {prop.profiles?.full_name} ({prop.freelancer_role})</p>
                  <p className="text-xs text-gray-500 mt-2">Budget: ₹{prop.proposed_budget} | Delivery: {prop.estimated_delivery_days} days</p>
                </div>
                {(!prop.status || prop.status === 'pending') ? (
                  <div className="flex gap-4">
                    <button onClick={() => handleAction(prop.id, 'accepted', prop.project_id, prop.freelancer_id)} className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-xs uppercase hover:bg-green-600 transition">
                      Accept Proposal
                    </button>
                    <button onClick={() => handleAction(prop.id, 'rejected', prop.project_id, prop.freelancer_id)} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-xs uppercase hover:bg-red-600 transition">
                      Reject Proposal
                    </button>
                  </div>
                ) : (
                  <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${prop.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
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

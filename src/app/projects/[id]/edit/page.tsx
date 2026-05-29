"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";

import { type Project } from "@/data/projects";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: "", description: "", category: "", budget: "" });

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .maybeSingle();

      if (error || !data || data.client_id !== user?.id) {
        toast.error("Unauthorized or project not found");
        router.push("/projects");
        return;
      }
      setFormData({ title: data.title, description: data.description, category: data.category, budget: data.budget });
      setLoading(false);
    };

    if (user?.id) fetchProject();
  }, [params.id, user?.id, router]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('projects')
      .update(formData)
      .eq('id', params.id);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Project updated!");
      router.push(`/projects/${params.id}`);
    }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;

  return (
    <RoleGuard allowedRoles={["client"]}>
      <PageWrapper>
        <div className="max-w-2xl mx-auto pt-32 pb-20 px-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-8 text-xs uppercase tracking-widest font-bold"><ArrowLeft size={16} /> Back</button>
          <h1 className="text-3xl font-black text-white uppercase mb-8">Edit Project</h1>
          <div className="glass p-8 rounded-3xl space-y-4">
            <input className="w-full bg-white/5 p-4 rounded-xl text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea className="w-full bg-white/5 p-4 rounded-xl text-white h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <input className="w-full bg-white/5 p-4 rounded-xl text-white" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
            <button onClick={handleSave} className="w-full py-4 bg-neon-purple text-white rounded-xl font-bold uppercase tracking-widest">Save Changes</button>
          </div>
        </div>
      </PageWrapper>
    </RoleGuard>
  );
}

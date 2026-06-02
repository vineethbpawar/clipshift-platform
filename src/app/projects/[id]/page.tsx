"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase, getStoredSession } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, X, Paperclip, ExternalLink, Calendar, DollarSign, MapPin, CheckCircle2, ShieldCheck, Briefcase, MessageSquare, AlertCircle, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { sanitizeDescription } from "@/lib/sanitizer";
import { motion } from "framer-motion";
import { loadRazorpayScript } from "@/lib/razorpay";
import Link from "next/link";
import { type Project } from "@/data/projects";
import { writeProposalAI } from "@/lib/gemini";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({ coverLetter: "", budget: "", days: "" });

  const handleWriteWithAI = async () => {
    if (!project || !user) return;
    setGenerating(true);
    try {
      const result = await writeProposalAI(project, user as any);
      if (result.error) {
        toast.error(result.error);
      } else {
        setProposalData({
          coverLetter: result.message,
          budget: result.suggestedBudget.toString(),
          days: result.suggestedDays.toString()
        });
        toast.success("AI Proposal drafted!");
      }
    } catch (err) {
      toast.error("Could not generate AI suggestion.");
    } finally {
      setGenerating(false);
    }
  };

  const handleMessageClient = async () => {
    if (!user || !project) return;
    if (user.role !== "creator") {
      toast.error("Only creators can message clients.");
      return;
    }

    setMessaging(true);
    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', project.client_id)
        .eq('creator_id', user.id)
        .maybeSingle();

      if (existingConv) {
        router.push(`/chat/${existingConv.id}`);
      } else {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_id: project.client_id,
            creator_id: user.id,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        
        await supabase.from('messages').insert({
          conversation_id: newConv.id,
          sender_id: user.id,
          receiver_id: project.client_id,
          content: `Hi, I'm interested in your project: ${project.title}.`
        });

        router.push(`/chat/${newConv.id}`);
      }
    } catch (err: unknown) {
      console.error("MESSAGE CLIENT ERROR", err);
      toast.error("Failed to initiate chat.");
    } finally {
      setMessaging(false);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      const projectId = params.id as string;
      if (!projectId) return;

      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (projErr || !projData) {
        setProjectError(projErr?.message || "Project not found.");
        setLoading(false);
        return;
      }

      const role = user?.role;
      const isAssignedCreator = projData.assigned_creator_id === user?.id;
      const isOwner = projData.client_id === user?.id;
      const isAdmin = role === "admin";

      if (projData.status !== "open" && !isAssignedCreator && !isOwner && !isAdmin) {
        setProjectError("This project is already in progress or completed.");
        setLoading(false);
        return;
      }

      setProject(projData as Project);

      if (user?.role === 'creator') {
        const { data: unlockData } = await supabase
          .from('project_unlocks')
          .select('*')
          .eq('project_id', projectId)
          .eq('freelancer_id', user?.id)
          .maybeSingle();
        setIsUnlocked(!!unlockData);
      }
      setLoading(false);
    };
    if (user?.id) fetchProject();
  }, [params.id, user]);

  const handleUnlock = async () => {
    if (!user || !project) return;
    setSubmitting(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load.");

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 99, actionType: 'project_unlock' })
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClipShift",
        description: `Unlock contact for project: ${project.title}`,
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setSubmitting(true);
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type: 'project_unlock',
                payload: { project_id: project.id, freelancer_id: user.id, amount: 99 * 100 }
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            setIsUnlocked(true);
            toast.success("Contact details unlocked!");
          } catch (err: unknown) {
            console.error("PROJECT UNLOCK ERROR", err);
            toast.error("Verification failed.");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#a855f7" },
        modal: { ondismiss: () => setSubmitting(false) }
      };

      const paymentObject = new (window as unknown as { Razorpay: { new (options: unknown): { open: () => void } } }).Razorpay(options);
      paymentObject.open();

    } catch (err: unknown) {
      console.error("PROJECT UNLOCK ERROR", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  const handleProposalSubmit = async () => {
    if (!user || !project) return;
    const { coverLetter, budget, days } = proposalData;
    if (!coverLetter.trim() || !budget || !days) {
      toast.error("Please fill all proposal fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let activeSession = sessionData.session;

      if (!activeSession) {
        const storedSession = getStoredSession();
        if (storedSession?.access_token) {
          const { data, error } = await supabase.auth.setSession({ access_token: storedSession.access_token, refresh_token: storedSession.refresh_token });
          if (error) throw error;
          activeSession = data.session;
        }
      }

      if (!activeSession) throw new Error("Session expired.");

      const { error } = await supabase.from('proposals').insert({
        project_id: project.id,
        freelancer_id: activeSession.user.id,
        cover_letter: coverLetter.trim(),
        proposed_budget: Number(budget),
        estimated_days: Number(days),
        status: "pending"
      });

      if (error) throw error;
      toast.success("Proposal submitted successfully!");
      setShowProposalModal(false);
    } catch (err: unknown) {
      console.error("SUBMIT PROPOSAL ERROR", err);
      const errorMessage = err instanceof Error ? err.message : "Action failed.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center pt-40"><Loader2 className="animate-spin text-neon-purple" size={48} /></div>;
  
  if (projectError || !project) return (
    <div className="text-center pt-40 px-6">
      <div className="glass p-10 rounded-[40px] border-red-500/10 bg-red-500/5 max-w-lg mx-auto">
        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
        <h2 className="text-2xl font-black text-white uppercase mb-4 italic">Notice</h2>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed uppercase tracking-widest">{projectError || "Project Not Found"}</p>
        <button onClick={() => router.back()} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all">
          Go Back
        </button>
      </div>
    </div>
  );

  const isOwner = user?.id === project.client_id;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto pt-32 pb-32 px-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-10 text-[10px] uppercase tracking-[0.2em] font-black transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass rounded-[50px] p-8 sm:p-12 border border-white/5 relative overflow-hidden bg-white/[0.01]">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-6 relative z-10">
                <div className="max-w-xl">
                   <div className="flex items-center gap-3 mb-4">
                     <span className="px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[9px] font-black text-neon-purple uppercase tracking-widest">
                       {project.category}
                     </span>
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${project.status === 'open' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-neon-blue/10 text-neon-blue border-neon-blue/20'}`}>
                        {project.status.replace('_', ' ')}
                     </span>
                   </div>
                   <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6 italic">{project.title}</h1>
                   <p className="text-gray-400 text-sm leading-relaxed uppercase tracking-wider font-medium opacity-70">
                     {isUnlocked || isOwner ? project.description : sanitizeDescription(project.description || "")}
                   </p>
                </div>
              </div>

              {project.file_url && (
                <div className="mb-12 relative z-10">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-6 ml-2">Project Attachment</p>
                  {project.file_type?.startsWith('image') ? (
                    <div className="relative aspect-video rounded-[32px] overflow-hidden glass border border-white/10 group">
                      <img src={project.file_url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <a href={project.file_url} target="_blank" className="p-5 rounded-full bg-white text-black hover:scale-110 transition-transform">
                            <ExternalLink size={24} />
                         </a>
                      </div>
                    </div>
                  ) : (
                    <a href={project.file_url} target="_blank" className="flex items-center gap-5 p-8 glass rounded-[32px] border-white/5 hover:border-neon-purple/30 transition-all bg-white/5">
                      <div className="w-16 h-16 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple">
                         <Paperclip size={32} />
                      </div>
                      <div>
                        <p className="text-xs text-white font-black uppercase tracking-widest mb-1 italic">Project Document</p>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">{project.file_name || 'View File'}</p>
                      </div>
                      <ExternalLink size={20} className="ml-auto text-gray-600" />
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5 relative z-10">
                 <div className="space-y-1">
                   <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1"><DollarSign size={10} /> Budget</span>
                   <p className="text-base font-black text-white italic">₹{project.budget}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1"><Briefcase size={10} /> Service</span>
                   <p className="text-xs font-bold text-gray-300 uppercase">{project.service_type?.replace('_', ' ')}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1"><MapPin size={10} /> Location</span>
                   <p className="text-xs font-bold text-gray-300 uppercase truncate">{project.location_mode === 'anywhere_india' ? 'Remote' : (project.city || 'Any')}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1"><Calendar size={10} /> Deadline</span>
                   <p className="text-xs font-bold text-gray-300 uppercase">{project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}</p>
                 </div>
              </div>

              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            </div>

            {/* Actions for Creator */}
            {!isOwner && user?.role === 'creator' && project.status === 'open' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowProposalModal(true)}
                  className="flex-1 py-5 bg-neon-purple text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                >
                  Submit Proposal
                </button>
                {!isUnlocked ? (
                  <button 
                    onClick={handleUnlock}
                    disabled={submitting}
                    className="flex-1 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neon-blue hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Unlock Client Contact <span className="text-[10px] opacity-60 ml-1">₹99</span></>}
                  </button>
                ) : (
                  <button 
                    onClick={handleMessageClient}
                    disabled={messaging}
                    className="flex-1 py-5 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {messaging ? <Loader2 size={16} className="animate-spin" /> : <><MessageSquare size={16} /> Message Client</>}
                  </button>
                )}
              </div>
            )}

            {/* Actions for Client */}
            {isOwner && project.status === 'open' && (
              <div className="flex flex-wrap gap-4">
                 <Link href={`/projects/${project.id}/edit`} className="flex-1 min-w-[200px]">
                   <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all active:scale-95">Edit Project</button>
                 </Link>
                 <Link href="/dashboard/client/proposals" className="flex-1 min-w-[200px]">
                   <button className="w-full py-5 glass border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95">View Proposals</button>
                 </Link>
              </div>
            )}
          </div>

          {/* Right: Creator/Client Info Card */}
          <div className="space-y-8 sticky top-32">
             <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 italic flex items-center gap-2">
                 <ShieldCheck size={14} className="text-neon-blue" /> Verified Information
               </h3>
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/5 italic font-black">
                     C
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Project Client</p>
                     <p className="text-sm font-black text-white uppercase tracking-tighter italic">ClipShift Member</p>
                   </div>
                 </div>
                 
                 <div className="p-5 glass rounded-2xl border-white/5 bg-black/40">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">Protection</p>
                    <div className="flex items-center gap-2 text-green-500">
                       <CheckCircle2 size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Escrow Active</span>
                    </div>
                 </div>
               </div>
             </div>

             <div className="glass p-8 rounded-[40px] border-white/5 text-center">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                  Collaboration on ClipShift is protected by our professional terms. Never share personal payment details.
                </p>
             </div>
          </div>
        </div>

        {/* Proposal Modal */}
        {showProposalModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass p-8 sm:p-10 rounded-[50px] w-full max-w-xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] relative"
            >
              <button onClick={() => setShowProposalModal(false)} className="absolute top-8 right-8 p-3 glass rounded-2xl text-gray-500 hover:text-white transition-colors border border-white/5">
                <X size={20}/>
              </button>
              
              <div className="mb-10 flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-2">Send Proposal</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Professional cinematic pitch</p>
                </div>
                
                <button 
                  onClick={handleWriteWithAI}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-[9px] font-black uppercase tracking-widest hover:bg-neon-purple/20 transition-all disabled:opacity-50 mb-1"
                >
                  {generating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                  Write with AI
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] ml-4 mb-2 block">Cover Letter</label>
                  <textarea 
                    placeholder="Describe your vision and why you are the best fit..." 
                    className="w-full h-40 bg-white/5 p-6 rounded-[32px] text-sm text-white outline-none focus:border-neon-purple transition-all resize-none border border-white/5" 
                    value={proposalData.coverLetter}
                    onChange={e => setProposalData({...proposalData, coverLetter: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] ml-4 mb-2 block">Budget (₹)</label>
                    <input 
                      type="number" 
                      placeholder="Agreed Amount" 
                      className="w-full bg-white/5 p-5 rounded-2xl text-sm font-black text-white outline-none focus:border-neon-purple transition-all border border-white/5 italic" 
                      value={proposalData.budget}
                      onChange={e => setProposalData({...proposalData, budget: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] ml-4 mb-2 block">Days to Deliver</label>
                    <input 
                      type="number" 
                      placeholder="Timeline" 
                      className="w-full bg-white/5 p-5 rounded-2xl text-sm font-black text-white outline-none focus:border-neon-purple transition-all border border-white/5 italic" 
                      value={proposalData.days}
                      onChange={e => setProposalData({...proposalData, days: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleProposalSubmit} 
                  disabled={submitting} 
                  className="w-full py-6 bg-white text-black rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-neon-purple hover:text-white active:scale-95 transition-all disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3 mt-4"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Briefcase size={18} /> Submit Proposition</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

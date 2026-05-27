"use client";

import React, { useEffect, useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { supabase, getStoredSession } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { sanitizeDescription } from "@/lib/sanitizer";
import { motion, AnimatePresence } from "framer-motion";
import { loadRazorpayScript } from "@/lib/razorpay";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({ coverLetter: "", budget: "", days: "" });

  const handleMessageClient = async () => {
    if (!user || !project) return;
    if (user.role !== "creator") {
      toast.error("Only creators can message clients.");
      return;
    }
    if (user.id === project.client_id) {
      toast.error("You cannot message yourself.");
      return;
    }

    setMessaging(true);
    console.log("MESSAGE CLIENT CLICKED", { projectId: project.id, clientId: project.client_id, userId: user.id });

    try {
      // 1. Check for existing conversation
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', project.client_id)
        .eq('creator_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingConv) {
        console.log("EXISTING CONVERSATION FOUND", existingConv);
        router.push(`/chat/${existingConv.id}`);
      } else {
        // 2. Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_id: project.client_id,
            creator_id: user.id,
            last_message: `Initiated chat for project: ${project.title}`,
            last_message_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        console.log("CREATED CONVERSATION", newConv);
        
        // 3. Optional: Send initial system message or placeholder
        await supabase.from('messages').insert({
          conversation_id: newConv.id,
          sender_id: user.id,
          receiver_id: project.client_id,
          content: `Hi, I'm interested in your project: ${project.title}.`
        });

        router.push(`/chat/${newConv.id}`);
      }
    } catch (err: any) {
      console.error("MESSAGE CLIENT ERROR", err);
      toast.error("Failed to initiate chat: " + (err.message || "Unknown error"));
    } finally {
      setMessaging(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setSubmitting(true);
    const { error } = await supabase.from('projects').delete().eq('id', params.id);
    if (error) {
      toast.error("Failed to delete project");
    } else {
      toast.success("Project deleted");
      router.push("/dashboard/client");
    }
    setSubmitting(false);
  };

  useEffect(() => {
    const fetchProject = async () => {
      const projectId = params.id as string;
      if (!projectId) return;

      console.log("PROJECT DETAIL PARAM ID:", projectId);
      console.log("CURRENT USER:", user?.id);
      console.log("CURRENT ROLE:", user?.role);

      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      console.log("PROJECT DETAIL QUERY RESULT:", { data: projData, error: projErr });

      if (projErr) {
        console.error("Supabase error fetching project:", projErr);
        setProject({ error: "Project error: " + projErr.message });
        setLoading(false);
        return;
      }

      if (!projData) {
        console.error("Project not found or blocked by database policy.");
        setProject({ error: "Project not found or blocked by database policy." });
        setLoading(false);
        return;
      }

      // Access Check in JS
      const role = user?.role;
      const isAssignedCreator = projData.assigned_creator_id === user?.id;
      const isOwner = projData.client_id === user?.id;
      const isAdmin = role === "admin";

      if (projData.status !== "open" && !isAssignedCreator && !isOwner && !isAdmin) {
        console.warn("Access denied for user", user?.id, "to project", projectId);
        setProject({ error: "This project is no longer accepting proposals." });
        setLoading(false);
        return;
      }

      setProject(projData);

      // Fetch unlock status if creator
      if (user?.role === 'creator') {
        const { data: unlockData } = await supabase
          .from('project_unlocks')
          .select('*')
          .eq('project_id', projectId)
          .eq('freelancer_id', user?.id)
          .eq('payment_status', 'paid')
          .maybeSingle();
        setIsUnlocked(!!unlockData);
      }
      setLoading(false);
    };
    if (user?.id) fetchProject();
  }, [params.id, user?.id, user?.role]);

  const handleUnlock = async () => {
    if (!user) return;
    const role = user.role;
    
    if (role !== "creator") {
      toast.error("Unauthorized. Only creators can unlock projects.");
      return;
    }

    if (project?.status !== "open") {
      toast.error("This project is no longer open for unlocks.");
      return;
    }

    setSubmitting(true);

    const payload = {
      project_id: project.id,
      freelancer_id: user.id,
      unlock_fee: 99,
      payment_status: "paid",
    };

    console.log("PROJECT UNLOCK PAYLOAD", payload);

    try {
      // 1. Check if already unlocked
      const { data: existingUnlock } = await supabase
        .from('project_unlocks')
        .select('*')
        .eq('project_id', project.id)
        .eq('freelancer_id', user.id)
        .maybeSingle();

      if (existingUnlock) {
        setIsUnlocked(true);
        toast.success("Contact already unlocked.");
        setSubmitting(false);
        return;
      }

      // 2. Load Razorpay Script
      const res = await loadRazorpayScript();
      if (!res) throw new Error("Razorpay SDK failed to load.");

      // 3. Create Order
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 99,
          actionType: 'boost_project_7_days', // Using a valid action type from the API
          payload: { project_id: project.id }
        })
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      // 4. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClipShift Collective",
        description: `Unlock contact for project: ${project.title}`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          setSubmitting(true);
          try {
            // 5. Verify & Record Unlock via Server
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type: 'project_unlock',
                payload: {
                  project_id: project.id,
                  freelancer_id: user.id,
                  amount: 99 * 100
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            setIsUnlocked(true);
            toast.success("Contact unlocked!");
          } catch (err: any) {
            console.error("PROJECT UNLOCK ERROR", err);
            toast.error(err.message || "Verification failed.");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#a855f7" },
        modal: { ondismiss: () => setSubmitting(false) }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      console.error("PROJECT UNLOCK ERROR", err);
      toast.error(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  const handleProposalSubmit = async () => {
    if (!user || !project) return;
    
    // 1. Validation
    if (user.role !== "creator") {
      toast.error("Unauthorized. Only creators can submit proposals.");
      return;
    }

    if (project.status !== "open") {
      toast.error("This project is no longer accepting proposals.");
      return;
    }

    const { coverLetter, budget, days } = proposalData;
    
    if (!coverLetter.trim()) {
      toast.error("Please provide a cover letter.");
      return;
    }

    const proposedBudget = Number(budget);
    const estimatedDays = Number(days);

    if (isNaN(proposedBudget) || proposedBudget <= 0) {
      toast.error("Please enter a valid budget greater than 0.");
      return;
    }

    if (isNaN(estimatedDays) || estimatedDays <= 0) {
      toast.error("Please enter valid delivery days greater than 0.");
      return;
    }

    setSubmitting(true);

    try {
      // 2. Force Session Restoration
      const { data: sessionData } = await supabase.auth.getSession();
      let activeSession = sessionData.session;

      if (!activeSession) {
        const storedSession = getStoredSession();
        if (storedSession?.access_token && storedSession?.refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: storedSession.access_token,
            refresh_token: storedSession.refresh_token,
          });

          if (error) {
            console.error("SUPABASE SESSION RESTORE ERROR", error);
            throw error;
          }
          activeSession = data.session;
        }
      }

      if (!activeSession) {
        toast.error("Your session expired. Please login again.");
        router.push("/auth/login");
        return;
      }

      const payload = {
        project_id: project.id,
        freelancer_id: activeSession.user.id,
        cover_letter: coverLetter.trim(),
        proposed_budget: Number(proposedBudget),
        estimated_days: Number(estimatedDays),
        status: "pending"
      };

      console.log("PROPOSAL ACTIVE SESSION", {
        hasSession: !!activeSession,
        sessionUserId: activeSession?.user?.id,
        payloadFreelancerId: payload.freelancer_id
      });

      console.log("SUBMIT PROPOSAL USER", user);
      console.log("SUBMIT PROPOSAL ROLE", user.role);
      console.log("FINAL PROPOSAL PAYLOAD", payload);

      // 3. Check for duplicate proposal using activeSession ID
      const { data: existingProposal } = await supabase
        .from('proposals')
        .select('id')
        .eq('project_id', project.id)
        .eq('freelancer_id', activeSession.user.id)
        .maybeSingle();

      if (existingProposal) {
        toast.error("You already submitted this proposal.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("SUBMIT PROPOSAL ERROR", error);
        if (error.code === "23505") {
          toast.error("You already submitted this proposal.");
        } else {
          toast.error(error.message || "Failed to submit proposal.");
        }
      } else {
        console.log("PROPOSAL SUBMITTED:", data);
        toast.success("Proposal submitted successfully!");
        setProposalData({ coverLetter: "", budget: "", days: "" });
        setShowProposalModal(false);
      }
    } catch (err: any) {
      console.error("SUBMIT PROPOSAL UNEXPECTED ERROR", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center pt-32"><Loader2 className="animate-spin text-neon-purple" /></div>;
  if (!project || project.error) return (
    <div className="text-center pt-32 px-4">
      <div className="glass p-8 rounded-3xl border-red-500/20 max-w-md mx-auto">
        <h2 className="text-2xl font-black text-white uppercase mb-4">Access Issue</h2>
        <p className="text-red-400 text-sm mb-8">{project?.error || "Project not found."}</p>
        <button onClick={() => router.back()} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10">
          Go Back
        </button>
      </div>
    </div>
  );

  const isOwner = user?.id === project.client_id && user?.role === "client";
  console.log("Debug Auth:", { userId: user?.id, client: project.client_id, role: user?.role, isOwner });

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto pt-32 pb-20 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 text-xs uppercase tracking-widest font-bold">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="glass rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-tight">{project.title}</h1>
            <span className="px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-[10px] font-black text-neon-purple uppercase tracking-widest whitespace-nowrap">
              {project.category}
            </span>
          </div>
          
          <p className="text-sm sm:text-gray-400 mb-8 leading-relaxed">
            {isUnlocked ? project.description : sanitizeDescription(project.description)}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
            <div className="glass p-4 rounded-2xl border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Budget</div>
              <div className="text-xs sm:text-sm font-bold text-white">{project.budget}</div>
            </div>
            <div className="glass p-4 rounded-2xl border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Service Type</div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase">{project.service_type?.replace('_', ' ')}</div>
            </div>
            <div className="glass p-4 rounded-2xl border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Location</div>
              <div className="text-xs sm:text-sm font-bold text-white uppercase">
                {project.location_mode === 'anywhere_india' ? "Anywhere (India)" : (project.location || project.locations?.[0]?.name || "Not Set")}
                {project.shoot_radius_km && ` (${project.shoot_radius_km}km)`}
              </div>
            </div>
            <div className="glass p-4 rounded-2xl border-white/5">
              <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Status</div>
              <div className="text-xs sm:text-sm font-bold text-neon-blue uppercase">{project.status}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {user?.role === 'creator' && (
              <>
                {project.status === 'open' ? (
                  <>
                    <button 
                      onClick={() => setShowProposalModal(true)}
                      className="w-full sm:w-auto px-8 py-4 bg-neon-purple text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                      Submit Proposal
                    </button>
                    {!isUnlocked ? (
                      <button 
                        onClick={handleUnlock}
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-4 bg-neon-blue text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                      >
                        Unlock Contact ₹99
                      </button>
                    ) : (
                      <button 
                        onClick={handleMessageClient}
                        disabled={messaging}
                        className="w-full sm:w-auto px-8 py-4 bg-green-500 text-black rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {messaging ? <Loader2 size={16} className="animate-spin" /> : "Message Client"}
                      </button>
                    )}
                    <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
                      Save Project
                    </button>
                  </>
                ) : project.assigned_creator_id === user?.id ? (
                  <button 
                    onClick={() => router.push(`/dashboard/projects/${project.id}/workspace`)}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    Open Project
                  </button>
                ) : (
                  <div className="w-full p-4 glass border-white/5 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                      This project has already been assigned to another creator.
                    </p>
                  </div>
                )}
              </>
            )}
            {isOwner && (
              <>
                {project.status === 'open' ? (
                  <>
                    <button onClick={() => router.push(`/projects/${project.id}/edit`)} className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Edit Project</button>
                    <button onClick={() => router.push(`/dashboard/client/proposals`)} className="w-full sm:w-auto px-8 py-4 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 rounded-full font-black text-xs uppercase tracking-widest active:scale-95 transition-all">View Proposals</button>
                    <button onClick={handleDelete} className="w-full sm:w-auto px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-500/20 active:scale-95 transition-all">Delete Project</button>
                  </>
                ) : (
                  <button 
                    onClick={() => router.push(`/dashboard/projects/${project.id}/workspace`)}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    Open Project
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {showProposalModal && (
          <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[100]">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              className="glass p-6 sm:p-8 rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg border-t sm:border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase">Submit Proposal</h3>
                <button onClick={() => setShowProposalModal(false)} className="p-2"><X className="text-gray-500 hover:text-white"/></button>
              </div>
              <textarea 
                placeholder="Cover Letter" 
                className="w-full h-32 bg-white/5 p-4 rounded-2xl text-base text-white mb-4 outline-none focus:border-neon-purple transition-colors resize-none" 
                onChange={e => setProposalData({...proposalData, coverLetter: e.target.value})}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="Proposed Budget (₹)" 
                  className="w-full bg-white/5 p-4 rounded-2xl text-base text-white outline-none focus:border-neon-purple transition-colors" 
                  onChange={e => setProposalData({...proposalData, budget: e.target.value})}
                />
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="Delivery Days" 
                  className="w-full bg-white/5 p-4 rounded-2xl text-base text-white outline-none focus:border-neon-purple transition-colors" 
                  onChange={e => setProposalData({...proposalData, days: e.target.value})}
                />
              </div>
              <button 
                onClick={handleProposalSubmit} 
                disabled={submitting} 
                className="w-full py-5 bg-neon-purple text-white rounded-full font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Send Proposal"}
              </button>
              <div className="h-safe-area-bottom sm:hidden" />
            </motion.div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

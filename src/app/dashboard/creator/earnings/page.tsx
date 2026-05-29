"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  Loader2,
  Wallet
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { motion } from "framer-motion";

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  order_id: string;
}

export default function CreatorEarningsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    completedProjects: 0
  });

  useEffect(() => {
    if (!user) return;

    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setPayments(data);
          
          const completed = data.filter(p => p.status === 'completed');
          const pending = data.filter(p => p.status === 'pending');
          
          const totalPaise = completed.reduce((acc, curr) => acc + curr.amount, 0);
          const pendingPaise = pending.reduce((acc, curr) => acc + curr.amount, 0);

          setStats({
            totalEarnings: totalPaise / 100,
            pendingPayments: pendingPaise / 100,
            completedProjects: completed.length
          });
        }
      } catch (err) {
        console.error("Error fetching earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [user]);

  return (
    <RoleGuard allowedRoles={["creator"]}>
      <DashboardLayout title="Earnings">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <StatCard 
              title="Total Withdrawn" 
              value={stats.totalEarnings} 
              prefix="₹" 
              icon={DollarSign} 
              color="purple" 
            />
            <StatCard 
              title="Current Balance" 
              value={stats.pendingPayments} 
              prefix="₹" 
              icon={Wallet} 
              color="blue" 
            />
            <StatCard 
              title="Paid Projects" 
              value={stats.completedProjects} 
              icon={TrendingUp} 
              color="green" 
            />
          </div>

          {/* Transactions List */}
          <div className="glass p-4 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-[0.2em]">Transaction History</h3>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time History</span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 md:py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-neon-purple" size={32} />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loading History...</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="py-12 md:py-20 text-center">
                <div className="text-[9px] md:text-[10px] text-gray-600 font-black uppercase tracking-widest italic mb-2">No earnings history found</div>
                <p className="text-xs text-gray-500">Complete projects or unlock chats to see revenue flow.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shrink-0 ${payment.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        <DollarSign size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest truncate">
                          {payment.status === 'completed' ? 'Payment Completed' : 'Pending Verification'}
                        </div>
                        <div className="text-[9px] md:text-[10px] text-gray-500 font-mono mt-1">
                          {new Date(payment.created_at).toLocaleDateString()} • ID: {payment.order_id.slice(-8)}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm md:text-base font-black text-white">₹{(payment.amount / 100).toLocaleString()}</div>
                      <div className={`text-[8px] font-black uppercase tracking-widest mt-1 ${payment.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {payment.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Payout Info */}
          <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-neon-blue/20 bg-gradient-to-br from-neon-blue/5 to-transparent">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Payout Process</h4>
            <p className="text-[11px] md:text-xs text-gray-400 leading-relaxed mb-6">
              Funds are held securely. Transfers to your primary bank account occur within 48 hours of project completion.
            </p>
            <button className="flex items-center gap-2 text-[10px] text-neon-blue font-black uppercase tracking-widest hover:underline">
              Configure Payout Account <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ShieldCheck,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Milestone, MilestoneStatus } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import PaymentModal from '@/components/PaymentModal';

/* ─── Helpers ─── */

const formatLKR = (amount: number): string =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);

type Role = 'Client_SME' | 'Freelancer';

const ROLES: { value: Role; label: string }[] = [
  { value: 'Client_SME', label: 'Client' },
  { value: 'Freelancer', label: 'Freelancer' },
];

/* ─── Status helpers ─── */

const statusColor: Record<MilestoneStatus, string> = {
  Paid_Out: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Approved: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  Funded_in_Escrow:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Unfunded: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const statusLabel = (s: MilestoneStatus): string => s.replace(/_/g, ' ');

/* ─── Timeline Node ─── */

function TimelineNode({ status }: { status: MilestoneStatus }) {
  const base = 'w-4 h-4 rounded-full border-2 shrink-0';

  switch (status) {
    case 'Paid_Out':
      return <span className={`${base} bg-emerald-500 border-emerald-500`} />;
    case 'Approved':
      return <span className={`${base} bg-primary-500 border-primary-500`} />;
    case 'Funded_in_Escrow':
      return (
        <span
          className={`${base} bg-primary-500 border-primary-500 node-active`}
        />
      );
    case 'Unfunded':
    default:
      return (
        <span className={`${base} bg-transparent border-zinc-600`} />
      );
  }
}

/* ─── Props ─── */

interface Props {
  initialMilestones: Milestone[];
  userRole: string;
}

/* ─── Component ─── */

export default function MilestoneTimeline({ initialMilestones, userRole }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const role = userRole as Role;
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  /* ─── Actions ─── */

  const handleFundClick = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowPaymentModal(true);
  };

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ status: 'Approved', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setMilestones((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: 'Approved' as MilestoneStatus } : m,
        ),
      );
      router.refresh();
    } catch (err) {
      console.error('Failed to approve milestone:', err);
    } finally {
      setLoadingId(null);
    }
  };

  /* ─── Skeleton State ─── */

  if (initialMilestones.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton rounded-2xl h-32" />
        ))}
      </div>
    );
  }

  /* ─── Render ─── */

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-8">

      {/* ── Vertical Timeline ── */}
      <div className="relative ml-2">
        {/* Continuous gradient line */}
        <div className="timeline-line absolute left-[7px] top-0 bottom-0 w-[2px]" />

        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.45,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="relative flex items-start gap-4 pl-6"
            >
              {/* Node dot */}
              <div className="absolute left-0 top-5">
                <TimelineNode status={milestone.status} />
              </div>

              {/* Card */}
              <div className="glass rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-5 w-full">
                {/* Top row: label + badge */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs uppercase tracking-widest text-zinc-500">
                    Milestone {String(index + 1).padStart(2, '0')}
                  </span>

                  <AnimatePresence mode="wait">
                    <motion.span
                      key={milestone.status}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[milestone.status]}`}
                    >
                      {statusLabel(milestone.status)}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
                  {milestone.milestone_name}
                </h3>

                {/* Bottom row: amount + actions */}
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {formatLKR(milestone.amount)}
                  </span>

                  {/* Client actions */}
                  {role === 'Client_SME' && (
                    <div className="flex items-center gap-2">
                      {milestone.status === 'Unfunded' && (
                        <button
                          onClick={() => handleFundClick(milestone)}
                          disabled={loadingId === milestone.id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingId === milestone.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wallet className="w-4 h-4" />
                          )}
                          Fund Escrow
                        </button>
                      )}

                      {milestone.status === 'Funded_in_Escrow' && (
                        <button
                          onClick={() => handleApprove(milestone.id)}
                          disabled={loadingId === milestone.id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 hover:bg-primary-500 text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingId === milestone.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      )}

                      {(milestone.status === 'Approved' ||
                        milestone.status === 'Paid_Out') && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Secured
                        </span>
                      )}
                    </div>
                  )}

                  {/* Freelancer view */}
                  {role === 'Freelancer' && (
                    <div className="flex items-center gap-2">
                      {milestone.status === 'Funded_in_Escrow' && (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          </span>
                          Safe to Work
                        </span>
                      )}

                      {(milestone.status === 'Approved' ||
                        milestone.status === 'Paid_Out') && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Secured
                        </span>
                      )}

                      {milestone.status === 'Unfunded' && (
                        <span className="text-xs text-zinc-400 italic">
                          Awaiting funding
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {showPaymentModal && selectedMilestone && (
        <PaymentModal
          isOpen={showPaymentModal}
          milestone={selectedMilestone}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedMilestone(null);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            setSelectedMilestone(null);
            setMilestones((prev) =>
              prev.map((m) =>
                m.id === selectedMilestone.id
                  ? { ...m, status: 'Funded_in_Escrow' as MilestoneStatus }
                  : m,
              ),
            );
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

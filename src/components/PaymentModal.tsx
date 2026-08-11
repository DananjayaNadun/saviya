'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, X, Loader2 } from 'lucide-react';
import { supabase, type Milestone } from '@/lib/supabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone | null;
  onSuccess: () => void;
}

const formatLKR = (amount: number) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);

export default function PaymentModal({
  isOpen,
  onClose,
  milestone,
  onSuccess,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    if (!milestone) return;
    setLoading(true);
    try {
      await supabase
        .from('milestones')
        .update({ status: 'Funded_in_Escrow' })
        .eq('id', milestone.id);
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && milestone && (
        <motion.div
          key="payment-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            key="payment-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-surface-950 border border-surface-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient top bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

            <div className="p-8">
              {/* Close button */}
              <div className="flex justify-end -mt-2 -mr-2 mb-2">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lock icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 ring-1 ring-primary-500/20 border border-primary-500/20"
                >
                  <Lock className="w-7 h-7 text-primary-400" />
                </motion.div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold tracking-tight text-white text-center">
                Secure Escrow Payment
              </h2>

              {/* Subtitle */}
              <p className="text-sm text-zinc-400 text-center mt-2 mb-6">
                Funds will be held securely until you approve the work.
              </p>

              {/* Milestone summary */}
              <div className="bg-surface-900 rounded-xl p-4 border border-surface-800 mb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Milestone</p>
                    <p className="text-sm font-medium text-white">
                      {milestone.milestone_name}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-zinc-400">Amount</p>
                    <p className="text-lg font-bold text-primary-400">
                      {formatLKR(milestone.amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-800">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-400">
                    Protected by escrow guarantee
                  </span>
                </div>
              </div>

              {/* Fund button */}
              <button
                onClick={handleFund}
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  'Fund via PayHere'
                )}
              </button>

              {/* Cancel */}
              <p
                onClick={onClose}
                className="text-sm text-zinc-500 hover:text-zinc-300 cursor-pointer text-center mt-4 transition-colors"
              >
                Cancel
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

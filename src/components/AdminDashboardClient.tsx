'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ShieldAlert,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import type { Project } from '@/lib/supabase';

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration: number = 1500): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const easeOutExpo = useCallback((t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }, []);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setValue(Math.round(easedProgress * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, easeOutExpo]);

  return value;
}

/* ─── LKR Formatter ─── */
const formatLKR = (amount: number): string =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/* ─── Card Variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

/* ─── Props ─── */
interface AdminDashboardClientProps {
  totalGMV: number;
  disputes: Project[];
  completedCount: number;
  isAdmin?: boolean;
}

export default function AdminDashboardClient({
  totalGMV,
  disputes,
  completedCount,
  isAdmin = true,
}: AdminDashboardClientProps) {
  const animatedGMV = useAnimatedCounter(totalGMV, 2000);

  return (
    <>
      <Navbar activePath="/admin" isAdmin={isAdmin} />

      <main className="relative min-h-screen overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        {/* ─── Ambient Blob Gradients ─── */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary-600 opacity-10 mix-blend-multiply blur-[128px] animate-blob"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-60 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500 opacity-10 mix-blend-multiply blur-[128px] animate-blob animation-delay-2000"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-violet-600 opacity-10 mix-blend-multiply blur-[128px] animate-blob animation-delay-4000"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* ─── Header ─── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-[var(--muted)]">
              Platform overview &amp; dispute management
            </p>
          </motion.div>

          {/* ─── Bento Grid ─── */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 — Total GMV in Escrow */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="glass group relative overflow-hidden rounded-2xl p-6 lg:col-span-2"
            >
              {/* Decorative gradient shimmer */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent" />

              <div className="relative flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                    <Wallet className="h-4 w-4 text-primary-400" />
                    Total GMV in Escrow
                  </div>
                  <div className="font-mono text-5xl font-black tracking-tight">
                    {formatLKR(animatedGMV)}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live from Supabase
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10">
                  <TrendingUp className="h-6 w-6 text-primary-400" />
                </div>
              </div>
            </motion.div>

            {/* Card 2 — Active Disputes */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="glass group relative overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    Active Disputes
                  </div>
                  <div className="font-mono text-5xl font-black tracking-tight">
                    {disputes.length}
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Requires mediation
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                  <ShieldAlert className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </motion.div>

            {/* Card 3 — Completed Projects */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="glass group relative overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Completed Projects
                  </div>
                  <div className="font-mono text-5xl font-black tracking-tight">
                    {completedCount}
                  </div>
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Successfully delivered
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Disputes Section ─── */}
          <section className="mt-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex items-center gap-2 text-xl font-semibold tracking-tight"
            >
              <ShieldAlert className="h-5 w-5 text-red-400" />
              Projects in Dispute
            </motion.h2>

            {disputes.length === 0 ? (
              /* ─── Empty State ─── */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass flex flex-col items-center justify-center rounded-2xl py-16"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-lg font-medium">No active disputes</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  All projects are running smoothly
                </p>
              </motion.div>
            ) : (
              /* ─── Dispute Cards ─── */
              <div className="space-y-4">
                {disputes.map((project, index) => (
                  <motion.div
                    key={project.id}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-20px' }}
                    className="glass group flex flex-col items-start gap-4 rounded-2xl p-5 transition-colors hover:bg-[var(--card-hover)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold tracking-tight">
                          {project.title}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                        <span>
                          Client:{' '}
                          <span className="font-mono text-xs">
                            {project.client_id}
                          </span>
                        </span>
                        <span>
                          Freelancer:{' '}
                          <span className="font-mono text-xs">
                            {project.freelancer_id}
                          </span>
                        </span>
                        <span className="font-semibold text-[var(--fg)]">
                          {formatLKR(project.total_budget)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Mediate Case
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

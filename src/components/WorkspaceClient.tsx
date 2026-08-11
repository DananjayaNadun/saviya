'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import MilestoneTimeline from '@/components/MilestoneTimeline';
import type { Milestone } from '@/lib/supabase';

interface Props {
  initialMilestones: Milestone[];
  userRole: string;
  isAdmin?: boolean;
}

export default function WorkspaceClient({ initialMilestones, userRole, isAdmin = false }: Props) {
  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden flex flex-col">
      {/* Ambient Background Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.07] animate-blob" />
        <div className="absolute -top-20 -right-40 w-[500px] h-[500px] bg-primary-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.05] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-primary-800 rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.06] animate-blob animation-delay-4000" />
      </div>

      {/* Navbar */}
      <Navbar activePath="/" isAdmin={isAdmin} />

      {/* Hero Section */}
      <main className="relative z-10 flex-grow pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Secure Escrow{' '}
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Workspace
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Manage milestones, track payments in LKR, and release funds only when
              the work is approved. No more payment ghosting.
            </p>
          </motion.div>

          {/* Timeline Component */}
          <MilestoneTimeline initialMilestones={initialMilestones} userRole={userRole} />
        </div>
      </main>
    </div>
  );
}

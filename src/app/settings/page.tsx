'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Wallet, CreditCard, Building2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/utils/supabase/client';

type Tab = 'profile' | 'billing' | 'notifications';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'billing', label: 'Billing & Payouts', icon: <Wallet className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
];

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button
      onClick={() => setChecked(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary-600' : 'bg-surface-700'
      }`}
    >
      <motion.span
        layout
        className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
        animate={{ x: checked ? 22 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAvatar = async () => {
    if (!userId) return;
    const { error } = await supabase.from('users').upsert({
      id: userId,
      email: userEmail,
      role: 'Client_SME',
      name: userName || 'User',
      avatar_url: avatarUrl
    }, { onConflict: 'id' });
    
    if (error) alert(`Failed to save avatar: ${error.message}`);
  };

  const handleSaveName = async () => {
    if (!userId) return;
    const { error } = await supabase.from('users').upsert({
      id: userId,
      email: userEmail,
      role: 'Client_SME',
      name: userName || 'User',
      avatar_url: avatarUrl
    }, { onConflict: 'id' });
    
    if (error) alert(`Failed to save name: ${error.message}`);
  };

  const handleSaveEmail = async () => {
    const { error } = await supabase.auth.updateUser({ email: userEmail });
    if (error) alert(`Failed to update email: ${error.message}`);
  };

  const handleSaveBilling = async () => {
    if (!userId) return;
    const { error } = await supabase.from('users').upsert({
      id: userId,
      email: userEmail,
      role: 'Client_SME',
      name: userName || 'User',
      bank_details: { bankName, branchCode, accountNumber }
    }, { onConflict: 'id' });
    
    if (error) alert(`Failed to save billing: ${error.message}`);
  };

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || '');
        setUserId(user.id);
        if (user.email === 'd.u.flash55@gmail.com') {
          setIsAdmin(true);
        }

        // Fetch custom user data
        supabase
          .from('users')
          .select('name, avatar_url, bank_details')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserName(data.name || '');
              if (data.avatar_url) setAvatarUrl(data.avatar_url);
              if (data.bank_details) {
                const bd = data.bank_details as any;
                setBankName(bd.bankName || '');
                setBranchCode(bd.branchCode || '');
                setAccountNumber(bd.accountNumber || '');
              }
            }
          });
      }
    });
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.05] animate-blob" />
      </div>

      <Navbar activePath="/settings" isAdmin={isAdmin} />

      <main className="relative z-10 flex-grow pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
        <motion.h1
          className="text-3xl font-bold tracking-tight text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Settings
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="md:col-span-1 space-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2.5 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20'
                    : 'text-zinc-400 hover:bg-surface-800 hover:text-zinc-200 border border-transparent'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  className="space-y-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Avatar Card */}
                  <section className="glass rounded-2xl overflow-hidden border border-surface-800/60 shadow-sm">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start">
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="text-base font-semibold text-white">Profile Picture</h3>
                        <p className="text-sm text-zinc-400">
                          This is your avatar. Click on the avatar to upload a custom one from your files.
                        </p>
                      </div>
                      <div className="flex items-center gap-6 w-full sm:max-w-xs">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <div 
                          className="relative group cursor-pointer flex-shrink-0"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="h-20 w-20 rounded-full bg-surface-800 border-2 border-surface-700 flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-8 w-8 text-zinc-500" />
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-white">Change</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 hover:border-surface-600 text-white text-sm font-medium rounded-lg transition-all active:scale-95 text-left w-fit"
                          >
                            Upload New
                          </button>
                          {avatarUrl && (
                            <button 
                              onClick={handleRemovePicture}
                              className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors text-left px-1 w-fit"
                            >
                              Remove picture
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-900/50 px-6 sm:px-8 py-4 border-t border-surface-800/60 flex items-center justify-between">
                      <p className="text-xs text-zinc-500">An avatar is optional but strongly recommended.</p>
                      <button 
                        onClick={handleSaveAvatar}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
                      >
                        Save
                      </button>
                    </div>
                  </section>
                  {/* Name Card */}
                  <section className="glass rounded-2xl overflow-hidden border border-surface-800/60 shadow-sm">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start">
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="text-base font-semibold text-white">Display Name</h3>
                        <p className="text-sm text-zinc-400">
                          Please enter your full name, or a display name you are comfortable with.
                        </p>
                      </div>
                      <div className="w-full sm:max-w-xs">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white transition-all"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                    </div>
                    <div className="bg-surface-900/50 px-6 sm:px-8 py-4 border-t border-surface-800/60 flex justify-end">
                      <button 
                        onClick={handleSaveName}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
                      >
                        Save
                      </button>
                    </div>
                  </section>

                  {/* Email Card */}
                  <section className="glass rounded-2xl overflow-hidden border border-surface-800/60 shadow-sm">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start">
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="text-base font-semibold text-white">Email Address</h3>
                        <p className="text-sm text-zinc-400">
                          Your email is managed by your authentication provider (Google or Magic Link).
                        </p>
                      </div>
                      <div className="w-full sm:max-w-xs">
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white transition-all"
                        />
                      </div>
                    </div>
                    <div className="bg-surface-900/50 px-6 sm:px-8 py-4 border-t border-surface-800/60 flex items-center justify-between">
                      <p className="text-xs text-zinc-500">Requires verification from both old and new addresses.</p>
                      <button 
                        onClick={handleSaveEmail}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-all active:scale-95"
                      >
                        Save
                      </button>
                    </div>
                  </section>

                  {/* Currency Card */}
                  <section className="glass rounded-2xl overflow-hidden border border-surface-800/60 shadow-sm">
                    <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start">
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="text-base font-semibold text-white">Marketplace Currency</h3>
                        <p className="text-sm text-zinc-400">
                          The fiat currency used for all escrows and payouts on Saviya.
                        </p>
                      </div>
                      <div className="w-full sm:max-w-xs">
                        <select
                          className="w-full px-4 py-2.5 bg-surface-900/50 border border-surface-700/50 rounded-xl text-zinc-500 cursor-not-allowed appearance-none"
                          disabled
                        >
                          <option>LKR — Sri Lankan Rupee</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-surface-900/50 px-6 sm:px-8 py-4 border-t border-surface-800/60 flex items-center justify-between">
                      <p className="text-xs text-zinc-500">Strictly denominated in LKR.</p>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  className="glass rounded-2xl p-6 space-y-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-white border-b border-surface-800 pb-4">
                    Billing & Payouts
                  </h2>
                  <div className="space-y-6">
                    <div className="p-5 bg-surface-900 rounded-xl border border-surface-800 space-y-4">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <Building2 className="w-5 h-5 text-primary-400" /> Bank Details for Payouts
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-zinc-500">Bank Name</label>
                          <input 
                            type="text" 
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-surface-950 border border-surface-700 rounded-lg text-white" 
                            placeholder="Commercial Bank" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-zinc-500">Branch Code</label>
                          <input 
                            type="text" 
                            value={branchCode}
                            onChange={(e) => setBranchCode(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-surface-950 border border-surface-700 rounded-lg text-white" 
                            placeholder="112" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-500">Account Number</label>
                        <input 
                          type="text" 
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-surface-950 border border-surface-700 rounded-lg text-white" 
                          placeholder="8XXXXXXXX" 
                        />
                      </div>
                    </div>

                    <div className="p-5 bg-surface-900 rounded-xl border border-surface-800 space-y-4">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <CreditCard className="w-5 h-5 text-success" /> Payment Methods
                      </div>
                      <p className="text-sm text-zinc-400">Link your preferred cards for funding PayHere escrows.</p>
                      <button className="px-4 py-2 bg-surface-800 border border-surface-700 hover:border-primary-500 text-sm font-medium rounded-lg transition-colors text-zinc-300 hover:text-white">
                        + Add New Card
                      </button>
                    </div>

                    <button 
                      onClick={handleSaveBilling}
                      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all active:scale-95"
                    >
                      Save Billing Details
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  className="glass rounded-2xl p-6 space-y-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-white border-b border-surface-800 pb-4">
                    Notifications
                  </h2>
                  <div className="space-y-3">
                    {[
                      { title: 'Escrow Funded Alerts', desc: 'Get notified when a client funds a milestone.', on: true },
                      { title: 'Milestone Approved', desc: 'Get notified when work is approved for payout.', on: true },
                      { title: 'Dispute Opened', desc: 'Immediate alerts when a dispute is raised.', on: true },
                      { title: 'Marketing Emails', desc: 'Receive updates about new Saviya features.', on: false },
                    ].map((item, i) => (
                      <motion.div
                        key={item.title}
                        className="flex items-center justify-between p-4 bg-surface-900 border border-surface-800 rounded-xl hover:border-surface-700 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <div>
                          <h3 className="font-medium text-white text-sm">{item.title}</h3>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                        </div>
                        <Toggle defaultChecked={item.on} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

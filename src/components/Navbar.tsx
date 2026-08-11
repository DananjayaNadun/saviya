'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, LogOut, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Workspace', href: '/' },
  { label: 'Settings', href: '/settings' },
] as const

interface NavbarProps {
  activePath: string
  isAdmin?: boolean
}

export default function Navbar({ activePath, isAdmin = false }: NavbarProps) {
  const visibleLinks = navLinks.filter(link => link.href !== '/admin' || isAdmin)
  const router = useRouter()
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // 1. Initial network check
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    // 2. Real-time network event listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 3. Fetch user avatar
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.avatar_url) {
              setAvatarUrl(data.avatar_url)
            }
          })
      }
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 inset-x-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50"
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
          <span className="font-bold text-lg tracking-tight text-white">
            Saviya
          </span>
        </Link>

        {/* Center Nav Links */}
        <ul className="flex items-center gap-1">
          {visibleLinks.map(({ label, href }) => {
            const isActive = activePath === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative px-3 py-1.5 text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-underline"
                      className="absolute inset-x-3 -bottom-px h-px bg-white"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right side: System Status & Logout */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${isOnline ? 'text-zinc-400' : 'text-red-400/80'}`}>
            <span className="relative flex h-2 w-2">
              {isOnline ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </span>
            <span className="hidden sm:inline">{isOnline ? 'System Live' : 'Offline'}</span>
          </div>

          <Link href="/settings" className="block ml-2 flex-shrink-0 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-950 rounded-full">
            {avatarUrl ? (
              <div className="h-8 w-8 rounded-full border border-surface-700 overflow-hidden">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center">
                <User className="h-4 w-4 text-zinc-500" />
              </div>
            )}
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
          >
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>
    </motion.header>
  )
}

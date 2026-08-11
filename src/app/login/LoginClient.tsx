'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [isLoadingApple, setIsLoadingApple] = useState(false)
  const [isLoadingMagic, setIsLoadingMagic] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true)
    setMessage(null)
    
    // Redirects to Google, then back to our /auth/callback route
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setIsLoadingGoogle(false)
    }
  }

  const handleAppleLogin = async () => {
    setIsLoadingApple(true)
    setMessage(null)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setIsLoadingApple(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoadingMagic(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // You can customize the email redirect here if needed
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Magic link sent! Check your email to securely log in.' 
      })
      setEmail('')
    }
    setIsLoadingMagic(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Ambient Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.05] animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.05] animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-500/10 ring-1 ring-primary-500/20 mb-6"
          >
            <Shield className="w-8 h-8 text-primary-400" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome to Saviya
          </h1>
          <p className="text-zinc-400 text-sm">
            Log in to your secure B2B milestone escrow workspace.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle || isLoadingApple || isLoadingMagic}
            className="w-full relative flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingGoogle ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Apple Login */}
          <button
            onClick={handleAppleLogin}
            disabled={isLoadingGoogle || isLoadingApple || isLoadingMagic}
            className="w-full relative flex items-center justify-center gap-3 px-4 py-3 bg-black hover:bg-zinc-900 text-white font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-800"
          >
            {isLoadingApple ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.49 3.601-2.947 1.134-1.654 1.6-3.256 1.626-3.342-.03-.013-3.136-1.205-3.176-4.79-.033-2.986 2.448-4.444 2.56-4.509-1.399-2.046-3.542-2.327-4.321-2.368-2.113-.153-4.134 1.341-5.185 1.341-.004 0-.008 0 0 0zM15.41 4.316c.833-1.008 1.393-2.408 1.24-3.816-1.206.049-2.684.8-3.54 1.832-.767.88-1.42 2.316-1.244 3.693 1.353.104 2.709-.696 3.544-1.709z" />
              </svg>
            )}
            Continue with Apple
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-surface-800"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-zinc-500 uppercase tracking-widest">
              or continue with email
            </span>
            <div className="flex-grow border-t border-surface-800"></div>
          </div>

          {/* Magic Link Login */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface-900 border border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-3 rounded-xl text-sm font-medium ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoadingGoogle || isLoadingApple || isLoadingMagic || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoadingMagic ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              ) : (
                <>
                  Send Magic Link
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}

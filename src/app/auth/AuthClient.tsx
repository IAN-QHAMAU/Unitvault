'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'

type Mode = 'signin' | 'signup'

export function AuthClient() {
  const supabase = createClient()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Always use the production URL for email redirects
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '/auth/callback'
    const isProd = window.location.hostname !== 'localhost'
    const base = isProd
      ? 'https://unit-vault.vercel.app'
      : window.location.origin
    return `${base}/auth/callback`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      })
      if (error) setError(error.message)
      else setSuccess('Check your email for a confirmation link.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/'
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={24} className="text-[#059669]" />
        </div>
        <div>
          <p className="font-semibold text-[#0F172A]">Check your inbox</p>
          <p className="text-sm text-[#64748B] mt-1">{success}</p>
          <p className="text-xs text-slate-400 mt-2">
            Click the link in the email.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode toggle */}
      <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
        {(['signin', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              mode === m
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {m === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.ac.ke"
          className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          className="w-full px-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#1E3A8A] text-white rounded-xl font-semibold text-sm hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Please wait...</>
        ) : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}
'use client'

import { useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export function AdminLoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (res.ok) {
      window.location.href = '/admin/dashboard'
    } else {
      setError(data.error || 'Access denied. Try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-300" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2.5 text-sm bg-[#0F172A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-all"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-300" htmlFor="password">
          Admin password
        </label>
        <div className="relative">
          <input
            id="password"
            type={show ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-3 py-2.5 pr-10 text-sm bg-[#0F172A] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/50 focus:border-[#1E3A8A] transition-all"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#1E3A8A] text-white rounded-xl font-semibold text-sm hover:bg-[#1E3A8A]/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Verifying...</>
          : 'Enter admin panel'
        }
      </button>
    </form>
  )
}
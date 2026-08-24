import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuthClient } from './AuthClient'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="text-[#1E3A8A] font-bold text-xl leading-none">UnitVault</div>
            <div className="text-[#64748B] text-xs mt-0.5">Your unit notes, vaulted.</div>
          </div>
        </Link>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-bold text-[#0F172A] mb-1">Welcome back</h1>
          <p className="text-sm text-[#64748B] mb-6">
            Sign in or create a free account to save your progress.
          </p>
          <AuthClient />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to use UnitVault responsibly.
        </p>
      </div>
    </div>
  )
}

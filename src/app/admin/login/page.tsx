import { AdminLoginClient } from './AdminLoginClient'
import { Shield } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLoginPage() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('uv_admin_auth')
  if (adminAuth?.value === process.env.ADMIN_PASSWORD) {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-xl leading-none">UnitVault</div>
            <div className="text-slate-500 text-xs mt-0.5">Admin Panel</div>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Admin access</h1>
          <p className="text-sm text-slate-400 mb-6">Enter your admin password to continue.</p>
          <AdminLoginClient />
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← Back to UnitVault
          </Link>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-6">
        <Shield size={26} className="text-[#1E3A8A]" />
      </div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Page not found</h1>
      <p className="text-[#64748B] text-sm mb-8 max-w-xs">
        This page doesn't exist or the unit code may have changed.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E3A8A]/90 transition-colors"
      >
        Back to UnitVault
      </Link>
    </div>
  )
}

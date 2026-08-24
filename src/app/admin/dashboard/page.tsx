import { requireAdmin } from '@/lib/adminAuth'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './AdminDashboardClient'
import { Shield, LogOut } from 'lucide-react'
import Link from 'next/link'
import { AdminSignOutButton } from './AdminSignOutButton'

export default async function AdminDashboardPage() {
  await requireAdmin()

  const supabase = await createAdminClient()

  const [
    { data: units },
    { data: resources },
    { count: userCount },
    { count: savedCount },
  ] = await Promise.all([
    supabase.from('units').select('*').order('code'),
    supabase.from('resources').select('*, units(code, name)').order('created_at', { ascending: false }),
    supabase.from('saved_resources').select('*', { count: 'exact', head: true }),
    supabase.from('saved_resources').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-base">UnitVault</span>
                <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                  Admin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-slate-400 hover:text-white transition-colors"
                target="_blank"
              >
                View site ↗
              </Link>
              <AdminSignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Units', value: units?.length ?? 0 },
            { label: 'Resources', value: resources?.length ?? 0 },
            { label: 'Total saves', value: savedCount ?? 0 },
            { label: 'Storage', value: 'Supabase' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1E293B] border border-slate-700 rounded-xl p-5">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <AdminDashboardClient
          units={units || []}
          resources={(resources || []).map((r: any) => ({
            ...r,
            unit: r.units,
          }))}
        />
      </main>
    </div>
  )
}

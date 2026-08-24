// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { VaultExplorerClient } from './VaultExplorerClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ courseCode: string }>
}

export default async function VaultPage({ params }: PageProps) {
  const { courseCode } = await params
  const decoded = decodeURIComponent(courseCode)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get unit
  const { data: unit } = await supabase
    .from('units')
    .select('*')
    .eq('code', decoded)
    .single()

  if (!unit) notFound()

  // Get resources for this unit
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('unit_id', unit.id)
    .order('created_at', { ascending: false })

  // Get saved resource IDs for this user
  let savedIds: string[] = []
  if (user) {
    const { data: saved } = await supabase
      .from('saved_resources')
      .select('resource_id')
      .eq('user_id', user.id)
    savedIds = saved?.map((s) => s.resource_id) || []
  }

  const resourcesWithUnit = (resources || []).map((r) => ({ ...r, unit }))

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E3A8A] mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          All units
        </Link>

        {/* Unit header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-1 bg-[#1E3A8A] text-white text-sm font-bold rounded-lg">
              {unit.code}
            </span>
            {unit.department && (
              <span className="text-sm text-[#64748B]">{unit.department}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mt-2">{unit.name}</h1>
          <p className="text-sm text-[#64748B] mt-1">
            {resourcesWithUnit.length} resource{resourcesWithUnit.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <VaultExplorerClient
          resources={resourcesWithUnit}
          savedIds={savedIds}
          user={user}
          courseCode={decoded}
        />
      </main>
    </div>
  )
}

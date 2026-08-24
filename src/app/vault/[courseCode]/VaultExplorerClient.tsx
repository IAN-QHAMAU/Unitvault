'use client'

import { useState, useMemo } from 'react'
import { Inbox, Upload } from 'lucide-react'
import Link from 'next/link'
import { ResourceCard } from '@/components/vault/ResourceCard'
import { SearchFilter, TypeFilter } from '@/components/vault/SearchFilter'
import type { Resource } from '@/lib/supabase/types'
import type { User } from '@supabase/supabase-js'

interface VaultExplorerClientProps {
  resources: Resource[]
  savedIds: string[]
  user: User | null
  courseCode: string
}

export function VaultExplorerClient({
  resources,
  savedIds,
  user,
  courseCode,
}: VaultExplorerClientProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAuthBanner, setShowAuthBanner] = useState(false)

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.resource_type.toLowerCase().includes(q)
      const matchType = typeFilter === 'all' || r.resource_type === typeFilter
      return matchSearch && matchType
    })
  }, [resources, search, typeFilter])

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Inbox size={28} className="text-slate-300" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">
          Nothing vaulted for {courseCode} yet
        </h3>
        <p className="text-sm text-[#64748B] max-w-xs mb-6">
          Be the first to plug your class. Check back soon — the admin will upload materials here.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E3A8A]/90 transition-colors"
        >
          Browse other courses
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Auth banner */}
      {showAuthBanner && !user && (
        <div className="mb-6 flex items-center justify-between gap-4 px-4 py-3 bg-[#EFF6FF] border border-[#1E3A8A]/20 rounded-xl">
          <p className="text-sm text-[#1E3A8A] font-medium">
            Sign in to save resources to your personal vault.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAuthBanner(false)}
              className="text-xs text-[#64748B] hover:text-slate-800"
            >
              Dismiss
            </button>
            <Link
              href="/auth"
              className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E3A8A]/90 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchFilter
          value={search}
          onChange={setSearch}
          placeholder="Search resources..."
          className="flex-1"
        />
        <TypeFilter value={typeFilter} onChange={setTypeFilter} />
      </div>

      {/* Result count */}
      <p className="text-sm text-[#64748B] mb-4">
        <span className="font-semibold text-[#0F172A]">{filtered.length}</span>{' '}
        resource{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Inbox size={32} className="text-slate-200 mb-3" />
          <p className="text-sm text-[#64748B]">No resources match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              user={user}
              isSaved={savedIds.includes(r.id)}
              onAuthRequired={() => setShowAuthBanner(true)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

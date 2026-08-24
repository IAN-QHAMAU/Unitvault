'use client'

import { useState } from 'react'
import { Bookmark, BookOpen, Inbox } from 'lucide-react'
import Link from 'next/link'
import { ResourceCard } from '@/components/vault/ResourceCard'
import type { User } from '@supabase/supabase-js'
import type { Resource } from '@/lib/supabase/types'

interface DashboardClientProps {
  user: User
  savedResources: (Resource & { savedId: string })[]
}

export function DashboardClient({ user, savedResources }: DashboardClientProps) {
  const [resources, setResources] = useState(savedResources)

  const handleUnsave = (resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId))
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#0F172A]">My Vault</h1>
          <span className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1E3A8A] text-xs font-semibold rounded-full">
            {user.email}
          </span>
        </div>
        <p className="text-[#64748B] text-sm">
          Your saved resources — ready for CAT season.
        </p>
      </div>

      {/* Saved tab label */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#E2E8F0]">
        <Bookmark size={16} className="text-[#1E3A8A]" />
        <span className="text-sm font-semibold text-[#1E3A8A]">Saved resources</span>
        <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E3A8A] text-xs font-bold rounded-full">
          {resources.length}
        </span>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Bookmark size={28} className="text-slate-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">Nothing saved yet</h3>
          <p className="text-sm text-[#64748B] max-w-xs mb-6">
            Browse units and click the bookmark icon on any resource to save it here.
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E3A8A]/90 transition-colors"
          >
            <BookOpen size={15} />
            Browse units
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              user={user}
              isSaved={true}
              onUnsave={handleUnsave}
            />
          ))}
        </div>
      )}
    </main>
  )
}

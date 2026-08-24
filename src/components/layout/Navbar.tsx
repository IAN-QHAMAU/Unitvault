'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Search, BookMarked, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  user: SupabaseUser | null
  searchQuery?: string
  onSearchChange?: (q: string) => void
  showSearch?: boolean
}

export function Navbar({ user, searchQuery = '', onSearchChange, showSearch = false }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
              <Shield size={17} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[#1E3A8A] font-bold text-lg leading-none tracking-tight">
                UnitVault
              </div>
              <div className="text-[#64748B] text-[10px] leading-none mt-0.5">
                Your unit notes, past papers all in one place.
              </div>
            </div>
          </Link>

          {/* Search */}
          {showSearch && onSearchChange && (
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by course code..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
                />
              </div>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] rounded-lg transition-all"
                >
                  <BookMarked size={16} />
                  <span className="hidden sm:inline">My Vault</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                      <span className="text-[#1E3A8A] text-xs font-bold">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                  </button>

                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <div className="text-xs text-[#64748B] truncate">{user.email}</div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#1E3A8A] border border-[#1E3A8A] rounded-lg hover:bg-[#EFF6FF] transition-all"
              >
                <User size={15} />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

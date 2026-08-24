'use client'

import { LogOut } from 'lucide-react'

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' })
        window.location.href = '/admin/login'
      }}
      className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
    >
      <LogOut size={14} />
      Sign out
    </button>
  )
}
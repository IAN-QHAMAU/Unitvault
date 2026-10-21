import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const ADMIN_COOKIE = 'uv_admin_auth'

// Constant-time check against ADMIN_PASSWORD. Fails closed when the env var
// is missing, so an unset password can never match a missing cookie.
export function matchesAdminPassword(value: string | undefined | null) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !value) return false
  const a = createHash('sha256').update(value).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

// An admin is either:
// 1. holding the uv_admin_auth cookie from /admin/login (existing flow), or
// 2. signed in to their UnitVault account with profiles.role = 'admin'
export async function isAdmin() {
  const cookieStore = await cookies()
  if (matchesAdminPassword(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return true
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  // Same lookup /api/admin/auth uses, so both paths agree on who is an admin
  const admin = await createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle() as { data: { role: string } | null }

  return profile?.role === 'admin'
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect('/admin/login')
  }
}

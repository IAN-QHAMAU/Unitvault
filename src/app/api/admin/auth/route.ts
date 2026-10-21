import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_COOKIE, matchesAdminPassword } from '@/lib/adminAuth'

// listUsers is paginated, so keep paging until the email turns up or the
// pages run out (a single page stops finding admins past the first 1000 users)
async function findUserByEmail(supabase: SupabaseClient, email: string) {
  const perPage = 1000
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) return { user: null, error }
    const user = data.users.find((u) => u.email?.toLowerCase() === email)
    if (user || data.users.length < perPage) return { user: user ?? null, error: null }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 1. Check admin password matches env
    if (!matchesAdminPassword(password)) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    // 2. Set up service role client
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 3. Find user by email
    const { user, error: listError } = await findUserByEmail(
      supabase,
      String(email ?? '').trim().toLowerCase()
    )

    if (listError) {
      return NextResponse.json({ error: 'Server error. Try again.' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Email not recognised.' }, { status: 401 })
    }

    // 4. Check profile role
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfileError || !userProfile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 401 })
    }

    if (userProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have admin access.' },
        { status: 403 }
      )
    }

    // 5. All checks passed — set the auth cookie
    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_COOKIE, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'strict',
    })
    return response

  } catch {
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}

export async function DELETE() {
  // Admins can also be signed in through their UnitVault account, so end that
  // session in this browser too or /admin/login would send them straight back
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'local' })

  const response = NextResponse.json({ ok: true })
  response.cookies.delete(ADMIN_COOKIE)
  return response
}
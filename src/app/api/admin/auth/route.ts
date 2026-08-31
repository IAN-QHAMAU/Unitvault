import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 1. Check admin password matches env
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
    }

    // 2. Set up service role client
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 3. Find user by email
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listError) {
      return NextResponse.json({ error: 'Server error. Try again.' }, { status: 500 })
    }

    const user = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    )

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
    response.cookies.set('uv_admin_auth', password, {
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
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('uv_admin_auth')
  return response
}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

async function requireAdminRequest() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('uv_admin_auth')
  return auth?.value === process.env.ADMIN_PASSWORD
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json()
  const code = String(payload.code || '').trim().toUpperCase()
  const name = String(payload.name || '').trim()
  const department = String(payload.department || '').trim() || null
  const year = payload.year ? Number(payload.year) : null
  const semester = payload.semester ? Number(payload.semester) : null

  if (!code || !name) {
    return NextResponse.json({ error: 'Unit code and name are required' }, { status: 400 })
  }

  const supabase = (await createAdminClient()) as any
  const { data: university, error: universityErr } = await supabase
    .from('universities')
    .select('id')
    .eq('short_name', 'UON')
    .maybeSingle()

  if (universityErr) {
    return NextResponse.json({ error: universityErr.message }, { status: 400 })
  }

  let universityId = university?.id as string | undefined

  if (!universityId) {
    const { data: createdUniversity, error: createUniversityErr } = await supabase
      .from('universities')
      .insert({
        name: 'University of Nairobi',
        short_name: 'UON',
      })
      .select('id')
      .single()

    if (createUniversityErr) {
      return NextResponse.json({ error: createUniversityErr.message }, { status: 400 })
    }

    universityId = createdUniversity.id as string
  }

  const { data: unit, error: unitErr } = await supabase
    .from('units')
    .insert({
      code,
      name,
      department,
      year,
      semester,
      university_id: universityId,
    })
    .select('*')
    .single()

  if (unitErr) {
    return NextResponse.json({ error: unitErr.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, unit })
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'Unit id is required' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { error } = await supabase.from('units').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
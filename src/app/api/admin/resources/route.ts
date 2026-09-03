import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

async function requireAdminRequest() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('uv_admin_auth')
  return auth?.value === process.env.ADMIN_PASSWORD
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { unitId, title, resourceType, fileUrl, filePath } = await request.json()

    if (!unitId || !title || !resourceType || !fileUrl || !filePath) {
      return NextResponse.json(
        { error: 'Unit, title, resource type, file URL, and file path are required' },
        { status: 400 }
      )
    }

    const supabase = await createAdminClient()

    const { data: resource, error: resourceErr } = await supabase
      .from('resources')
      .insert({
        unit_id: unitId,
        title,
        file_url: fileUrl,
        file_path: filePath,
        resource_type: resourceType,
      } as any)
      .select('*')
      .single() as any

    if (resourceErr) {
      return NextResponse.json({ error: resourceErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, resource })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error while saving resource metadata' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdminRequest())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Resource id is required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: resource, error: resourceErr } = await supabase
      .from('resources')
      .select('file_path')
      .eq('id', id)
      .maybeSingle() as any

    if (resourceErr) {
      return NextResponse.json({ error: resourceErr.message }, { status: 400 })
    }

    if (resource?.file_path) {
      await supabase.storage
        .from('unit-vault-materials')
        .remove([resource.file_path])
    }

    const { error } = await supabase.from('resources').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error while deleting resource' },
      { status: 500 }
    )
  }
}
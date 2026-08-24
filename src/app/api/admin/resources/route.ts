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

    const formData = await request.formData()
    const unitId = String(formData.get('unitId') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const resourceType = String(formData.get('resourceType') || '').trim()
    const file = formData.get('file') as File | null

    if (!unitId || !title || !resourceType || !file) {
      return NextResponse.json({ error: 'Unit, title, resource type and file are required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const ext = file.name.split('.').pop() || 'pdf'
    const filePath = `${unitId}/${Date.now()}.${ext}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await supabase.storage
      .from('unit-vault-materials')
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      })

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 400 })
    }

    const { data: publicUrlData } = supabase.storage
      .from('unit-vault-materials')
      .getPublicUrl(filePath)

    const { data: resource, error: resourceErr } = await supabase
      .from('resources')
      .insert({
        unit_id: unitId,
        title,
        file_url: publicUrlData.publicUrl,
        file_path: filePath,
        resource_type: resourceType,
      })
      .select('*')
      .single()

    if (resourceErr) {
      return NextResponse.json({ error: resourceErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, resource })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unexpected server error while uploading resource' },
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
      .maybeSingle()

    if (resourceErr) {
      return NextResponse.json({ error: resourceErr.message }, { status: 400 })
    }

    if (resource?.file_path) {
      await supabase.storage.from('unit-vault-materials').remove([resource.file_path])
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
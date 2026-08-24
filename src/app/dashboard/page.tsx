import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch saved resources with their unit data
  const { data: savedData } = await supabase
    .from('saved_resources')
    .select(`
      id,
      saved_at,
      resource_id,
      resources (
        id, title, file_url, resource_type, uploaded_by, created_at, unit_id,
        units ( id, code, name, department, year, semester )
      )
    `)
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  // Flatten saved resources
  const savedResources = (savedData || [])
    .map((s: any) => ({
      savedId: s.id,
      ...s.resources,
      unit: s.resources?.units,
    }))
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar user={user} />
      <DashboardClient
        user={user}
        savedResources={savedResources}
      />
    </div>
  )
}

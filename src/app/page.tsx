import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { HomeClient } from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: units } = await supabase
    .from('units')
    .select('*')
    .order('code', { ascending: true })

  const { data: resourceCounts } = await supabase
    .from('resources')
    .select('unit_id') as { data: Array<{ unit_id: string }> | null }

  const countMap: Record<string, number> = {}
  resourceCounts?.forEach((r) => {
    countMap[r.unit_id] = (countMap[r.unit_id] || 0) + 1
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar user={user} />
      <HomeClient units={units || []} resourceCountMap={countMap} />
    </div>
  )
}

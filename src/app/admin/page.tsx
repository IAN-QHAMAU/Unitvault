import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'

export default async function AdminPage() {
  if (await isAdmin()) {
    redirect('/admin/dashboard')
  } else {
    redirect('/admin/login')
  }
}

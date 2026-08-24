import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('uv_admin_auth')
  if (auth?.value === process.env.ADMIN_PASSWORD) {
    redirect('/admin/dashboard')
  } else {
    redirect('/admin/login')
  }
}

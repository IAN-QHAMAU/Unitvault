import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('uv_admin_auth')
  if (auth?.value !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login')
  }
}

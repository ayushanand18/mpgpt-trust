import { createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'

export async function getServerUser() {
  const cookieStore = cookies()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

export async function getUserWithRole() {
  const user = await getServerUser()
  
  if (!user) {
    return null
  }

  // Fetch user role from database
  const result = await sql`
    SELECT role, member_id FROM lms.users WHERE id = ${user.id}
  `

  if (result.length === 0) {
    return { user, role: null, memberId: null }
  }

  return {
    user,
    role: result[0].role,
    memberId: result[0].member_id
  }
}

export function checkRole(userRole: string | null, allowedRoles: string[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

export async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  // Verify token with Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  return user
}

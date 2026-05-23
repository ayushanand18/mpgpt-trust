import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { sql } from '@/lib/db'

function createStatelessServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No cookie persistence is needed for bearer-token verification.
        },
      },
    }
  )
}

export async function getServerUser() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // This can run in contexts where response cookies cannot be mutated.
          }
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

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

  const result = await sql`
    SELECT role, member_id FROM lms.users WHERE id = ${user.id}
  `

  if (result.length === 0) {
    return { user, role: null, memberId: null }
  }

  return {
    user,
    role: result[0].role,
    memberId: result[0].member_id,
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
  const supabase = createStatelessServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  return user
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Library } from '@/types'
import { getServerUser } from '@/lib/auth'
import { ROLES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { LibraryName, FetchAdminMappings } = body

    let query = sql<Library[]>`SELECT * FROM lms.libraries WHERE 1=1`

    if (LibraryName) {
      query = sql<Library[]>`${query} AND name ILIKE ${`%${LibraryName}%`}`
    }

    const libraries = await query

    const result = libraries

    if (FetchAdminMappings) {
      // Fetch admin mappings for each library, ensuring the users still have admin roles
      for (const library of libraries) {
        const admins = await sql`
          SELECT alm.member_id 
          FROM lms.admin_library_mapping alm 
          JOIN lms.users u ON alm.member_id = u.member_id
          WHERE alm.library_id = ${library.id}
          AND (u.role = ${ROLES.ADMIN} OR u.role = ${ROLES.SUPERUSER})
        `
        ;(library as Library).admins = admins.map((a: any) => a.member_id);
      }
    }

    return NextResponse.json({
      Error: null,
      Data: { Libraries: result }
    })
  } catch (error) {
    console.error('Error fetching libraries:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

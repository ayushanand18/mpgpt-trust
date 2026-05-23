import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserWithRole } from '@/lib/auth'
import { ROLES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    // Only superuser can add admin-library mappings
    if (authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.SUPERUSER} can add admin-library mappings` }, Data: null },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { LibraryId, MemberId } = body

    if (!LibraryId || !MemberId) {
      return NextResponse.json(
        { Error: { Message: 'Missing required fields' }, Data: null },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO lms.admin_library_mapping (library_id, member_id)
      VALUES (${LibraryId}, ${MemberId})
      RETURNING *
    `

    return NextResponse.json({
      Error: null,
      Data: { Mapping: result[0] }
    })
  } catch (error) {
    console.error('Error adding admin library mapping:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

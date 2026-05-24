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

    // Verify that the user being assigned is actually an admin or superuser
    const users = await sql`
      SELECT role FROM lms.users WHERE member_id = ${MemberId}
    `
    if (users.length === 0) {
      return NextResponse.json(
        { Error: { Message: 'User not found' }, Data: null },
        { status: 404 }
      )
    }

    const targetUserRole = users[0].role
    if (targetUserRole !== ROLES.ADMIN && targetUserRole !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `User with member_id ${MemberId} is not an admin or superuser` }, Data: null },
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

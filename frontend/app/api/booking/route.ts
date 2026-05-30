import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Booking } from '@/lib/db-types'
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

    const body = await request.json()
    const { StartTime, EndTime, LibraryId, Purpose } = body
    let { MemberId } = body

    // Non-admin/superuser users can only create bookings for themselves
    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER) {
      if (!authUser.memberId) {
        return NextResponse.json(
          { Error: { Message: 'Forbidden: No member account found' }, Data: null },
          { status: 403 }
        )
      }
      MemberId = authUser.memberId
    }

    if (!StartTime || !EndTime || !LibraryId || !MemberId) {
      return NextResponse.json(
        { Error: { Message: 'Missing required fields' }, Data: null },
        { status: 400 }
      )
    }

    const result = await sql<Booking[]>`
      INSERT INTO lms.bookings (library_id, member_id, start_time, end_time, status, purpose, created_at)
      VALUES (${LibraryId}, ${MemberId}, ${StartTime}, ${EndTime}, 'active', ${Purpose || null}, NOW())
      RETURNING *
    `

    return NextResponse.json({
      Error: null,
      Data: { Booking: result[0] }
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Booking } from '@/lib/db-types'
import { getUserWithRole } from '@/lib/auth'

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
    const { LibraryId, StartTime, EndTime } = body

    let query = sql<Booking[]>`
      SELECT b.*, u.name as user_name 
      FROM lms.bookings b
      LEFT JOIN lms.users u ON b.member_id = u.member_id
      WHERE 1=1
    `

    if (LibraryId) {
      query = sql<Booking[]>`${query} AND b.library_id = ${LibraryId}`
    }

    if (StartTime) {
      query = sql<Booking[]>`${query} AND b.start_time >= ${StartTime}`
    }

    if (EndTime) {
      query = sql<Booking[]>`${query} AND b.end_time <= ${EndTime}`
    }

    const result = await query

    return NextResponse.json({
      Error: null,
      Data: { Bookings: result }
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

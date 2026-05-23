import { NextResponse } from 'next/server'

import { sql } from '@/lib/db'

export async function GET() {
  try {
    const [bookingCountResult, memberCountResult] = await Promise.all([
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text AS count
        FROM lms.bookings
        WHERE start_time::date = CURRENT_DATE
      `,
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text AS count
        FROM lms.users
      `,
    ])

    return NextResponse.json({
      Error: null,
      Data: {
        TodayBookings: Number(bookingCountResult[0]?.count ?? 0),
        MemberCount: Number(memberCountResult[0]?.count ?? 0),
      },
    })
  } catch (error) {
    console.error('Error fetching landing summary:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

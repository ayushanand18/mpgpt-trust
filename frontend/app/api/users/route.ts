import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { User } from '@/lib/db-types'
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

    // Only admin and superuser can search users
    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.ADMIN} and ${ROLES.SUPERUSER} can search users` }, Data: null },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { MemberIds, Emails, PhoneNumbers } = body

    let query = sql<User[]>`
      SELECT u.*, COALESCE(c.value, 0) as credits
      FROM lms.users u
      LEFT JOIN lms.credits c ON u.member_id = c.entity_id AND c.entity_type = 'member'
      WHERE 1=1
    `
    const params: (string | string[])[] = []

    if (MemberIds && MemberIds.length > 0) {
      query = sql<User[]>`${query} AND u.member_id = ANY(${MemberIds})`
    }

    if (Emails && Emails.length > 0) {
      query = sql<User[]>`${query} AND u.email = ANY(${Emails})`
    }

    if (PhoneNumbers && PhoneNumbers.length > 0) {
      query = sql<User[]>`${query} AND u.phone_number = ANY(${PhoneNumbers})`
    }

    const result = await query

    return NextResponse.json({
      Error: null,
      Data: { Users: result }
    })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

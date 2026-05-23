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

    // Only superuser can create users
    if (authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.SUPERUSER} can create users` }, Data: null },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { Id, Name, Email, PhoneNumber, UserName, Role } = body

    if (!Id || !Name || !UserName || !Role) {
      return NextResponse.json(
        { Error: { Message: 'Missing required fields' }, Data: null },
        { status: 400 }
      )
    }

    const result = await sql<User[]>`
      INSERT INTO lms.users (id, name, username, role, email, phone_number, created_at)
      VALUES (${Id}, ${Name}, ${UserName}, ${Role}, ${Email || null}, ${PhoneNumber || null}, NOW())
      RETURNING *
    `

    return NextResponse.json({
      Error: null,
      Data: { User: result[0] }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { User } from '@/lib/db-types'
import { getUserWithRole } from '@/lib/auth'
import { ROLES } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    const { id } = await params

    // Users can only fetch their own data, admins/superuser can fetch any
    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER && authUser.user.id !== id) {
      return NextResponse.json(
        { Error: { Message: 'Forbidden' }, Data: null },
        { status: 403 }
      )
    }

    const result = await sql<User[]>`
      SELECT * FROM lms.users WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { Error: { Message: 'User not found' }, Data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({
      Error: null,
      Data: { User: result[0] }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    const { id } = await params

    // Users can only update their own data, admins/superuser can update any
    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER && authUser.user.id !== id) {
      return NextResponse.json(
        { Error: { Message: 'Forbidden' }, Data: null },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { Name, Email, PhoneNumber, MemberId, Role } = body

    // Only superuser can change role
    if (Role && authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.SUPERUSER} can change role` }, Data: null },
        { status: 403 }
      )
    }

    const result = await sql<User[]>`
      UPDATE lms.users
      SET 
        name = COALESCE(${Name || null}, name),
        email = COALESCE(${Email || null}, email),
        phone_number = COALESCE(${PhoneNumber || null}, phone_number),
        member_id = COALESCE(${MemberId || null}, member_id),
        role = COALESCE(${Role || null}, role),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { Error: { Message: 'User not found' }, Data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({
      Error: null,
      Data: { User: result[0] }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

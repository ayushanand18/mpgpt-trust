import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Credit, CreditHistory } from '@/lib/db-types'
import { getUserWithRole } from '@/lib/auth'
import { ROLES } from '@/lib/constants'

export async function GET(
  _request: NextRequest,
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

    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER && authUser.user.id !== id) {
      return NextResponse.json(
        { Error: { Message: 'Forbidden' }, Data: null },
        { status: 403 }
      )
    }

    const users = await sql<{ member_id: string | null }[]>`
      SELECT member_id FROM lms.users WHERE id = ${id}
    `

    const entityId = users[0]?.member_id || id

    const result = await sql<Credit[]>`
      SELECT * FROM lms.credits WHERE entity_id = ${entityId} AND entity_type = 'member'
    `

    const history = await sql<CreditHistory[]>`
      SELECT *
      FROM lms.credits_history
      WHERE entity_id = ${entityId} AND entity_type = 'member'
      ORDER BY created_at DESC
    `

    const credits = result.length > 0 ? result[0].value : 0

    return NextResponse.json({
      Error: null,
      Data: { CurrentCredits: credits, Credits: credits, History: history },
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

export async function POST(
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

    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.ADMIN} and ${ROLES.SUPERUSER} can add credits` }, Data: null },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { CreditsAmount, MemberId, RefNumber, Comment } = body

    if (!CreditsAmount || !MemberId) {
      return NextResponse.json(
        { Error: { Message: 'Missing required fields' }, Data: null },
        { status: 400 }
      )
    }

    const updateResult = await sql<Credit[]>`
      INSERT INTO lms.credits (entity_id, entity_type, value, created_at, created_by, created_by_type)
      VALUES (${MemberId}, 'member', ${CreditsAmount}, NOW(), ${authUser.user.id}, 'admin')
      ON CONFLICT (entity_id, entity_type)
      DO UPDATE SET
        value = lms.credits.value + ${CreditsAmount},
        updated_at = NOW(),
        updated_by = ${authUser.user.id},
        updated_by_type = 'admin'
      RETURNING *
    `

    await sql`
      INSERT INTO lms.credits_history (entity_id, entity_type, value, comments, reason, created_at)
      VALUES (${MemberId}, 'member', ${CreditsAmount}, ${Comment || ''}, ${RefNumber || ''}, NOW())
    `

    return NextResponse.json({
      Error: null,
      Data: { Credits: updateResult[0].value, CurrentCredits: updateResult[0].value },
    })
  } catch (error) {
    console.error('Error adding credits:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

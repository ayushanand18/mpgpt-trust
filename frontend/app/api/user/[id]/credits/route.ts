import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Credit } from '@/lib/db-types'
import { getUserWithRole } from '@/lib/auth'
import { ROLES } from '@/lib/constants'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    const { id } = params

    // Users can only fetch their own credits, admins/superuser can fetch any
    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER && authUser.user.id !== id) {
      return NextResponse.json(
        { Error: { Message: 'Forbidden' }, Data: null },
        { status: 403 }
      )
    }

    const result = await sql<Credit[]>`
      SELECT * FROM lms.credits WHERE entity_id = ${id} AND entity_type = 'member'
    `

    const credits = result.length > 0 ? result[0].value : 0

    return NextResponse.json({
      Error: null,
      Data: { Credits: credits }
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
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    // Only admin and superuser can add credits
    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.ADMIN} and ${ROLES.SUPERUSER} can add credits` }, Data: null },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { CreditsAmount, MemberId, RefNumber, Comment } = body

    if (!CreditsAmount || !MemberId) {
      return NextResponse.json(
        { Error: { Message: 'Missing required fields' }, Data: null },
        { status: 400 }
      )
    }

    // Update credits
    const updateResult = await sql<Credit[]>`
      INSERT INTO lms.credits (entity_id, entity_type, value, created_at, created_by, created_by_type)
      VALUES (${MemberId}, 'member', ${CreditsAmount}, NOW(), ${id}, 'admin')
      ON CONFLICT (entity_id, entity_type) 
      DO UPDATE SET 
        value = credits.value + ${CreditsAmount},
        updated_at = NOW(),
        updated_by = ${id},
        updated_by_type = 'admin'
      RETURNING *
    `

    // Add to credits history
    await sql`
      INSERT INTO lms.credits_history (entity_id, entity_type, value, comments, reason, created_at)
      VALUES (${MemberId}, 'member', ${CreditsAmount}, ${Comment || ''}, ${RefNumber || ''}, NOW())
    `

    return NextResponse.json({
      Error: null,
      Data: { Credits: updateResult[0].value }
    })
  } catch (error) {
    console.error('Error adding credits:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

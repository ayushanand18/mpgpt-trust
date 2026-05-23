import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Library } from '@/lib/db-types'
import { getUserWithRole } from '@/lib/auth'
import { ROLES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required
    const result = await sql<Library[]>`
      SELECT * FROM lms.libraries
    `

    return NextResponse.json({
      Error: null,
      Data: { Libraries: result }
    })
  } catch (error) {
    console.error('Error fetching libraries:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    // Only superuser can create libraries
    if (authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.SUPERUSER} can create libraries` }, Data: null },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { Name, Latitude, Longitude, Address, Remarks, Status } = body

    if (!Name || !Latitude || !Longitude || !Address || !Status) {
      return NextResponse.json(
        { Error: { Message: 'Missing required fields' }, Data: null },
        { status: 400 }
      )
    }

    const result = await sql<Library[]>`
      INSERT INTO lms.libraries (name, latitude, longitude, address, remarks, status)
      VALUES (${Name}, ${Latitude}, ${Longitude}, ${Address}, ${Remarks || 0}, ${Status})
      RETURNING *
    `

    return NextResponse.json({
      Error: null,
      Data: { Library: result[0] }
    })
  } catch (error) {
    console.error('Error creating library:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    // Only superuser can edit libraries
    if (authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.SUPERUSER} can edit libraries` }, Data: null },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { Id, Name, Address, Latitude, Longitude } = body

    if (!Id) {
      return NextResponse.json(
        { Error: { Message: 'Missing library ID' }, Data: null },
        { status: 400 }
      )
    }

    const result = await sql<Library[]>`
      UPDATE lms.libraries
      SET 
        name = COALESCE(${Name || null}, name),
        address = COALESCE(${Address || null}, address),
        latitude = COALESCE(${Latitude || null}, latitude),
        longitude = COALESCE(${Longitude || null}, longitude)
      WHERE id = ${Id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { Error: { Message: 'Library not found' }, Data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({
      Error: null,
      Data: { Library: result[0] }
    })
  } catch (error) {
    console.error('Error updating library:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

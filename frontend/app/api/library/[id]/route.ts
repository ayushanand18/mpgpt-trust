import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Library } from '@/lib/db-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Public endpoint - no auth required
    const { id } = await params

    const result = await sql<Library[]>`
      SELECT * FROM lms.libraries WHERE id = ${id}
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
    console.error('Error fetching library:', error)
    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

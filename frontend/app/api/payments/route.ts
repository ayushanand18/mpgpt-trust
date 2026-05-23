import { NextRequest, NextResponse } from 'next/server'
import { getUserWithRole } from '@/lib/auth'
import { sql } from '@/lib/db'
import { Payment } from '@/lib/db-types'
import {
  PAYMENT_STATUSES,
  ROLES,
  calculateCreditsFromPayment,
} from '@/lib/constants'
import {
  assertPaymentProofKeyOwnership,
  buildPaymentProofKey,
  createPaymentProofSignedUrl,
  deletePaymentProof,
  uploadPaymentProof,
} from '@/lib/payment-proof-storage'

const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUSES)

type PaymentRow = Payment & {
  student_name: string | null
}

async function attachProofUrls(rows: PaymentRow[]) {
  return rows.map((payment) => ({
    ...payment,
    proof_url: payment.file_path ? createPaymentProofSignedUrl(payment.file_path) : null,
  }))
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserWithRole()
    if (!authUser) {
      return NextResponse.json(
        { Error: { Message: 'Unauthorized' }, Data: null },
        { status: 401 }
      )
    }

    const statusFilter = request.nextUrl.searchParams.get('status')
    if (statusFilter && !PAYMENT_STATUS_VALUES.includes(statusFilter as typeof PAYMENT_STATUS_VALUES[number])) {
      return NextResponse.json(
        { Error: { Message: 'Invalid status filter' }, Data: null },
        { status: 400 }
      )
    }

    const isAdmin = authUser.role === ROLES.ADMIN || authUser.role === ROLES.SUPERUSER

    let result: PaymentRow[]
    if (isAdmin) {
      result = await sql<PaymentRow[]>`
        SELECT p.*, u.name AS student_name
        FROM lms.payments p
        JOIN lms.users u ON u.id::text = p.student_user_id
        WHERE ${statusFilter ? sql`p.status = ${statusFilter}` : sql`TRUE`}
        ORDER BY p.created_at DESC
      `
    } else {
      result = await sql<PaymentRow[]>`
        SELECT p.*, u.name AS student_name
        FROM lms.payments p
        JOIN lms.users u ON u.id::text = p.student_user_id
        WHERE p.student_user_id = ${authUser.user.id}::text
          AND ${statusFilter ? sql`p.status = ${statusFilter}` : sql`TRUE`}
        ORDER BY p.created_at DESC
      `
    }

    for (const payment of result) {
      if (!isAdmin) {
        assertPaymentProofKeyOwnership(payment.file_path, authUser.user.id)
      }
    }

    const payments = await attachProofUrls(result)

    return NextResponse.json({
      Error: null,
      Data: { Payments: payments },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
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

    if (!authUser.memberId) {
      return NextResponse.json(
        { Error: { Message: 'Member ID is required before submitting a payment proof' }, Data: null },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const amountPaid = Number(formData.get('amountPaid'))
    const utrNumber = String(formData.get('utrNumber') ?? '').trim()
    const paymentDate = String(formData.get('paymentDate') ?? '').trim()
    const studentNote = String(formData.get('studentNote') ?? '').trim()
    const proof = formData.get('proof')

    if (!Number.isFinite(amountPaid) || amountPaid <= 0 || !utrNumber || !paymentDate || !(proof instanceof File) || proof.size === 0) {
      return NextResponse.json(
        { Error: { Message: 'Missing required fields' }, Data: null },
        { status: 400 }
      )
    }

    const creditsToAdd = calculateCreditsFromPayment(amountPaid)
    if (creditsToAdd <= 0) {
      return NextResponse.json(
        { Error: { Message: 'Payment amount does not convert to any credits' }, Data: null },
        { status: 400 }
      )
    }

    const filePath = buildPaymentProofKey(authUser.user.id, proof.name)
    assertPaymentProofKeyOwnership(filePath, authUser.user.id)
    await uploadPaymentProof(filePath, proof)

    try {
      const insertResult = await sql<PaymentRow[]>`
        INSERT INTO lms.payments (
          student_user_id,
          student_member_id,
          amount_paid,
          utr_number,
          payment_date,
          file_path,
          status,
          student_note,
          credits_to_add,
          created_at,
          updated_at
        )
        VALUES (
          ${authUser.user.id},
          ${authUser.memberId},
          ${amountPaid},
          ${utrNumber},
          ${paymentDate},
          ${filePath},
          ${PAYMENT_STATUSES.AUTH_PENDING},
          ${studentNote || null},
          ${creditsToAdd},
          NOW(),
          NOW()
        )
        RETURNING *, ${authUser.user.user_metadata.full_name ?? null}::text AS student_name
      `

      const [payment] = await attachProofUrls(insertResult)

      return NextResponse.json(
        {
          Error: null,
          Data: { Payment: payment },
        },
        { status: 201 }
      )
    } catch (dbError) {
      await deletePaymentProof(filePath)
      throw dbError
    }
  } catch (error) {
    console.error('Error creating payment request:', error)
    return NextResponse.json(
      { Error: { Message: error instanceof Error ? error.message : 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

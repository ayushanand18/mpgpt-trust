import { NextRequest, NextResponse } from 'next/server'
import { getUserWithRole } from '@/lib/auth'
import { sql } from '@/lib/db'
import { Payment, Credit } from '@/lib/db-types'
import {
  PAYMENT_STATUSES,
  ROLES,
} from '@/lib/constants'
import { createPaymentProofSignedUrl } from '@/lib/payment-proof-storage'

type PaymentRow = Payment & {
  student_name: string | null
}

type HttpError = Error & {
  status: number
}

function createHttpError(status: number, message: string) {
  const error = new Error(message) as HttpError
  error.status = status
  return error
}

async function getPaymentForResponse(id: string) {
  const rows = await sql<PaymentRow[]>`
    SELECT p.*, u.name AS student_name
    FROM lms.payments p
    JOIN lms.users u ON u.id::text = p.student_user_id
    WHERE p.id = ${id}
  `

  if (rows.length === 0) {
    return null
  }

  const payment = rows[0]
  return {
    ...payment,
    proof_url: payment.file_path ? createPaymentProofSignedUrl(payment.file_path) : null,
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

    if (authUser.role !== ROLES.ADMIN && authUser.role !== ROLES.SUPERUSER) {
      return NextResponse.json(
        { Error: { Message: `Forbidden: Only ${ROLES.ADMIN} and ${ROLES.SUPERUSER} can review payments` }, Data: null },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const action = body.Action
    const reviewComment = String(body.ReviewComment ?? '').trim()

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { Error: { Message: 'Invalid action' }, Data: null },
        { status: 400 }
      )
    }

    if (action === 'reject' && !reviewComment) {
      return NextResponse.json(
        { Error: { Message: 'Review comment is required for rejection' }, Data: null },
        { status: 400 }
      )
    }

    await sql.begin(async (tx) => {
      const payments = await tx<Payment[]>`
        SELECT * FROM lms.payments
        WHERE id = ${id}
        FOR UPDATE
      `

      if (payments.length === 0) {
        throw createHttpError(404, 'Payment not found')
      }

      const payment = payments[0]

      if (action === 'approve') {
        if (payment.status === PAYMENT_STATUSES.APPROVED) {
          return
        }

        if (payment.status !== PAYMENT_STATUSES.AUTH_PENDING) {
          throw createHttpError(409, 'Only pending payments can be approved')
        }

        await tx<Payment[]>`
          UPDATE lms.payments
          SET
            status = ${PAYMENT_STATUSES.APPROVED},
            review_comment = ${reviewComment || null},
            reviewed_by = ${authUser.user.id},
            reviewed_at = NOW(),
            updated_at = NOW()
          WHERE id = ${id}
        `

        await tx<Credit[]>`
          INSERT INTO lms.credits (entity_id, entity_type, value, created_at, created_by, created_by_type)
          VALUES (${payment.student_member_id}, 'member', ${payment.credits_to_add}, NOW(), ${authUser.user.id}, 'admin')
          ON CONFLICT (entity_id, entity_type)
          DO UPDATE SET
            value = lms.credits.value + ${payment.credits_to_add},
            updated_at = NOW(),
            updated_by = ${authUser.user.id},
            updated_by_type = 'admin'
        `

        await tx`
          INSERT INTO lms.credits_history (entity_id, entity_type, value, comments, reason, created_at)
          VALUES (
            ${payment.student_member_id},
            'member',
            ${payment.credits_to_add},
            ${`Payment ${payment.id}`},
            ${`QR payment UTR ${payment.utr_number}`},
            NOW()
          )
        `

        return
      }

      if (payment.status === PAYMENT_STATUSES.REJECTED) {
        return
      }

      if (payment.status !== PAYMENT_STATUSES.AUTH_PENDING) {
        throw createHttpError(409, 'Only pending payments can be rejected')
      }

      await tx<Payment[]>`
        UPDATE lms.payments
        SET
          status = ${PAYMENT_STATUSES.REJECTED},
          review_comment = ${reviewComment},
          reviewed_by = ${authUser.user.id},
          reviewed_at = NOW(),
          updated_at = NOW()
        WHERE id = ${id}
      `
    })

    const payment = await getPaymentForResponse(id)
    if (!payment) {
      return NextResponse.json(
        { Error: { Message: 'Payment not found' }, Data: null },
        { status: 404 }
      )
    }

    return NextResponse.json({
      Error: null,
      Data: { Payment: payment },
    })
  } catch (error) {
    console.error('Error reviewing payment:', error)

    if (typeof error === 'object' && error && 'status' in error && 'message' in error) {
      return NextResponse.json(
        { Error: { Message: String((error as HttpError).message) }, Data: null },
        { status: Number((error as HttpError).status) }
      )
    }

    return NextResponse.json(
      { Error: { Message: 'Internal server error' }, Data: null },
      { status: 500 }
    )
  }
}

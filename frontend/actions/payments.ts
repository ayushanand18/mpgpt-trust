import { createClient } from "@/lib/supabase/client"
import type { PaymentRequest } from "@/types"

const supabase = createClient()

function normalizePayment(payment: unknown): PaymentRequest {
  return {
    id: payment.id,
    studentUserId: payment.student_user_id,
    studentMemberId: payment.student_member_id,
    studentName: payment.student_name ?? "",
    amountPaid: Number(payment.amount_paid),
    utrNumber: payment.utr_number,
    paymentDate: payment.payment_date,
    filePath: payment.file_path,
    proofUrl: payment.proof_url ?? null,
    status: payment.status,
    studentNote: payment.student_note ?? "",
    reviewComment: payment.review_comment ?? "",
    creditsToAdd: Number(payment.credits_to_add ?? 0),
    reviewedBy: payment.reviewed_by ?? "",
    reviewedAt: payment.reviewed_at ?? "",
    createdAt: payment.created_at,
    updatedAt: payment.updated_at,
  }
}

export async function createPaymentRequest(formData: FormData) {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (!session || error) {
    throw new Error('No active session found')
  }

  const res = await fetch('/api/payments', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const respJson = await res.json().catch(() => null)
    throw new Error(respJson?.Error?.Message || `Failed to create payment request: ${res.status}`)
  }

  const respJson = await res.json()
  return normalizePayment(respJson.Data.Payment)
}

export async function fetchPayments(status?: string) {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (!session || error) {
    throw new Error('No active session found')
  }

  const query = status ? `?status=${encodeURIComponent(status)}` : ""
  const res = await fetch(`/api/payments${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const respJson = await res.json().catch(() => null)
    throw new Error(respJson?.Error?.Message || `Failed to fetch payments: ${res.status}`)
  }

  const respJson = await res.json()
  return (respJson.Data.Payments ?? []).map(normalizePayment)
}

export async function reviewPayment(
  id: string,
  action: 'approve' | 'reject',
  reviewComment?: string
) {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (!session || error) {
    throw new Error('No active session found')
  }

  const res = await fetch(`/api/payments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Action: action,
      ReviewComment: reviewComment ?? "",
    }),
  })

  if (!res.ok) {
    const respJson = await res.json().catch(() => null)
    throw new Error(respJson?.Error?.Message || `Failed to review payment: ${res.status}`)
  }

  const respJson = await res.json()
  return normalizePayment(respJson.Data.Payment)
}

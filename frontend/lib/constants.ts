export const ROLES = {
  SUPERUSER: 'superuser',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const PAYMENT_CREDIT_RATE = 10
export const PAYMENT_CREDIT_RATE_LABEL = `${PAYMENT_CREDIT_RATE} INR paid = 1 credit`
export const PAYMENT_PROOFS_BUCKET = 'payment-proofs'

export const PAYMENT_STATUSES = {
  AUTH_PENDING: 'auth_pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES]

export function calculateCreditsFromPayment(amountPaid: number) {
  return Math.max(0, Math.floor(amountPaid / PAYMENT_CREDIT_RATE))
}

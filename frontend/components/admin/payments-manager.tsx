"use client"

import { useEffect, useState } from "react"
import { fetchPayments, reviewPayment } from "@/actions/payments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import { PAYMENT_STATUSES } from "@/lib/constants"
import type { PaymentRequest } from "@/types"
import { handleApiError } from "@/lib/error-handler";

function formatStatus(status: PaymentRequest["status"]) {
  if (status === PAYMENT_STATUSES.APPROVED) return "Approved"
  if (status === PAYMENT_STATUSES.REJECTED) return "Rejected"
  return "Pending"
}

function getStatusVariant(status: PaymentRequest["status"]): "default" | "destructive" | "secondary" {
  if (status === PAYMENT_STATUSES.APPROVED) return "default"
  if (status === PAYMENT_STATUSES.REJECTED) return "destructive"
  return "secondary"
}

export function PaymentsManager() {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null)
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({})
  const [activeFilter, setActiveFilter] = useState<"all" | PaymentRequest["status"]>("all")

  const loadPayments = async (status: "all" | PaymentRequest["status"] = activeFilter) => {
    try {
      setLoading(true)
      const data = await fetchPayments(status === "all" ? undefined : status)
      setPayments(data)
    } catch (error) {
      handleApiError(error, "Unable to load payments");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments(activeFilter)
  }, [activeFilter])

  const handleReview = async (paymentId: string, action: "approve" | "reject") => {
    try {
      setBusyPaymentId(paymentId)
      const updated = await reviewPayment(paymentId, action, reviewComments[paymentId])
      setPayments((current) => current.map((payment) => (payment.id === paymentId ? updated : payment)))
      if (action === "reject") {
        setReviewComments((current) => ({ ...current, [paymentId]: "" }))
      }
      toast.success(action === "approve" ? "Payment approved" : "Payment rejected", {
        description: `UTR ${updated.utrNumber} has been reviewed.`,
      })
    } catch (error) {
      handleApiError(error, `Review failed`);
    } finally {
      setBusyPaymentId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Review QR payment proofs and convert approved amounts into credits</CardDescription>
        </div>
        <Button variant="outline" onClick={() => loadPayments(activeFilter)} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", PAYMENT_STATUSES.AUTH_PENDING, PAYMENT_STATUSES.APPROVED, PAYMENT_STATUSES.REJECTED] as const).map((status) => (
            <Button
              key={status}
              variant={activeFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(status)}
            >
              {status === "all" ? "All" : formatStatus(status)}
            </Button>
          ))}
        </div>
        {loading ? (
          <div className="py-8 text-sm text-muted-foreground">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No payments submitted yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>UTR</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[280px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const isPending = payment.status === PAYMENT_STATUSES.AUTH_PENDING
                const isBusy = busyPaymentId === payment.id

                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.studentName || "Student"}</div>
                    </TableCell>
                    <TableCell>{payment.studentMemberId}</TableCell>
                    <TableCell>INR {payment.amountPaid.toFixed(2)}</TableCell>
                    <TableCell>{payment.creditsToAdd}</TableCell>
                    <TableCell>{payment.utrNumber}</TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString("en-US")}</TableCell>
                    <TableCell>
                      {payment.proofUrl ? (
                        <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                          View proof
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Unavailable</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(payment.createdAt).toLocaleString("en-US")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(payment.status)}>{formatStatus(payment.status)}</Badge>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      {isPending ? (
                        <div className="space-y-2">
                          <Textarea
                            value={reviewComments[payment.id] ?? ""}
                            onChange={(event) => setReviewComments((current) => ({
                              ...current,
                              [payment.id]: event.target.value,
                            }))}
                            placeholder="Required for rejection, optional for approval"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReview(payment.id, "approve")} disabled={isBusy}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReview(payment.id, "reject")} disabled={isBusy}>
                              Reject
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Reviewed</p>
                          {payment.reviewComment && <p>{payment.reviewComment}</p>}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

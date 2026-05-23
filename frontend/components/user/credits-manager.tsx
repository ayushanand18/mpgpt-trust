"use client"

import { useEffect, useMemo, useState } from "react"
import { fetchCredits } from "@/actions/credits"
import { createPaymentRequest, fetchPayments } from "@/actions/payments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import {
  PAYMENT_CREDIT_RATE_LABEL,
  PAYMENT_STATUSES,
  calculateCreditsFromPayment,
} from "@/lib/constants"
import type { PaymentRequest } from "@/types"
import { Plus, QrCode, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { handleApiError } from "@/lib/error-handler";

type Transaction = {
  id: string
  value: number
  description: string
  comments: string
  date: string
}

const initialFormState = {
  amountPaid: "",
  utrNumber: "",
  paymentDate: "",
  studentNote: "",
}

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

export function CreditsManager() {
  const [currentBalance, setCurrentBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [formState, setFormState] = useState(initialFormState)

  const loadData = async () => {
    try {
      const [creditsData, paymentData] = await Promise.all([
        fetchCredits(),
        fetchPayments(),
      ])

      setCurrentBalance(Number(creditsData.CurrentCredits ?? creditsData.Credits ?? 0))
      setTransactions(
        creditsData?.History?.map((item: any) => ({
          id: String(item.id ?? item.Id),
          value: Number(item.value ?? item.Value),
          description: String(item.reason ?? item.Reason ?? "Credit entry"),
          comments: String(item.comments ?? item.Comments ?? ""),
          date: String(item.created_at ?? item.CreatedAt),
        })) || []
      )
      setPayments(paymentData)
    } catch (error) {
      handleApiError(error, "Unable to load credits");
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const creditTransactions = transactions.filter((t) => t.value > 0)
  const debitTransactions = transactions.filter((t) => t.value < 0)
  const derivedCredits = useMemo(
    () => calculateCreditsFromPayment(Number(formState.amountPaid || 0)),
    [formState.amountPaid]
  )

  const handleSubmitPayment = async () => {
    if (!proofFile) {
      handleApiError("Upload the payment proof before submitting.", "Proof required");
      return
    }

    const formData = new FormData()
    formData.set("amountPaid", formState.amountPaid)
    formData.set("utrNumber", formState.utrNumber)
    formData.set("paymentDate", formState.paymentDate)
    formData.set("studentNote", formState.studentNote)
    formData.set("proof", proofFile)

    try {
      setSubmittingPayment(true)
      const payment = await createPaymentRequest(formData)
      setPayments((current) => [payment, ...current])
      setFormState(initialFormState)
      setProofFile(null)
      setPaymentDialogOpen(false)
      toast({
        title: "Payment submitted",
        description: "Your payment proof is now pending review.",
      })
    } catch (error) {
      handleApiError(error, "Submission failed");
    } finally {
      setSubmittingPayment(false)
    }
  }

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            transaction.value > 0 ? "bg-chart-4/10 text-chart-4" : "bg-destructive/10 text-destructive"
          }`}
        >
          {transaction.value > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        </div>
        <div>
          <p className="font-medium text-sm">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {transaction.comments && <p className="text-xs text-muted-foreground">{transaction.comments}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.value > 0 ? "text-chart-4" : "text-destructive"}`}>
          {transaction.value > 0 ? "+" : "-"}{Math.abs(transaction.value)} credits
        </p>
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-3 bg-gradient-to-br from-chart-1 to-chart-2 text-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Current Balance
          </CardTitle>
          <CardDescription className="text-white/80">Available credits for library services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-5xl font-bold">{currentBalance}</p>
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credits
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add Credits via QR Code</DialogTitle>
                  <DialogDescription>
                    Scan the QR, complete the payment, then submit the details for admin review.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-2 md:grid-cols-[220px_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white p-4">
                      <img src="/qr-code-payment.png" alt="Payment QR Code" className="h-48 w-48 rounded-lg object-contain" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                      <Badge variant="outline" className="text-xs bg-white/80 text-foreground">
                        <QrCode className="h-3 w-3 mr-1" />
                        Static Payment QR Code
                      </Badge>
                      <p className="text-sm text-muted-foreground">{PAYMENT_CREDIT_RATE_LABEL}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amountPaid">Amount paid</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formState.amountPaid}
                        onChange={(event) => setFormState((current) => ({ ...current, amountPaid: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="utrNumber">UTR number</Label>
                      <Input
                        id="utrNumber"
                        value={formState.utrNumber}
                        onChange={(event) => setFormState((current) => ({ ...current, utrNumber: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paymentDate">Payment date</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={formState.paymentDate}
                        onChange={(event) => setFormState((current) => ({ ...current, paymentDate: event.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="proof">Payment proof</Label>
                      <Input
                        id="proof"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(event) => setProofFile(event.target.files?.[0] ?? null)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="studentNote">Note (optional)</Label>
                      <Textarea
                        id="studentNote"
                        value={formState.studentNote}
                        onChange={(event) => setFormState((current) => ({ ...current, studentNote: event.target.value }))}
                        placeholder="Add anything the admin should know"
                      />
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      Derived credits: <span className="font-semibold">{derivedCredits}</span>
                    </div>
                    <Button
                      onClick={handleSubmitPayment}
                      disabled={
                        submittingPayment ||
                        !formState.amountPaid ||
                        !formState.utrNumber.trim() ||
                        !formState.paymentDate ||
                        !proofFile
                      }
                    >
                      {submittingPayment ? "Submitting..." : "Submit payment proof"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>Track your submitted payment proofs and their review status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No payment requests yet.
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">UTR {payment.utrNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid INR {payment.amountPaid.toFixed(2)} on {new Date(payment.paymentDate).toLocaleDateString("en-US")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Credits to add after approval: {payment.creditsToAdd}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(payment.createdAt).toLocaleString("en-US")}
                    </p>
                    {payment.studentNote && <p className="text-sm">Note: {payment.studentNote}</p>}
                    {payment.reviewComment && <p className="text-sm">Review comment: {payment.reviewComment}</p>}
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <Badge variant={getStatusVariant(payment.status)}>{formatStatus(payment.status)}</Badge>
                    {payment.proofUrl && (
                      <a href={payment.proofUrl} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
                        View proof
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all your credit additions and expenditures</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
              <TabsTrigger value="credits">Credits ({creditTransactions.length})</TabsTrigger>
              <TabsTrigger value="debits">Debits ({debitTransactions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-1 mt-4">
              {transactions.length > 0 ? transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <TransactionCard transaction={transaction} />
                  {index < transactions.length - 1 && <Separator />}
                </div>
              )) : <div className="text-center py-8 text-muted-foreground">No transactions yet</div>}
            </TabsContent>

            <TabsContent value="credits" className="space-y-1 mt-4">
              {creditTransactions.length > 0 ? (
                creditTransactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <TransactionCard transaction={transaction} />
                    {index < creditTransactions.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No credit transactions</div>
              )}
            </TabsContent>

            <TabsContent value="debits" className="space-y-1 mt-4">
              {debitTransactions.length > 0 ? (
                debitTransactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <TransactionCard transaction={transaction} />
                    {index < debitTransactions.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No debit transactions</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

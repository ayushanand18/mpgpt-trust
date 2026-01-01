"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, TrendingUp, TrendingDown, QrCode, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Transaction = {
  id: string
  type: "credit" | "debit"
  amount: number
  description: string
  date: string
  balance: number
}

export function CreditsManager() {
  const [currentBalance] = useState(250)
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "debit",
      amount: 15,
      description: "Study room booking - Central Library",
      date: "2026-01-01",
      balance: 250,
    },
    {
      id: "2",
      type: "credit",
      amount: 100,
      description: "Payment received via QR code",
      date: "2025-12-30",
      balance: 265,
    },
    {
      id: "3",
      type: "debit",
      amount: 10,
      description: "Late return fee",
      date: "2025-12-28",
      balance: 165,
    },
    {
      id: "4",
      type: "debit",
      amount: 20,
      description: 'Book reservation - "Advanced Mathematics"',
      date: "2025-12-25",
      balance: 175,
    },
    {
      id: "5",
      type: "credit",
      amount: 150,
      description: "Payment received via QR code",
      date: "2025-12-20",
      balance: 195,
    },
    {
      id: "6",
      type: "debit",
      amount: 5,
      description: "Printing services",
      date: "2025-12-18",
      balance: 45,
    },
  ])

  const creditTransactions = transactions.filter((t) => t.type === "credit")
  const debitTransactions = transactions.filter((t) => t.type === "debit")

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg ${
            transaction.type === "credit" ? "bg-chart-4/10 text-chart-4" : "bg-destructive/10 text-destructive"
          }`}
        >
          {transaction.type === "credit" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
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
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.type === "credit" ? "text-chart-4" : "text-destructive"}`}>
          {transaction.type === "credit" ? "+" : "-"}${transaction.amount}
        </p>
        <p className="text-xs text-muted-foreground">Balance: ${transaction.balance}</p>
      </div>
    </div>
  )

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Balance Card */}
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
            <p className="text-5xl font-bold">${currentBalance}</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credits
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Credits via QR Code</DialogTitle>
                  <DialogDescription>Scan this QR code with your payment app to add credits</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="bg-white p-6 rounded-lg">
                    <img src="/qr-code-payment.png" alt="Payment QR Code" className="w-48 h-48" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Scan this code to complete your payment</p>
                    <Badge variant="outline" className="text-xs">
                      <QrCode className="h-3 w-3 mr-1" />
                      Static Payment QR Code
                    </Badge>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
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
              {transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <TransactionCard transaction={transaction} />
                  {index < transactions.length - 1 && <Separator />}
                </div>
              ))}
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

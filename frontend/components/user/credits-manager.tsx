"use client"

import { useState, useEffect } from "react"
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
import { toast } from "@/hooks/use-toast"
import { fetchCredits } from "@/actions/credits"

type Transaction = {
  id: string
  value: number
  description: string
  comments: string
  date: string
}

export function CreditsManager() {
  const [currentBalance, setCurrentBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([
  ])

  useEffect(() => {
    fetchCredits().then((data) => {
      setCurrentBalance(data.CurrentCredits)
      setTransactions(data?.History?.map((item: any) => ({
        id: item.Id,
        value: item.Value,
        description: item.Reason,
        comments: item.Comments,
        date: item.CreatedAt,
      })) || [])
    }).catch((error: Error) => {
      console.error("Error fetching credits:", error)
      toast({
        title: "Error fetching credits",
        description: "There was an error fetching your credit transactions. Please try again later.",
      })
    })
  }, [])

  const creditTransactions = transactions.filter((t) => t.value > 0)
  const debitTransactions = transactions.filter((t) => t.value < 0)

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
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.value > 0 ? "text-chart-4" : "text-destructive"}`}>
          {transaction.value > 0 ? "+" : "-"}${Math.abs(transaction.value)}
        </p>
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
            <p className="text-5xl font-bold">{currentBalance}</p>
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

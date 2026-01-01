"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus } from "lucide-react"

interface AddCreditsDialogProps {
  open: boolean
  userName: string
  currentCredits: number
  onClose: () => void
  onAdd: (amount: number) => void
}

export function AddCreditsDialog({ open, userName, currentCredits, onClose, onAdd }: AddCreditsDialogProps) {
  const [amount, setAmount] = useState(50)

  const handleAdd = () => {
    onAdd(amount)
    setAmount(50)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">User: {userName}</p>
            <p className="text-sm">
              Current credits: <span className="font-semibold">{currentCredits}</span>
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount to Add</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setAmount(Math.max(0, amount - 10))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number.parseInt(e.target.value) || 0)}
                className="text-center"
              />
              <Button variant="outline" size="icon" onClick={() => setAmount(amount + 10)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              New balance: <span className="font-semibold text-lg">{currentCredits + amount}</span> credits
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Credits</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

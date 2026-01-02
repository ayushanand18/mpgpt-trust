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
  onAdd: (amount: number, utrNumber: string, comment: string) => void
}

export function AddCreditsDialog({ open, userName, currentCredits, onClose, onAdd }: AddCreditsDialogProps) {
  const [amount, setAmount] = useState(5)
  const [utrNumber, setUtrNumber] = useState("")
  const [comment, setComment] = useState("")

  const handleAdd = () => {
    if (amount <= 0 || utrNumber.trim() === "" || comment.trim() === "") return

    onAdd(amount, utrNumber, comment)
    setAmount(5)
    setUtrNumber("")
    setComment("")
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
              <Button variant="outline" size="icon" onClick={() => setAmount(Math.max(0, amount - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number.parseInt(e.target.value) || 0)}
                className="text-center"
              />
              <Button variant="outline" size="icon" onClick={() => setAmount(amount + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="utrNumber">UTR Number</Label>
            <div className="flex items-center gap-2">
              <Input
                id="utrNumber"
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="text-center"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-center"
            />
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
          <Button onClick={handleAdd} disabled={amount <= 0 || utrNumber.trim() === "" || comment.trim() === ""}>Add Credits</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

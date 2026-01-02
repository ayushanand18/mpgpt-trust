"use client"

import { useState, useEffect } from "react"
import type { User } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserEditDialogProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSave: (user: User) => void
}

export function UserEditDialog({ user, open, onClose, onSave }: UserEditDialogProps) {
  const [formData, setFormData] = useState<User | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({ ...user })
    }
  }, [user])

  const handleSave = () => {
    if (formData) {
      onSave(formData)
      onClose()
    }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.PhoneNumber}
              onChange={(e) => setFormData({ ...formData, PhoneNumber: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Role</Label>
            <Select
              value={formData.Role}
              onValueChange={(value: "member" | "admin") => setFormData({ ...formData, Role: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

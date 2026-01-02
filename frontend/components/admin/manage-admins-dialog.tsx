"use client"

import { useState, useEffect } from "react"
import type { Library } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface ManageAdminsDialogProps {
  library: Library | null
  open: boolean
  onClose: () => void
  onSave: (library: Library) => void
}

export function ManageAdminsDialog({ library, open, onClose, onSave }: ManageAdminsDialogProps) {
  const [admins, setAdmins] = useState<string[]>([])
  const [newAdmin, setNewAdmin] = useState("")

  useEffect(() => {
    if (library) {
      setAdmins([...[]])
    }
  }, [library])

  const handleAddAdmin = () => {
    if (newAdmin.trim() && !admins.includes(newAdmin.trim())) {
      setAdmins([...admins, newAdmin.trim()])
      setNewAdmin("")
    }
  }

  const handleRemoveAdmin = (admin: string) => {
    setAdmins(admins.filter((a) => a !== admin))
  }

  const handleSave = () => {
    if (library) {
      onSave({ ...library })
      onClose()
    }
  }

  if (!library) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Admin Users</DialogTitle>
          <p className="text-sm text-muted-foreground">{library.name}</p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Current Admins ({admins.length})</Label>
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">No admins assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {admins.map((admin) => (
                  <Badge key={admin} variant="secondary" className="px-3 py-1.5">
                    {admin}
                    <button
                      onClick={() => handleRemoveAdmin(admin)}
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newAdmin">Add Admin User</Label>
            <div className="flex gap-2">
              <Input
                id="newAdmin"
                placeholder="Enter admin username"
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
              />
              <Button onClick={handleAddAdmin} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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

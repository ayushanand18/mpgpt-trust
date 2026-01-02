"use client"

import { useState, useEffect } from "react"
import type { Library, User } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Search } from "lucide-react"
import { addAdminLibMapping } from "@/actions/libraries"
import { searchUsers } from "@/actions/users"

interface ManageAdminsDialogProps {
  library: Library | null
  open: boolean
  onClose: () => void
  onSave: (library: Library) => void
}

export function ManageAdminsDialog({ library, open, onClose, onSave }: ManageAdminsDialogProps) {
  const [admins, setAdmins] = useState<string[]>([])
  const [newAdmin, setNewAdmin] = useState("")
  const [searchedUser, setSearchedUser] = useState<User | null>(null)

  useEffect(() => {
    if (library) {
      setAdmins(library.admins?.map((admin: any) => admin.MemberId))
    }
  }, [library])

  const handleSearchAdmin = (adminId: string) => {
    // implement search
    searchUsers("memberId", adminId).then((data) => {
      if (data?.Users?.length > 0) {
        setSearchedUser(data.Users[0])
      }
    }).catch((error: Error) => {
      console.error("Error searching users:", error)
    })
  }

  const handleAddAdmin = () => {
    if (newAdmin.trim() && !admins.includes(newAdmin.trim())) {
      addAdminLibMapping(library?.id || 0, newAdmin.trim()).then(() => {
        setAdmins([...admins, newAdmin.trim()])
      }).catch((error: Error) => {
        console.error("Error adding admin to library mapping:", error)
      })
      setNewAdmin("")
    }
  }

  const handleRemoveAdmin = (admin: string) => {
    setAdmins(admins.filter((a) => a !== admin))
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
                placeholder="Enter admin id"
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchAdmin(newAdmin)}
              />
              <Button onClick={() => handleSearchAdmin(newAdmin)} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {searchedUser ? (
              <div className="w-80 rounded-lg border p-4 bg-white space-y-2">
                <div className="font-semibold">{searchedUser.Name}</div>
                <div className="text-sm text-gray-500">{searchedUser.Email}</div>
                <div className="text-sm text-gray-500">{searchedUser.PhoneNumber}</div>

                <Button onClick={handleAddAdmin} className="mt-2">
                  Add as Admin
                </Button>
              </div>
            ) : (
              <div className="text-gray-500">No user found</div>
            )}

          </div>
        </div>
        <DialogFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

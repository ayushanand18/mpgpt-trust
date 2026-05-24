"use client"

import { useState, useEffect } from "react"
import type { Library, User } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Search, AlertCircle } from "lucide-react"
import { addAdminLibMapping } from "@/actions/libraries"
import { searchUsers } from "@/actions/users"
import { ROLES } from "@/lib/constants"
import { toast } from "sonner"

interface ManageAdminsDialogProps {
  library: Library | null
  open: boolean
  onClose: () => void
  onSave: (library: Library) => void
}

export function ManageAdminsDialog({ library, open, onClose, onSave }: ManageAdminsDialogProps) {
  const [admins, setAdmins] = useState<string[]>([])
  const [newAdmin, setNewAdmin] = useState("")
  const [searchType, setSearchType] = useState<"memberId" | "email" | "phoneNumber">("memberId")
  const [searchedUser, setSearchedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (library && Array.isArray(library.admins)) {
      setAdmins(library.admins.map((admin: any) => 
        (typeof admin === 'string' ? admin : (admin.MemberId ?? admin.member_id))
      ).filter(Boolean) as string[])
    }
  }, [library])

  const handleSearchAdmin = (searchValue: string) => {
    if (!searchValue.trim()) return
    
    setIsLoading(true)
    setSearchedUser(null)
    
    searchUsers(searchType, searchValue.trim()).then((data) => {
      if (data?.Users?.length > 0) {
        setSearchedUser({
          Id: data.Users[0].Id ?? data.Users[0].id,
          Name: data.Users[0].Name ?? data.Users[0].name,
          Email: data.Users[0].Email ?? data.Users[0].email,
          PhoneNumber: data.Users[0].PhoneNumber ?? data.Users[0].phone_number,
          MemberId: data.Users[0].MemberId ?? data.Users[0].member_id,
          Role: data.Users[0].Role ?? data.Users[0].role,
          CreatedAt: data.Users[0].CreatedAt ?? data.Users[0].created_at,
          Credits: data.Users[0].Credits ?? data.Users[0].credits ?? 0,
        })
      } else {
        toast.error("User not found")
      }
    }).catch((error: Error) => {
      console.error("Error searching users:", error)
      toast.error("Failed to search user")
    }).finally(() => {
      setIsLoading(false)
    })
  }

  const handleAddAdmin = () => {
    if (!library) return
    if (!searchedUser) return

    if (searchedUser.Role !== ROLES.ADMIN && searchedUser.Role !== ROLES.SUPERUSER) {
      toast.error(`User ${searchedUser.MemberId} is not an admin (Role: ${searchedUser.Role})`)
      return
    }

    if (admins.includes(searchedUser.MemberId)) {
      toast.error("User is already an admin for this library")
      return
    }

    addAdminLibMapping(library.id, searchedUser.MemberId).then(() => {
      setAdmins([...admins, searchedUser.MemberId])
      toast.success(`User ${searchedUser.MemberId} added as admin`)
      setSearchedUser(null)
      setNewAdmin("")
    }).catch((error: any) => {
      console.error("Error adding admin to library mapping:", error)
      toast.error(error.Error?.Message || "Failed to add admin to library")
    })
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
              <Select 
                value={searchType} 
                onValueChange={(value: any) => setSearchType(value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="memberId">Member ID</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phoneNumber">Phone</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="newAdmin"
                placeholder={`Enter ${searchType === 'memberId' ? 'ID' : searchType === 'email' ? 'email' : 'phone number'}`}
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchAdmin(newAdmin)}
              />
              <Button onClick={() => handleSearchAdmin(newAdmin)} size="icon" disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Searching...</p>}
            {searchedUser && (
              <div className={`w-full rounded-lg border p-4 space-y-2 ${
                (searchedUser.Role === ROLES.ADMIN || searchedUser.Role === ROLES.SUPERUSER) 
                ? 'bg-white border-slate-200' 
                : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{searchedUser.Name}</div>
                    <div className="text-sm text-gray-500">{searchedUser.Email}</div>
                    <div className="text-sm text-gray-500">Role: <span className="font-medium capitalize">{searchedUser.Role}</span></div>
                  </div>
                  {(searchedUser.Role !== ROLES.ADMIN && searchedUser.Role !== ROLES.SUPERUSER) && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <Button 
                  onClick={handleAddAdmin} 
                  className="w-full mt-2"
                  disabled={searchedUser.Role !== ROLES.ADMIN && searchedUser.Role !== ROLES.SUPERUSER}
                >
                  {(searchedUser.Role === ROLES.ADMIN || searchedUser.Role === ROLES.SUPERUSER) 
                    ? "Add as Admin" 
                    : "Cannot Add (Not an Admin)"}
                </Button>
              </div>
            )}
            {!searchedUser && !isLoading && newAdmin && (
               <div className="text-gray-500 text-sm">No user found</div>
            )}

          </div>
        </div>
        <DialogFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

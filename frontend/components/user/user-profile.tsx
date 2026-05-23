"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Edit2, Save, X, CreditCard } from "lucide-react"
import { toast } from "sonner";
import type { UserProfileData } from "@/types/props"
import { editUser } from "@/actions/users"
import { handleApiError } from "@/lib/error-handler";
import type { User } from "@/types";


export function UserProfile({userDataProp}: {userDataProp?: UserProfileData}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(userDataProp?.userData)

  const handleSave = () => {
    if (editData) {
        userDataProp?.setUserData(editData)
    }

    if (editData) {
        const userUpdate: Partial<User> = {
            Name: editData.name,
            Email: editData.email,
            PhoneNumber: editData.phone,
            Id: editData.id,
            MemberId: editData.memberId,
        }
        editUser(userUpdate).then(() => {
        toast.success("Profile updated", {
            description: "Your information has been saved successfully.",
        })
        }).catch((error) => {
        handleApiError(error, "Error updating profile");
        });
    }
    
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(userDataProp?.userData)
    setIsEditing(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {userDataProp?.userData && userDataProp.userData.id?.length > 0 && (
        <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -mr-32 -mt-32" />
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Library Member Card
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Present this card for all library services
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-primary-foreground/80">Member Name</p>
                <p className="text-2xl font-semibold">{userDataProp.userData.name}</p>
              </div>
              <div>
                <p className="text-sm text-primary-foreground/80">Member ID</p>
                <p className="text-3xl font-mono font-bold tracking-wider">{userDataProp.userData.memberId}</p>
              </div>
              <Badge
                variant="secondary"
                className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
              >
                Active Member
              </Badge>
            </div>
          </CardContent>
        </Card>)}

      {/* Personal Information */}
      {userDataProp?.userData && userDataProp.userData.id?.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>View and update your account details</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData?.name ?? ""}
                    onChange={(e) => setEditData(prev => prev ? ({ ...prev, name: e.target.value }) : undefined)}
                  />
                ) : (
                  <p className="text-foreground font-medium">{userDataProp?.userData.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData?.email ?? ""}
                    onChange={(e) => setEditData(prev => prev ? ({ ...prev, email: e.target.value }) : undefined)}
                  />
                ) : (
                  <p className="text-foreground font-medium">{userDataProp?.userData.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={editData?.phone ?? ""}
                    onChange={(e) => setEditData(prev => prev ? ({ ...prev, phone: e.target.value }) : undefined)}
                  />
                ) : (
                  <p className="text-foreground font-medium">{userDataProp?.userData.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID</Label>
                <p className="text-muted-foreground font-mono text-sm">{userDataProp?.userData.memberId}</p>
              </div>
            </div>
          </CardContent>
        </Card>)}

      
    </div>
  )
}

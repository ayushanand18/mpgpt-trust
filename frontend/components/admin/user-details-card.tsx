"use client"

import { useState } from "react"
import type { User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Mail, Phone, CreditCard, Calendar, Edit, Trash2 } from "lucide-react"

interface UserDetailsCardProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export function UserDetailsCard({ user, onEdit, onDelete }: UserDetailsCardProps) {
  const [showPhone, setShowPhone] = useState(false)

  const redactPhone = (phone: string) => {
    return phone.slice(0, 4) + "***-****"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl">{user.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">ID: {user.memberId}</p>
        </div>
        <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{showPhone ? user.phoneNumber : redactPhone(user.phoneNumber)}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowPhone(!showPhone)} className="h-8 px-2">
              {showPhone ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{user.credits} credits</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onEdit(user)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={() => onDelete(user.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

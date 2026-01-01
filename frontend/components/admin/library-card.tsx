"use client"

import type { Library } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users, Edit } from "lucide-react"

interface LibraryCardProps {
  library: Library
  onEdit: (library: Library) => void
  onManageAdmins: (library: Library) => void
}

export function LibraryCard({ library, onEdit, onManageAdmins }: LibraryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex-1">
          <CardTitle className="text-xl">{library.name}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">ID: {library.id}</p>
        </div>
        <Badge variant="secondary">{library.capacity} seats</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm">{library.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {library.latitude.toFixed(4)}, {library.longitude.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{library.openingHours}</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{library.adminUsers.length} admin(s)</span>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onEdit(library)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onManageAdmins(library)}>
            <Users className="h-4 w-4 mr-2" />
            Admins
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import type { Library } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface LibraryEditDialogProps {
  library: Library | null
  open: boolean
  onClose: () => void
  onSave: (library: Library) => void
}

export function LibraryEditDialog({ library, open, onClose, onSave }: LibraryEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Library>>({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
  })

  useEffect(() => {
    if (library) {
      setFormData({ ...library })
    } else {
      setFormData({
        name: "",
        address: "",
        latitude: 0,
        longitude: 0,
      })
    }
  }, [library, open])

  const handleSave = () => {
    if (formData.name && formData.address) {
      onSave(formData as Library)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{library ? "Edit Library Information" : "Create New Library"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Library Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Downtown Branch"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full street address"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={formData.latitude || 0}
                onChange={(e) => setFormData({ ...formData, latitude: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={formData.longitude || 0}
                onChange={(e) => setFormData({ ...formData, longitude: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name || !formData.address}>
            {library ? "Save Changes" : "Create Library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


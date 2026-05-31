"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner";
import { Library } from "@/types"
import { createBooking, fetchLibraries } from "@/actions/libraries"
import { useDebounce } from "@/hooks/use-debounce"
import { handleApiError } from "@/lib/error-handler";

interface NewBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookingCreated?: () => void
}

export function NewBookingDialog({ open, onOpenChange, onBookingCreated }: NewBookingDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm)
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [firstHalf, setFirstHalf] = useState(false)
  const [secondHalf, setSecondHalf] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [libraries, setLibraries] = useState<Library[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!debouncedSearchTerm) return
    fetchLibraries(debouncedSearchTerm).then((librariesData) => {
      setLibraries(
        librariesData?.Libraries?.map((lib: any): Library => ({
          id: lib.Id ?? lib.id,
          name: lib.Name ?? lib.name,
          address: lib.Address ?? lib.address,
          latitude: lib.Latitude ?? lib.latitude,
          longitude: lib.Longitude ?? lib.longitude,
          admins: []
        }))
      )
    })
  }, [debouncedSearchTerm])

  const handleSubmit = () => {
    if (!selectedLibrary || !selectedDate || (!firstHalf && !secondHalf) || !purpose) {
      toast.error("Missing information", {
        description: !firstHalf && !secondHalf
          ? "Please select at least one time slot."
          : "Please fill in all required fields.",
      })
      return
    }

    setIsSubmitting(true)
    createBooking(selectedLibrary.id, selectedDate, { firstHalf, secondHalf }, purpose)
      .then(() => {
        toast.success("Booking created", {
          description: `Your booking at ${selectedLibrary.name} has been confirmed.`,
        })
        onOpenChange(false)
        onBookingCreated?.()
        setSelectedLibrary(null)
        setSelectedDate("")
        setFirstHalf(false)
        setSecondHalf(false)
        setPurpose("")
        setSearchTerm("")
      })
      .catch((error) => {
        handleApiError(error, `Failed to create booking`)
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>Select a library, date, and time slot</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Library Search */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Libraries</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {libraries.map((library) => (
                <Card
                  key={library.id}
                  className={`cursor-pointer transition-colors ${
                    selectedLibrary?.id === library.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedLibrary(library)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{library.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {library.address}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {selectedLibrary && (
            <>
              <Separator />

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Select Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Slots */}
              {selectedDate && (
                <div className="space-y-2">
                  <Label>Time Slot</Label>
                  <p className="text-xs text-muted-foreground">Select one or both slots</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFirstHalf(!firstHalf)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        firstHalf
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-sm">1st Half</p>
                      <p className="text-xs text-muted-foreground mt-0.5">6:00 AM – 12:00 PM</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSecondHalf(!secondHalf)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        secondHalf
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-medium text-sm">2nd Half</p>
                      <p className="text-xs text-muted-foreground mt-0.5">12:00 PM – 6:00 PM</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Input
                  id="purpose"
                  placeholder="e.g., Study Room, Book Collection, Research"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Confirm Booking"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

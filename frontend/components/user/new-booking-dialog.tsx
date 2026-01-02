"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Library } from "@/types"
import { createBooking, fetchLibraries } from "@/actions/libraries"
import { useDebounce } from "@/hooks/use-debounce"

export function NewBookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm)
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [purpose, setPurpose] = useState("")
  const [libraries, setLibraries] = useState<Library[]>([])

  useEffect(() => {
    if (!debouncedSearchTerm) return
    fetchSessionAndLibraries()
  }, [debouncedSearchTerm])

  const fetchSessionAndLibraries = async () => {
    let librariesData = await fetchLibraries(debouncedSearchTerm)

    setLibraries(
      librariesData?.Libraries?.map((lib: any): Library => ({
        id: lib.Id,
        name: lib.Name,
        address: lib.Address,
        latitude: lib.Latitude,
        longitude: lib.Longitude,
      }))
    )
  }

  const handleSubmit = () => {
    if (!selectedLibrary || !selectedDate || !purpose) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }
    
    createBooking(selectedLibrary.id, selectedDate, purpose).then(() => {
      toast({
        title: "Booking created",
        description: `Your booking at ${selectedLibrary.name} has been confirmed.`,
      })
      onOpenChange(false)
      // Reset form
      setSelectedLibrary(null)
      setSelectedDate("")
      setPurpose("")
      setSearchTerm("")
    }).catch((error) => {
      toast({
        title: "Error",
        description: `Failed to create booking: ${error.message}`,
      })
    })
  }
    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>Select a library and choose your preferred date and time</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Library Search and Selection */}
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
                  className={`cursor-pointer transition-colors ${selectedLibrary?.id === library.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                  onClick={() => setSelectedLibrary(library)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{library.name}</CardTitle>
                    </div>
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

              {/* Date Selection */}
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

              <Button onClick={handleSubmit} className="w-full">
                Confirm Booking
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

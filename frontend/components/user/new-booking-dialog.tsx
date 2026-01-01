"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Calendar, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Library = {
  id: string
  name: string
  location: string
  distance: string
  availableSlots: string[]
}

const libraries: Library[] = [
  {
    id: "1",
    name: "Central Library",
    location: "100 Main Street, New York, NY 10001",
    distance: "0.5 miles",
    availableSlots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
  },
  {
    id: "2",
    name: "East Branch Library",
    location: "450 East Avenue, New York, NY 10002",
    distance: "1.2 miles",
    availableSlots: ["10:00 AM", "1:00 PM", "3:00 PM"],
  },
  {
    id: "3",
    name: "West Branch Library",
    location: "789 West Street, New York, NY 10003",
    distance: "2.1 miles",
    availableSlots: ["9:00 AM", "12:00 PM", "2:00 PM", "5:00 PM"],
  },
  {
    id: "4",
    name: "North Library",
    location: "321 North Road, New York, NY 10004",
    distance: "3.0 miles",
    availableSlots: ["10:00 AM", "1:00 PM", "4:00 PM"],
  },
]

export function NewBookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [purpose, setPurpose] = useState("")

  const filteredLibraries = libraries.filter(
    (lib) =>
      lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = () => {
    if (!selectedLibrary || !selectedDate || !selectedTime || !purpose) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    toast({
      title: "Booking created",
      description: `Your booking at ${selectedLibrary.name} has been confirmed.`,
    })
    onOpenChange(false)

    // Reset form
    setSelectedLibrary(null)
    setSelectedDate("")
    setSelectedTime("")
    setPurpose("")
    setSearchTerm("")
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
              {filteredLibraries.map((library) => (
                <Card
                  key={library.id}
                  className={`cursor-pointer transition-colors ${
                    selectedLibrary?.id === library.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedLibrary(library)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{library.name}</CardTitle>
                      <span className="text-xs text-muted-foreground">{library.distance}</span>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {library.location}
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

              {/* Time Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Select Time Slot
                </Label>
                <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedLibrary.availableSlots.map((slot) => (
                      <div key={slot} className="flex items-center space-x-2">
                        <RadioGroupItem value={slot} id={slot} />
                        <Label htmlFor={slot} className="cursor-pointer font-normal">
                          {slot}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
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

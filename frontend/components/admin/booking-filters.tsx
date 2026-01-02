"use client"

import { useState } from "react"
import type { Library } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"

interface BookingFiltersProps {
  libraries: Library[]
  onFilter: (libraryId: number, startDate: string, endDate: string) => void
}

export function BookingFilters({ libraries, onFilter }: BookingFiltersProps) {
  const [selectedLibrary, setSelectedLibrary] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleFilter = () => {
    if (selectedLibrary && startDate && endDate) {
      onFilter(parseInt(selectedLibrary), startDate, endDate)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="space-y-2">
        <Label>Library</Label>
        <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
          <SelectTrigger>
            <SelectValue placeholder="Select library" />
          </SelectTrigger>
          <SelectContent>
            {libraries.map((library) => (
              <SelectItem key={library.id} value={`${library.id}`}>
                {library.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button onClick={handleFilter} className="w-full" disabled={!selectedLibrary || !startDate || !endDate}>
          <Calendar className="h-4 w-4 mr-2" />
          Filter Bookings
        </Button>
      </div>
    </div>
  )
}

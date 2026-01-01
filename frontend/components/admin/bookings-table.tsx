"use client"

import type { Booking } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface BookingsTableProps {
  bookings: Booking[]
  libraryName: string
}

export function BookingsTable({ bookings, libraryName }: BookingsTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a")
    } catch {
      return dateString
    }
  }

  const calculateDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const hours = Math.abs(endDate.getTime() - startDate.getTime()) / 36e5
      return `${hours.toFixed(1)}h`
    } catch {
      return "N/A"
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No bookings found for the selected criteria</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{libraryName}</h3>
        <p className="text-sm text-muted-foreground">{bookings.length} active bookings</p>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.userName}</TableCell>
                <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                <TableCell>{calculateDuration(booking.startTime, booking.endTime)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

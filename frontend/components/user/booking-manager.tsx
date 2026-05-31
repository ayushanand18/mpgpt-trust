"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Loader2, MapPin, Plus, X } from "lucide-react"
import { NewBookingDialog } from "@/components/user/new-booking-dialog"
import { toast } from "sonner";
import { fetchBookings } from "@/actions/bookings"
import { handleApiError } from "@/lib/error-handler";

type LocalBooking = {
  id: string
  libraryName: string
  location: string
  startTime: string
  endTime: string
  status: "upcoming" | "today" | "past" | "cancelled"
  purpose: string
}

function deriveStatus(startTimeStr: string, apiStatus: string): LocalBooking["status"] {
  if (apiStatus === "cancelled") return "cancelled"
  const d = new Date(startTimeStr)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  if (d >= startOfToday && d < startOfTomorrow) return "today"
  if (d >= startOfTomorrow) return "upcoming"
  return "past"
}

export function BookingManager() {
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [bookings, setBookings] = useState<LocalBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBookings = useCallback(() => {
    setIsLoading(true)
    fetchBookings()
      .then((data) => {
        setBookings(
          data?.map((booking: any) => {
            const startTime = booking.StartTime ?? booking.start_time ?? ""
            const apiStatus = booking.Status ?? booking.status ?? "active"
            return {
              id: booking.Id ?? booking.id,
              libraryName: booking.LibraryName ?? booking.library_name ?? "Library",
              location: booking.LibraryAddress ?? booking.library_address ?? "-",
              startTime,
              endTime: booking.EndTime ?? booking.end_time ?? "",
              status: deriveStatus(startTime, apiStatus),
              purpose: booking.Purpose ?? booking.purpose ?? "",
            }
          }) || []
        )
      })
      .catch((error) => {
        handleApiError(error, "Failed to load bookings")
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleCancelBooking = (bookingId: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "cancelled" as const } : booking
      )
    )
    toast.success("Booking cancelled", {
      description: "Your booking has been cancelled successfully.",
    })
  }

  const todayBookings = bookings.filter((b) => b.status === "today")
  const upcomingBookings = bookings.filter((b) => b.status === "upcoming")
  const pastBookings = bookings.filter((b) => b.status === "past" || b.status === "cancelled")

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  const BookingCard = ({ booking }: { booking: LocalBooking }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.libraryName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {booking.location}
            </CardDescription>
          </div>
          {booking.status === "today" && <Badge className="bg-chart-1 text-white">Today</Badge>}
          {booking.status === "upcoming" && <Badge variant="secondary">Upcoming</Badge>}
          {booking.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(booking.startTime).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {booking.startTime && booking.endTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
            </div>
          )}
          <Separator />
          <div>
            <p className="text-sm font-medium">Purpose</p>
            <p className="text-sm text-muted-foreground">{booking.purpose}</p>
          </div>
          {(booking.status === "today" || booking.status === "upcoming") && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => handleCancelBooking(booking.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>Manage your library reservations and visits</CardDescription>
              </div>
              <Button onClick={() => setShowNewBooking(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading bookings...</span>
              </div>
            ) : (
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
                  <TabsTrigger value="today">Today ({todayBookings.length})</TabsTrigger>
                  <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4 mt-4">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No upcoming bookings</div>
                  )}
                </TabsContent>

                <TabsContent value="today" className="space-y-4 mt-4">
                  {todayBookings.length > 0 ? (
                    todayBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No bookings for today</div>
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4 mt-4">
                  {pastBookings.length > 0 ? (
                    pastBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No past bookings</div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <NewBookingDialog
        open={showNewBooking}
        onOpenChange={setShowNewBooking}
        onBookingCreated={loadBookings}
      />
    </>
  )
}

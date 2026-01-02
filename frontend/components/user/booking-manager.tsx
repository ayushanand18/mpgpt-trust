"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Plus, X } from "lucide-react"
import { NewBookingDialog } from "@/components/user/new-booking-dialog"
import { useToast } from "@/hooks/use-toast"
import { fetchBookings } from "@/actions/bookings"

type Booking = {
  id: string
  libraryName: string
  location: string
  date: string
  time: string
  status: "upcoming" | "today" | "past" | "cancelled"
  purpose: string
}

export function BookingManager() {
  const { toast } = useToast()
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([
  ])

  useEffect(() => {
    fetchBookings().
      then((data) => {
        setBookings(data?.Bookings?.map((booking: any) => ({
          id: booking.Id,
          memberId: booking.MemberId,
          libraryName: booking.LibraryName,
          location: booking.LibraryAddress,
          date: booking.StartTime,
          status: booking.Status,
          purpose: booking.Purpose,
        })))
      }).
      catch((error) => {
        console.error("Error fetching bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again later.",
        })
      })
  }, [])
  const handleCancelBooking = (bookingId: string) => {
    setBookings(
      bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" as const } : booking)),
    )
    toast({
      title: "Booking cancelled",
      description: "Your booking has been cancelled successfully.",
    })
  }

  const now = new Date()

  const todayBookings = bookings.filter(b => {
    const d = new Date(b.date)
    return d.toDateString() === now.toDateString()
  })
  const upcomingBookings = bookings.filter(b => new Date(b.date) > now)
  const pastBookings = bookings.filter(b => new Date(b.date) < now)


  const BookingCard = ({ booking }: { booking: Booking }) => (
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
              {new Date(booking.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium">Purpose</p>
            <p className="text-sm text-muted-foreground">{booking.purpose}</p>
          </div>
          {(booking.status === "today" || booking.status === "upcoming") && (
            <Button variant="destructive" size="sm" className="w-full" onClick={() => handleCancelBooking(booking.id)}>
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
          </CardContent>
        </Card>
      </div>

      <NewBookingDialog open={showNewBooking} onOpenChange={setShowNewBooking} />
    </>
  )
}

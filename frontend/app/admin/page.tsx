"use client"

import { useState } from "react"
import type { User, Library, Booking } from "@/types"
import { demoUsers, demoLibraries, demoBookings } from "@/lib/demo-data"
import { UserSearch } from "@/components/admin/user-search"
import { UserDetailsCard } from "@/components/admin/user-details-card"
import { UserEditDialog } from "@/components/admin/user-edit-dialog"
import { AddCreditsDialog } from "@/components/admin/add-credits-dialog"
import { LibraryCard } from "@/components/admin/library-card"
import { LibraryEditDialog } from "@/components/admin/library-edit-dialog"
import { ManageAdminsDialog } from "@/components/admin/manage-admins-dialog"
import { BookingFilters } from "@/components/admin/booking-filters"
import { BookingsTable } from "@/components/admin/bookings-table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, LibraryIcon, Calendar } from "lucide-react"

export default function Home() {
  const [users, setUsers] = useState<User[]>(demoUsers)
  const [libraries, setLibraries] = useState<Library[]>(demoLibraries)
  const [bookings] = useState<Booking[]>(demoBookings)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [creditsUser, setCreditsUser] = useState<User | null>(null)
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null)
  const [managingAdmins, setManagingAdmins] = useState<Library | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [selectedLibraryName, setSelectedLibraryName] = useState("")
  const [hasFilteredBookings, setHasFilteredBookings] = useState(false)

  const handleSearch = (searchType: string, searchValue: string) => {
    const results = users.filter((user) => {
      const value = searchValue.toLowerCase()
      if (searchType === "memberId") {
        return user.memberId.toLowerCase().includes(value)
      } else if (searchType === "email") {
        return user.email.toLowerCase().includes(value)
      } else if (searchType === "phoneNumber") {
        return user.phoneNumber.toLowerCase().includes(value)
      }
      return false
    })
    setSearchResults(results)
    setHasSearched(true)
  }

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setSearchResults(searchResults.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId))
      setSearchResults(searchResults.filter((user) => user.id !== userId))
    }
  }

  const handleAddCredits = (amount: number) => {
    if (creditsUser) {
      const updatedUser = {
        ...creditsUser,
        credits: creditsUser.credits + amount,
      }
      handleEditUser(updatedUser)
    }
  }

  const handleEditLibrary = (updatedLibrary: Library) => {
    setLibraries(libraries.map((lib) => (lib.id === updatedLibrary.id ? updatedLibrary : lib)))
  }

  const handleFilterBookings = (libraryId: string, startDate: string, endDate: string) => {
    const library = libraries.find((lib) => lib.id === libraryId)
    if (!library) return

    const start = new Date(startDate)
    const end = new Date(endDate)

    const filtered = bookings.filter((booking) => {
      if (booking.libraryId !== libraryId) return false
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return (
        booking.status === "active" &&
        ((bookingStart >= start && bookingStart <= end) || (bookingEnd >= start && bookingEnd <= end))
      )
    })

    setFilteredBookings(filtered)
    setSelectedLibraryName(library.name)
    setHasFilteredBookings(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Library Management System
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Admin Dashboard
            </p>
          </div>

          <button
            onClick={async () => {
              await fetch('/auth/logout', { method: 'GET' })
              window.location.href = '/'
            }}
            className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 px-4 py-2 rounded cursor-pointer"
          >
            Logout
          </button>
        </div>

      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="libraries" className="flex items-center gap-2">
              <LibraryIcon className="h-4 w-4" />
              Libraries
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Search Users</h2>
              <UserSearch onSearch={handleSearch} />
            </div>

            {hasSearched && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Search Results ({searchResults.length})</h2>
                </div>
                {searchResults.length === 0 ? (
                  <div className="bg-card border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((user) => (
                      <div key={user.id} className="relative">
                        <UserDetailsCard user={user} onEdit={setEditingUser} onDelete={handleDeleteUser} />
                        <Button variant="secondary" className="w-full mt-2" onClick={() => setCreditsUser(user)}>
                          Add Credits
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="libraries" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Libraries ({libraries.length})</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {libraries.map((library) => (
                <LibraryCard
                  key={library.id}
                  library={library}
                  onEdit={setEditingLibrary}
                  onManageAdmins={setManagingAdmins}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Filter Active Bookings</h2>
              <BookingFilters libraries={libraries} onFilter={handleFilterBookings} />
            </div>

            {hasFilteredBookings && <BookingsTable bookings={filteredBookings} libraryName={selectedLibraryName} />}
          </TabsContent>
        </Tabs>
      </main>

      <UserEditDialog
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleEditUser}
      />

      <AddCreditsDialog
        open={!!creditsUser}
        userName={creditsUser?.name || ""}
        currentCredits={creditsUser?.credits || 0}
        onClose={() => setCreditsUser(null)}
        onAdd={handleAddCredits}
      />

      <LibraryEditDialog
        library={editingLibrary}
        open={!!editingLibrary}
        onClose={() => setEditingLibrary(null)}
        onSave={handleEditLibrary}
      />

      <ManageAdminsDialog
        library={managingAdmins}
        open={!!managingAdmins}
        onClose={() => setManagingAdmins(null)}
        onSave={handleEditLibrary}
      />
    </div>
  )
}

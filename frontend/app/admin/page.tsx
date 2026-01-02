"use client"

import { useEffect, useState } from "react"
import type { User, Library, Booking } from "@/types"
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
import { searchUsers } from "@/actions/users"
import { fetchLibraries } from "@/actions/libraries"
import { fetchBookings } from "@/actions/bookings"

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [libraries, setLibraries] = useState<Library[]>([])
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
    searchUsers(searchType, searchValue).then((results) => {
      setSearchResults(results.Users?.map((u: any) => ({
        Id: u.Id,
        Name: u.Name,
        Email: u.Email,
        PhoneNumber: u.PhoneNumber,
        MemberId: u.MemberId,
        UserName: u.UserName,
        CreatedAt: u.CreatedAt,
      })) || [])
      setHasSearched(true)
    }).catch((error: Error) => {
      console.error("Error searching users:", error)
      setSearchResults([])
      setHasSearched(true)
    })
  }

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map((user) => (user.Id === updatedUser.Id ? updatedUser : user)))
    setSearchResults(searchResults.map((user) => (user.Id === updatedUser.Id ? updatedUser : user)))
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.Id !== userId))
      setSearchResults(searchResults.filter((user) => user.Id !== userId))
    }
  }

  const handleAddCredits = (amount: number) => {
    if (creditsUser) {
      const updatedUser = {
        ...creditsUser,
        Credits: creditsUser.Credits + amount,
      }
      handleEditUser(updatedUser)
    }
  }

  const handleEditLibrary = (updatedLibrary: Library) => {
    setLibraries(libraries.map((lib) => (lib.id === updatedLibrary.id ? updatedLibrary : lib)))
  }

  const handleFilterBookings = (libraryId: number, startDate: string, endDate: string) => {
    const library = libraries.find((lib) => lib.id === libraryId)
    if (!library) return

    fetchBookings(libraryId, startDate, endDate).then((data) => {
      setFilteredBookings(data.Bookings?.map((b: any) => ({
        id: b.Id,
        userId: b.UserId,
        memberId: b.MemberId,
        libraryId: b.LibraryId,
        userName: b.UserName,
        startTime: b.StartTime,
        endTime: b.EndTime,
        status: b.Status,
      })) || [])

      setSelectedLibraryName(library.name)
      setHasFilteredBookings(true)
    }).catch((error: Error) => {
      console.error("Error fetching bookings:", error)
      setFilteredBookings([])
      setHasFilteredBookings(true)
    })
  }

  useEffect(() => {
    fetchLibraries("", true).then((libs) => {

      setLibraries(libs?.Libraries?.map((lib: any) => ({
        id: lib.Id,
        name: lib.Name,
        address: lib.Address,
        latitude: lib.Latitude,
        longitude: lib.Longitude,
        admins: lib.Admins || [],
      })) || [])
    }).catch((error: Error) => {
      console.error("Error fetching libraries:", error)
      setLibraries([])
    })
  }, [])


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

          <div>
            <Button
              onClick={async () => {
                window.location.href = '/'
              }}
              variant={"ghost"}
              className="cursor-pointer"
            >
              Home
            </Button>

            <Button
              onClick={async () => {
                await fetch('/auth/logout', { method: 'GET' })
                window.location.href = '/'
              }}
              variant={"default"}
              className="cursor-pointer"
            >
              Logout
            </Button>
          </div>
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
                      <div key={user.Id} className="relative">
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
        userName={creditsUser?.Name || ""}
        currentCredits={creditsUser?.Credits || 0}
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

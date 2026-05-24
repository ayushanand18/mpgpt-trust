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
import { Users, LibraryIcon, Calendar, CreditCard } from "lucide-react"
import { toast } from "sonner";
import { editUser, searchUsers } from "@/actions/users"
import { editLibrary, fetchLibraries, createLibrary } from "@/actions/libraries"
import { fetchBookings } from "@/actions/bookings"
import { addCredits } from "@/actions/credits"
import { PaymentsManager } from "@/components/admin/payments-manager"
import { handleApiError } from "@/lib/error-handler";
import { Plus } from "lucide-react"

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [libraries, setLibraries] = useState<Library[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [creditsUser, setCreditsUser] = useState<User | null>(null)
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null)
  const [isCreateLibraryOpen, setIsCreateLibraryOpen] = useState(false)
  const [managingAdmins, setManagingAdmins] = useState<Library | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [selectedLibraryName, setSelectedLibraryName] = useState("")
  const [hasFilteredBookings, setHasFilteredBookings] = useState(false)

  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [isLoadingEditUser, setIsLoadingEditUser] = useState(false)
  const [isLoadingAddCredits, setIsLoadingAddCredits] = useState(false)
  const [isLoadingLibraryAction, setIsLoadingLibraryAction] = useState(false)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)

  const handleSearch = (searchType: string, searchValue: string) => {
    setIsLoadingSearch(true)
    searchUsers(searchType, searchValue).then((results) => {
      setSearchResults(results.Users?.map((u: any) => ({
        Id: u.id,
        MemberId: u.member_id,
        Name: u.name,
        Email: u.email,
        PhoneNumber: u.phone_number,
        CreatedAt: u.created_at,
        Credits: u.credits,
        Role: u.role,
      })) || [])
      setHasSearched(true)
    }).catch((error) => {
      handleApiError(error, "Failed to search users");
      setSearchResults([]);
      setHasSearched(true);
    }).finally(() => setIsLoadingSearch(false));
  };

  const handleEditUser = (updatedUser: User) => {
    setIsLoadingEditUser(true)
    editUser(updatedUser).then(() => {
      setUsers(users.map((user) => (user.Id === updatedUser.Id ? updatedUser : user)))
      setSearchResults(searchResults.map((user) => (user.Id === updatedUser.Id ? updatedUser : user)))
      toast.success("Success", { description: "User updated successfully" })
    }).catch((error) => {
      handleApiError(error, "Failed to edit user");
    }).finally(() => setIsLoadingEditUser(false));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.Id !== userId))
      setSearchResults(searchResults.filter((user) => user.Id !== userId))
    }
  }

  const handleAddCredits = (amount: number, utrNumber: string, comment: string) => {
    if (creditsUser) {
      setIsLoadingAddCredits(true)
      addCredits(creditsUser, amount, utrNumber, comment).then(() => {
        toast.success("Success", { description: "Credits added successfully" })
      }).catch((error) => {
        handleApiError(error, "Failed to add credits");
      }).finally(() => setIsLoadingAddCredits(false));
    }
  }

  const handleSaveLibrary = (libraryData: Library) => {
    setIsLoadingLibraryAction(true)
    if (libraryData.id) {
      // Update existing
      editLibrary(libraryData).then(() => {
        setLibraries(libraries.map((lib) => (lib.id === libraryData.id ? libraryData : lib)))
        toast.success("Success", { description: "Library updated successfully" })
      }).catch((error) => {
        handleApiError(error, "Failed to edit library");
      }).finally(() => setIsLoadingLibraryAction(false));
    } else {
      // Create new
      createLibrary(libraryData).then((data) => {
        const newLib = data.Library
        const formattedLib = {
          id: newLib.id,
          name: newLib.name,
          address: newLib.address,
          latitude: newLib.latitude,
          longitude: newLib.longitude,
          admins: [],
        }
        setLibraries([...libraries, formattedLib])
        toast.success("Success", { description: "Library created successfully" })
      }).catch((error) => {
        handleApiError(error, "Failed to create library");
      }).finally(() => setIsLoadingLibraryAction(false));
    }
  };

  const handleFilterBookings = (libraryId: number, startDate: string, endDate: string) => {
    setIsLoadingBookings(true)
    fetchBookings(libraryId, startDate, endDate).then((data) => {
      setFilteredBookings(data?.map((b: any) => ({
        id: b.id,
        memberId: b.member_id,
        libraryId: parseInt(b.library_id),
        userName: b.user_name,
        startTime: b.start_time,
        endTime: b.end_time,
        status: b.status as "active" | "completed" | "cancelled",
      })) || [])

      const library = libraries.find((lib) => lib.id === libraryId)
      setSelectedLibraryName(library?.name ?? "Unknown Library")
      setHasFilteredBookings(true)
    }).catch((error) => {
      handleApiError(error, "Failed to fetch bookings");
      setFilteredBookings([]);
      setHasFilteredBookings(true);
    }).finally(() => setIsLoadingBookings(false));
  };

  useEffect(() => {
    fetchLibraries("", true).then((libs) => {
      setLibraries(libs?.Libraries?.map((lib: any) => ({
        id: lib.id,
        name: lib.name,
        address: lib.address,
        latitude: lib.latitude,
        longitude: lib.longitude,
        admins: lib.admins,
      })) || [])
    }).catch((error) => {
      handleApiError(error, "Error fetching libraries");
      setLibraries([]);
    });
  }, []);


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
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
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
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Search Users</h2>
              <UserSearch onSearch={handleSearch} disabled={isLoadingSearch} />
            </div>

            {isLoadingSearch && <div className="text-center py-4">Searching users...</div>}

            {hasSearched && !isLoadingSearch && (
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
                          {isLoadingAddCredits ? "Processing..." : "Add Credits"}
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
              <Button onClick={() => setIsCreateLibraryOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Library
              </Button>
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

          <TabsContent value="payments" className="space-y-6">
            <PaymentsManager />
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
        open={!!editingLibrary || isCreateLibraryOpen}
        onClose={() => {
          setEditingLibrary(null)
          setIsCreateLibraryOpen(false)
        }}
        onSave={handleSaveLibrary}
      />

      <ManageAdminsDialog
        library={managingAdmins}
        open={!!managingAdmins}
        onClose={() => setManagingAdmins(null)}
        onSave={handleSaveLibrary}
      />
    </div>
  )
}

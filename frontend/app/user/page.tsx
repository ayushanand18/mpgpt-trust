"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/user/user-profile"
import { BookingManager } from "@/components/user/booking-manager"
import { CreditsManager } from "@/components/user/credits-manager"
import { User, Calendar, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getUser } from "@/actions/users"
import { CreateUserAccount } from "@/components/user/create-account"
import { Button } from "@/components/ui/button"
import { UserData } from "@/types/index"

export default function UserPanelPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error fetching user data:', error.message)
        return
      }

      if (data) {
        const user = await getUser(data.session?.access_token, data.session!.user.id)

        const userD = {
          id: user.User.Id,
          email: user.User.Email,
          phone: user.User.PhoneNumber,
          name: user.User.Name,
          memberId: user.User.MemberId,
          address: "",
          city: "",
          zipCode: "",
        }

        setUserData(userD)
      }
    }

    fetchUserData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Library Management Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, manage your library account
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

      <main className="container mx-auto px-4 py-8">
        {userData && userData.id?.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="credits" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Credits</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <UserProfile userDataProp={{ userData, setUserData }} />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingManager />
            </TabsContent>

            <TabsContent value="credits">
              <CreditsManager />
            </TabsContent>
          </Tabs>)}

        {userData && userData.id?.length <= 0 && (
          <CreateUserAccount />)}

        {!userData && (<div>Loading</div>)}
      </main>
    </div>
  )
}

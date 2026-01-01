"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/user/user-profile"
import { BookingManager } from "@/components/user/booking-manager"
import { CreditsManager } from "@/components/user/credits-manager"
import { User, Calendar, Wallet } from "lucide-react"

export default function UserPanelPage() {
  const [activeTab, setActiveTab] = useState("profile")

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

      <main className="container mx-auto px-4 py-8">
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
            <UserProfile />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManager />
          </TabsContent>

          <TabsContent value="credits">
            <CreditsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

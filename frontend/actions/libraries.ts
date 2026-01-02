
import { createClient } from "@/lib/supabase/client"
import { Library } from "@/types"
const supabase = createClient()

export async function fetchLibraries(searchTerm: string, fetchAdmins: boolean = false) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/libraries`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                LibraryName: searchTerm,
                FetchAdminMappings: fetchAdmins, 
            })
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to fetch library: ${res.status}`)
    }

    const respJson = await res.json()

    return respJson.Data
}

export async function createBooking(libraryId: number, date: string, purpose: string) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    const start = new Date(`${date}T00:00:00Z`).toISOString()
    const end = new Date(new Date(`${date}T00:00:00Z`).setUTCDate(new Date(`${date}T00:00:00Z`).getUTCDate() + 1)).toISOString()

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                StartTime: start,
                EndTime: end,
                LibraryId: libraryId,
                Purpose: purpose,
            })
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to create booking: ${res.status}`)
    }

    const respJson = await res.json()

    return respJson.Data
}

export async function addAdminLibMapping(libraryId: number, adminId: string) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/library/admin`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                LibraryId: libraryId,
                MemberId: adminId,
            })
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to add admin mapping: ${res.status}`)
    }

    const respJson = await res.json()

    return respJson.Data
}

export async function editLibrary(library: Library) {
    console.log("Editing library:", library)
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/library`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                Id: library.id,
                Name: library.name,
                Address: library.address,
                Latitude: library.latitude,
                Longitude: library.longitude,
            })
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to edit library: ${res.status}`)
    }

    const respJson = await res.json()
    return respJson.Data
}
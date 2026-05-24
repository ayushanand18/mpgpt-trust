
import { createClient } from "@/lib/supabase/client"
import { Library } from "@/types"
const supabase = createClient()

export async function fetchLibraries(searchTerm: string, fetchAdmins: boolean = false) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `/api/libraries`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        `/api/booking`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                StartTime: start,
                EndTime: end,
                LibraryId: libraryId,
                Purpose: purpose,
                MemberId: session?.user.id,
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
        `/api/library/admin`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
        `/api/library`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
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

    const respJson = await res.json()
    return respJson.Data
}

export async function createLibrary(library: Partial<Library>) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `/api/library`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Name: library.name,
                Address: library.address,
                Latitude: library.latitude,
                Longitude: library.longitude,
                Status: 'active',
                Remarks: 0
            })
        }
    )

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw errorData;
    }

    const respJson = await res.json()
    return respJson.Data
}
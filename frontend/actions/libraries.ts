
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

export async function createBooking(
    libraryId: number,
    date: string,
    slots: { firstHalf: boolean; secondHalf: boolean },
    purpose: string,
) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    // IST slots: 1st half 6am–12pm, 2nd half 12pm–6pm
    const startHour = slots.firstHalf ? "06:00:00" : "12:00:00"
    const endHour = slots.secondHalf ? "18:00:00" : "12:00:00"
    const start = new Date(`${date}T${startHour}+05:30`).toISOString()
    const end = new Date(`${date}T${endHour}+05:30`).toISOString()

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
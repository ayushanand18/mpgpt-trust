import { createClient } from "@/lib/supabase/client"
import { Booking } from "@/types"
const supabase = createClient()

export async function fetchBookings(libraryId?: number, startDate?: string, endDate?: string): Promise<Booking[]> {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    let req: unknown = {}
    if (!startDate || !endDate) {
        const start = new Date(new Date().setUTCMonth(new Date().getUTCMonth() - 3)).toISOString()
        const end = new Date(new Date().setUTCMonth(new Date().getUTCMonth() + 3)).toISOString()
        req = {
            StartTime: start,
            EndTime: end,
        }
    } else {
        const start = new Date(startDate).toISOString()
        const end = new Date(endDate).toISOString()
        req = {
            LibraryId: libraryId,
            StartTime: start,
            EndTime: end,
        }
    }

    const res = await fetch(
        `/api/bookings`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req)
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to fetch bookings: ${res.status}`)
    }

    const respJson: { Data: { Bookings: Booking[] } } = await res.json()

    return respJson.Data.Bookings
}


import { createClient } from "@/lib/supabase/client"
const supabase = createClient()

export async function fetchBookings() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    const start = new Date(new Date().setUTCMonth(new Date().getUTCMonth() - 3)).toISOString()
    const end = new Date(new Date().setUTCMonth(new Date().getUTCMonth() + 3)).toISOString()

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                StartTime: start,
                EndTime: end,
            })
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to create booking: ${res.status}`)
    }

    const respJson = await res.json()

    return respJson.Data
}


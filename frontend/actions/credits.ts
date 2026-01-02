import { createClient } from "@/lib/supabase/client"
import { User } from "@/types"

const supabase = createClient()

export async function fetchCredits() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${session?.user.id}/credits`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
            },
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to fetch credits: ${res.status}`)
    }

    const respJson = await res.json()

    return respJson.Data
}

export async function addCredits(user: User, amount: number, utrNumber: string, comment: string) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
        throw new Error('No active session found')
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${user.Id}/credits`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
                CreditsAmount: amount,
                MemberId: user.MemberId,
                RefNumber: utrNumber,
                Comment: comment,
            })
        }
    )

    if (!res.ok) {
        throw new Error(`Failed to add credits: ${res.status}`)
    }

    const respJson = await res.json()
    return respJson.Data
}